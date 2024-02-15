import { login } from "../controllers/loginUser";
import { loginController, registerController } from "../models/User";

const express = require('express');
const router = express.Router();
console.log('users route');

router.post('/', registerController)
// router.post('/login', loginController)
router.post('/login', login)

module.exports = router;
