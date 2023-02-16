const mongoose = require('mongoose')

const connection =  () => {
    mongoose.connect("mongodb://127.0.0.1:27017/NODELIST", {
        useNewUrlParser: true
    }).then((connect) => console.log('connected to mongodb'))
        .catch(err => console.log('mongodb connection failed', err))
    mongoose.Promise = global.Promise
}
mongoose.set('strictQuery', false)
module.exports = connection