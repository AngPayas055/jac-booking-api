import { forgotPasswordController, loginController, registerController, resetPasswordController } from "../models/User";

const express = require('express');
const router = express.Router();
console.log('users route loaded');

router.post('/', registerController)
router.post('/login', loginController)
router.post('/forgotpassword', forgotPasswordController)
router.post('/resetPassword', resetPasswordController)

module.exports = router;
