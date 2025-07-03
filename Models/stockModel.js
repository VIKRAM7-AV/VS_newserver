import mongoose from 'mongoose';

// Each entry will have a materialId (e.g., cement/sand/steel) and values (array of numbers)
const materialEntrySchema = new mongoose.Schema({
  materialId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',  
    required: true,
  },
  description:{
  type: [String],
  required: true
  },
  values: {
    type: [Number],
    default:[],
  },
  Stock: {
    type: [Number],
    default: [],
  },
  inbound: {
    type: [Number],
    default:[],
  },
  outbound: {
    type: [Number],
    default:[],
  },
  date: {
    type: [Date],
    default:[],
  }
});

const stackDataSchema = new mongoose.Schema({
  siteId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
  },
  type: {
    type: [materialEntrySchema],  // array of material entries
    default: [],
  }  
},{timestamps: true});

const StackData = mongoose.model('StackData', stackDataSchema);


export default StackData;