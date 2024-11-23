import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    items: [{ type: String, required: true}],
    destination: {type: String, required: true},
    picker: {type: mongoose.Schema.Types.ObjectId, ref: 'Picker'},
    warehouse: {type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse'},
    driver: {type: mongoose.Schema.Types.ObjectId, ref: 'Driver'},
    status: {type: String, default: 'Pending'}
})

const Order = mongoose.model('Order', orderSchema);
export default Order;