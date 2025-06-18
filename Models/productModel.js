import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    productName:{
        type: String,
        required: true,
        unique: true
    },
    productImg:{
        type: String
    },
    UnitofMeasurement:{
        type: String,
        Units:["kg","m","bag","ton","piece","roll","box","litre","sq.ft","null"],
    },
    category:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Category",
        required: true
    }],
    description:{
        type: String,
        required: true
    },
},{timestamps: true});

const Product = mongoose.model("Product", productSchema);

export default Product;