import { loginController, registerController } from "../models/User";

const express = require('express');
const router = express.Router();
console.log('users route loaded');

router.post('/', registerController)
router.post('/login', loginController)

module.exports = router;
