"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const path_1 = __importDefault(require("path"));
const express = require('express');
const body = require('body-parser');
const dotenv = require('dotenv');
dotenv.config();
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('../swagger.json');
const app = express();
const publicPath = path_1.default.join(__dirname, '..', 'public');
const port = process.env.PORT;
const url = process.env.MONGODB_URI;
;
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use(express.static(publicPath));
app.use(body.json({
    limit: '500kb'
}));
app.get('/', (req, res) => {
    res.sendFile(path_1.default.join(publicPath, 'index.html'));
});
app.use('/customers', require('./routes/customers'));
app.use('/users', require('./routes/users'));
app.listen(port, () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!url)
            throw new Error('Mongo URI unavailable');
        yield mongoose_1.default.connect(url);
        console.log(`Server is running on http://localhost:${port}`);
    }
    catch (error) {
        console.error(error || "error connecting to mongodb");
    }
}));
