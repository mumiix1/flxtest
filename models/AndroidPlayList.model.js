const mongoose = require('mongoose');
let PlayListSchema=require('./PlayListSchema');
module.exports = mongoose.model('AndroidPlayList', PlayListSchema);