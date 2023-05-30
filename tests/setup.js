jest.setTimeout(60000);

require('../models/User'); //By requiring without varibale it just execute the model file and make avilable the output

const mongoose = require('mongoose');
const keys = require('../config/keys');
 
mongoose.Promise = global.Promise; // Telling mongoose to make use of nodejs global promise object
mongoose.connect(keys.mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
 
afterAll(async () => {
  await mongoose.disconnect();
});