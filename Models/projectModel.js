import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
    siteId:{
        type:String,
        required:true,
        unique:true,
    },
    sitePassword:{
        type:String,
        required:true
    },
    password:{
        type:String
    },
    location:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    status:{
        type:String,
        required:true,
        enum: ['Pending','In Progress','Completed','On Hold','Cancelled'],
        default: 'Pending'
    }
},{timestamps:true});

const Project = mongoose.model('Project', projectSchema);

export default Project;