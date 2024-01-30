import { MongoClient } from "mongodb";
import mongoose from "mongoose";

const express = require('express');
const body = require('body-parser');
var dotenv = require('dotenv');
dotenv.config();
var url = process.env.MONGODB_URI;

const local = 8080
const dev = "https://jac-booking-api.vercel.app/"

console.log(url)
export const app = express();
app.use(body.json({
  limit: '500kb'
}))
app.get('/', (req, res) => {  
  res.send("api running")
})
app.use('/customers', require('./routes/customers'));

app.listen(local, async () => {
  console.log('testmongo con')
  try{
    if (!url) throw new Error('Mongo URI unavailable');
    await mongoose.connect(url);
  
    console.log('Server is running on port 3000');

  }catch (error) {
    console.error(error || "error connecting to mongodb");
  }
})

// export async function start() {
//   try{
//     const app = express();
//     app.use(body.json({
//       limit: '500kb'
//     }))
//     app.use('/customers', require('./routes/customers'));

//     app.listen(local, async () => {
//       if (!url) throw new Error('Mongo URI unavailable');
//       await mongoose.connect(url);

//       console.log('Server is running on port 3000');
//     })
//   }catch(error){
//     console.log(error);
//   }
// }
// start();