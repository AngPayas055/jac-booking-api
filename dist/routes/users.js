"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const User_1 = require("../models/User");
const express = require('express');
const router = express.Router();
console.log('users route');
router.post('/', User_1.registerController);
module.exports = router;
