import { registerController } from "../models/User";

const express = require('express');
const router = express.Router();
console.log('users route');

router.post('/', registerController)

module.exports = router;
