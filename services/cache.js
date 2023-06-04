//Overwriting the mongoose function with our custom implementation to cater our
//Caching needs.
const mongoose = require('mongoose');
const redis = require('redis');
const util = require('util');
const keys = require('../config/keys');


const client = redis.createClient(keys.redisUrl);
//client.get = util.promisify(client.get); //no longer using 'get' after introducing programetic cach epiry
client.hget = util.promisify(client.hget);


const exec = mongoose.Query.prototype.exec;

mongoose.Query.prototype.cache = function(options={}){
    this.useCache = true; //this>> query instance

    //Key for top label key in caching
    this.hashKey = JSON.stringify(options.key || ''); //u can use anynam instead of hashKey
    return this; //To make this functio chainable E: Query.cache().limit().sort()
}

// We are not using 'arrow' fun bcz it will mess around with 'this' function
mongoose.Query.prototype.exec = async function(){
    // console.log('I AM ABOUNT RUN A QUERY');
    // console.log(this.getQuery()); //Example: { _id: '6459dc8d06fee61854249f5f' }
    // console.log(this.mongooseCollection.name); // <blogs/user>

    //Toggling cache(only run cache on queries that are falgged with .cache)
    if(!this.useCache === false){
       return exec.apply(this, arguments);
    }
    
    //Using above two to generate unique cache key
    //Object.assign will copy getquery and mongoose colelction properties to empty object {}
    const key = JSON.stringify(Object.assign({}, this.getQuery(), {
        collection:this.mongooseCollection.name
    }));
    
    //see if we have a value for 'key' in redis
    //const cachedValue = await client.get(key);
    const cachedValue = await client.hget(this.hashKey, key);


    // RETRUN FROM REDIS
    //if we do return that
    if(cachedValue){
        //bcz the cachedValue is plain json and our app expecting a mongoose document to display
        const doc = JSON.parse(cachedValue);
        return Array.isArray(doc) 
            ? doc.map(d => new this.model(d)) 
            : new this.model(doc);
    }


    // GOES TO MONGODB //
    //otherwise issue the query and store the result in redis
    const result = await exec.apply(this, arguments);
    //console.log(result);
    //client.set(key, JSON.stringify(result), 'EX', 10);
    client.hset(this.hashKey, key, JSON.stringify(result), 'EX', 10);
    return result;

}

//Clearing Nestes Hashes
module.exports = {
    clearHash(hashKey){
        client.del(JSON.stringify(hashKey));
    }
};