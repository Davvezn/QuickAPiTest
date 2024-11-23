import mongoose from "mongoose";
import Elysia from "elysia";
import Driver from "./models/drivers";
import Product from "./models/product";
import Picker from "./models/pickers";
import Order from "./models/orders";
import Warehouse from "./models/warehouse";

const db = await mongoose.connect('mongodbConnectionLink')

new Elysia()
    .post('/Drivers', async ({ body, set }) => {
        const driver = new Driver(body);
        try {
            await driver.save();
        } catch(error) {
            set.status = 422;
            return error;
        }
        return driver;
    })
    .post('/Pickers', async({body, set}) => {
        const picker = new Picker(body);
        try {
            await picker.save()
        } catch (error) {
            set.status = 422;
            return error;
        }
    })
    .post('/Products', async({ body, set }) => {
        const product = new Product(body);
        try {
            await product.save();
        } catch (error) {
            set.status = 422;
            return error;
        }
        return product;
    })
    .post('/Warehouses', async({body, set}) => {
        const warehouse = new Warehouse(body);
        try {
            await warehouse.save();
        } catch (error) {
            set.status = 422;
            return error;
        }
        return warehouse;
    })
    .get('/Drivers', async ({body}) => {
        const allDrivers = await Driver.find();
        return(allDrivers)
    })
    .get('/Drivers/:workDay', async({ params }: { params: { workDay: string}}) => {
        try {
            const requestedDay = params.workDay.toLowerCase();
            const driversToday = await Driver.find({ workDays: requestedDay});
            return (driversToday);
        } catch (error) {
            return error;
        }
    })
    .get('ProductsStock/:productName', async({params, set}) => {
        try {
            const productName = params.productName;

            const product = await Product.findOne({ name: productName }).populate<{warehouse: {_id: string; name: string; location: string } } > ('warehouse');

            if(!product) {
                set.status = 404;
                return {message: 'Product "${productName}" not found'};
            }

            if (!product.warehouse) {
                return {
                    name: product.name,
                    inStock: product.amount > 0,
                    message: "No Warehouse assigned for this product",
                };
            }

            return {
                name: product.name,
                inStock: product.amount > 0,
                warehouse: {
                    id: product.warehouse._id,
                    location: product.warehouse.location,
                    name: product.warehouse.name,
                },
            };

        } catch (error) {
            set.status = 500;
            return { message: "an error has occured while fetching product stock information", error: error.message };
        }
    })
    .get('/AvailablePickers', async()=> {
        try {
            const availablePickers = await Picker.find({ isAvailable: true});

            if (availablePickers.length === 0) {
                return { message: 'no available pickers at the moment'};
            }
        } catch (error) {
            return{ message: 'an error occured', error: error.message}
        }
    })
    .get('/ProductsAll', async() => {
        const allProducts = await Product.find().populate('warehouse');
        return(allProducts)
    })
    .put('/Drivers/:driverId', async({ params, body }) => {
        const updatedDriver = await Driver.findByIdAndUpdate(
           params.driverId,
           body,
           {new: true}
        );
        if (!updatedDriver) {
            return {
                status: 404,
                message: 'Driver not found by db _id'
            }
        };
        return(updatedDriver);
    })
    .post('/Orders', async ({ body, set }) => {
        try {
            const { items, destination } = body;
    
            const picker = await Picker.findOne({ isAvailable: true });
            if (!picker) throw new Error("No available pickers");
    
            // Fetch products and populate 'warehouse' field
            const products = await Product.find({ name: { $in: items } }).populate('warehouse');
            if (products.length !== items.length) throw new Error("Some items are not available");
    
            const warehouses = new Set();
    
            // Check the warehouse for each product and ensure it's available
            for (const product of products) {
                if (product.amount < 1) throw new Error(`No ${product.name} in stock`);
    
                if (!product.warehouse) {
                    throw new Error(`Product ${product.name} does not have an assigned warehouse`);
                }
    
                warehouses.add(product.warehouse._id.toString());
            }
    
            const todayDayName = new Date().toLocaleString("en-US", { weekday: "long" }).toLowerCase();
            const driver = await Driver.findOne({ isAvailable: true, workDays: todayDayName });
            if (!driver) throw new Error("No driver available");
    
            const order = await Order.create({
                items,
                destination,
                picker: picker._id,
                warehouse: Array.from(warehouses),
                driver: driver._id,
            });
    

            picker.isAvailable = false;
            await picker.save();
    
            driver.isAvailable = false;
            await driver.save();
    
            for (const product of products) {
                product.amount -= 1;
                await product.save();
            }
    
            set.status = 201;
            return { message: "Order created and assigned successfully", order };
        } catch (error) {
            set.status = 422;
            return { status: "error", message: error.message };
        }
    })
    


    .listen(3033)