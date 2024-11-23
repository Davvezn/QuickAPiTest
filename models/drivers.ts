import mongoose from "mongoose";

const DriversSchema = new mongoose.Schema({
    name: {type: String, required: true},
    workDays: [String],
    workHours: [String],
    driverID: { type: String, required: true, unique: true},
    warehouse: {type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse'},
    isAvailable: {type: Boolean, default: true}
});

const Driver = mongoose.model('Driver', DriversSchema);
export default Driver;