import { ObjectId } from "mongodb";
import customerModel from "../models/Customer";

export async function getCustomerController(req:any, res:any) {
  try{
    const { id } = req.params;

    if(!id){
      return res.status(400).json({ message: 'Customer ID is required' })
    }

    const result = await customerModel.findOne( {_id: new ObjectId(id)} );

    if(!result){
      return res.status(400).json({ message: 'Customer not found' })
    }
    res.status(200).json({ 
      message: "Customer retrieved",
      customer: result
     });
  }catch(error){
    res.status(500).json({ error: error.toString() })
  }
}