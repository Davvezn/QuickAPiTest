import mongoose from "mongoose";

const warehouseSchema = new mongoose.Schema({
    location: {type: String, required: true},
    name: {type: String, required: true}
});

const Warehouse = mongoose.model('Warehouse', warehouseSchema);
export default Warehouse;