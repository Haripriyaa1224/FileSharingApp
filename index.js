const express = require('express');
const fileRoutes = require('./routes/file');
const mongoose = require('mongoose');

const app = express();
const PORT = 8080;

app.use(express.json());

mongoose.connect("mongodb://localhost:27017/filesharingapp")
.then(()=>{console.log("DB connection established")})
.catch((err)=>{console.log("Error connecting to DB")})

app.use(fileRoutes);



app.listen(PORT, ()=>{
    console.log(`listening on port ${PORT}`);
})