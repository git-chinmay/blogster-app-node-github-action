const {clearHash} = require('../services/cache');

module.exports = async (req, res, next) => {
    await next(); //Wait untill the route handle bar(blogroute.js) post/blog completed
    //Then come back here and clena the cache
    clearHash(req.user.id);
};