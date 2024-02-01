import customerModel from "../models/Customer";

export async function getCustomersController(req:any, res:any) {
  try{    
    const result = await customerModel.find();
    res.status(200).json({ 
      message: "Customers retrieved",
      customers: result
     });
  }catch(error){
    res.status(500).json({ error: error.toString() })
  }
}