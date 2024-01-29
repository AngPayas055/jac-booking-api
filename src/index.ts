import { MongoClient } from "mongodb";

const express = require('express');
const body = require('body-parser');
var dotenv = require('dotenv');
dotenv.config();
var url = process.env.URI;

async function start() {
  try{
    const app = express();
    const mongo = await MongoClient.connect(url)
    await mongo.connect();
    app.db = mongo.db()
    app.use(body.json({
      limit: '500kb'
    }))
    //routes 
    app.use('/customers', require('./routes/customers'));
    app.listen(3001, () => {
      console.log('Server is running on port 3000');
    })
  }catch(error){
    console.log(error);
  }
}
start();