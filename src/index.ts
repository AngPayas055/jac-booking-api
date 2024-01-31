import mongoose from "mongoose";

const express = require('express');
const body = require('body-parser');
var dotenv = require('dotenv');
dotenv.config();
var url = process.env.MONGODB_URI;

const port = process.env.PORT

export const app = express();
import path from 'path';

const publicPath = path.join(__dirname, '..', 'public');
app.use(express.static(publicPath));

app.use(body.json({
  limit: '500kb'
}))

app.get('/', (req, res) => {  
  res.sendFile(path.join(publicPath, 'index.html'));
})

app.use('/customers', require('./routes/customers'));

app.listen(port, async () => {
  try{
    if (!url) throw new Error('Mongo URI unavailable');
    await mongoose.connect(url);
  
    console.log(`Server is running on http://localhost:${port}`);

  }catch (error) {
    console.error(error || "error connecting to mongodb");
  }
})
