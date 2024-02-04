import mongoose from "mongoose";
import path from 'path';
import swaggerDocs from "./utils/swagger";

const express = require('express');
const body = require('body-parser');
const dotenv = require('dotenv');
dotenv.config();

const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('../swagger.json');
const app = express();
const publicPath = path.join(__dirname, '..', 'public');
const port = process.env.PORT
const url = process.env.MONGODB_URI;;

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
console.log(`Docs available at http://localhost:${port}/api-docs`)
app.use(express.static(publicPath));
app.use(body.json({
  limit: '500kb'
}))

app.get('/', (req, res) => {  
  res.sendFile(path.join(publicPath, 'index.html'));
})
app.use('/customers', require('./routes/customers'));
app.use('/users', require('./routes/users'));

app.listen(port, async () => {
  try{
    if (!url) throw new Error('Mongo URI unavailable');
    await mongoose.connect(url);
  
    console.log(`Server is running on http://localhost:${port}`);
    // swaggerDocs(app, port)

  }catch (error) {
    console.error(error || "error connecting to mongodb");
  }
})
