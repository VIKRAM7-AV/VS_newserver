import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
    categoryName:{
        type: String,
        required: true,
        unique: true,
    },
    description:{
        type: String,
        required: true,
    },
    categoryImg:{
        type: String,
    },
    status:{
        type: String,
        enum: ['active', 'inactive'],
        default: 'active',
    },
    allproducts:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
    }],
    assigned_products:{
        type: Number,
        default: 0,
    }

},{timestamps:true});


const Category= mongoose.model('Category', categorySchema);

export default Category;