const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name:String,

    price:Number,
    category:String,
    userId:String,
    brand:String,
})


module.exports = mongoose.model('products', userSchema);
