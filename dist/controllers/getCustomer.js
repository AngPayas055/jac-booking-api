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
exports.getCustomerController = void 0;
const mongodb_1 = require("mongodb");
const Customer_1 = __importDefault(require("../models/Customer"));
function getCustomerController(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { id } = req.params;
            if (!id) {
                return res.status(400).json({ message: 'Customer ID is required' });
            }
            const result = yield Customer_1.default.findOne({ _id: new mongodb_1.ObjectId(id) });
            if (!result) {
                return res.status(400).json({ message: 'Customer not found' });
            }
            res.status(200).json({
                message: "Customer retrieved",
                customer: result
            });
        }
        catch (error) {
            res.status(500).json({ error: error.toString() });
        }
    });
}
exports.getCustomerController = getCustomerController;
