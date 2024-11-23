import mongoose from "mongoose";

const PickerSchmema = new mongoose.Schema({
    name: {type: String, required: true},
    workDays: [String],
    isAvailable: {type: Boolean, default: true},
    assignedOrders: {type: mongoose.Schema.Types.ObjectId, ref: 'Order'},
    warehouse: {type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse'}
});

const Picker = mongoose.model('Picker', PickerSchmema);
export default Picker;