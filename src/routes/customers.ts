import { createCustomerController } from "../controllers/createCustomer";
import { getCustomerController } from "../controllers/getCustomer";
import { getCustomersController } from "../controllers/getCustomers";
import { authenticateToken } from "../utils/middleware";

const express = require('express');
const router = express.Router();
console.log('customers route loaded');

router.post('/', createCustomerController)
router.get('/', getCustomersController)
router.get('/:id', getCustomerController)

module.exports = router;