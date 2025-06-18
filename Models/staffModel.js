import mongoose from 'mongoose';

const staffSchema = new mongoose.Schema({
    Name:{
        type: String,
        required: true
    },
    Age:{
        type: Number,
        required: true
    },
    PhoneNo:{
        type: Number,
        required: true
    },
    jobrole:{
        type: String,
        required: true
    },
    Attenance:{
        type: String,
        enum:['Present', 'Absent']
    },
    remarks:{
        type: String
    },
    site:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true
    },
    presentDate:{
        type: [Date],
        default: []
    },
    absentDate:{
        type: [Date],
        default: []
    },
},{timestamps:true})

const Staff = mongoose.model('Staff', staffSchema);

export default Staff;