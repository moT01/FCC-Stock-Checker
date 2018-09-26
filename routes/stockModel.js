const mongoose = require('mongoose');

var Schema = mongoose.Schema;

var stockSchema = new Schema({
  stock: {
    type: String
  },
  likes: {
    type: Number,
    default: 0
  },
  likeIPs: []
})

module.exports = mongoose.model('stockModel', stockSchema);