const mongoose = require('mongoose');

const Schema = mongoose.Schema

const BlogSchema = new Schema({
    blogId: {
        type: String,
        unique: true,
      required: true,
    },
    title: {
        type: String,
        required: true,
        unique: true
    },
    
    details: {
        type: String,
        required: true
    },
    image: {
        type:String
    },
    author: {
        type: String,
        required: true
    }
})

const BlogModel = mongoose.model('blog', BlogSchema)
module.exports = BlogModel