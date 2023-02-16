const express = require('express');
const dotenv = require('dotenv')

const adminRoutes = require('./routes/adminRoute')
const app = require('./routes/route')
app.use('/admin', adminRoutes)

    
dotenv.config()
const connection = require('./connection/db')
// app.use('/static',express.static('static'))
connection()

app.use(express.static('static'))



app.listen(3000, () => console.log('server listnening at port 3000'))