import mongoose from 'mongoose'

const Schema = mongoose.Schema;
const model = mongoose.model;

const customerSchema = new Schema({
  email: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  phone: {
    type: String
  },
  address: {
    type: String
  }
})

const customerModel = model('customer', customerSchema, 'customer');

export default customerModel