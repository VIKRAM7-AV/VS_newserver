import mongoose from 'mongoose';

const EquipementsSchema = new mongoose.Schema({
    EquipementsId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    },
    from: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'Project',
        required: true
    },
    to: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'Project',
        required: true
    },
    name: {
        type: [mongoose.Schema.Types.String],
        ref:'User',
        required: true
    },
    date: {
        type:[Date]
    }
},{timestamps: true});

const Equipements = mongoose.model('Equipements', EquipementsSchema);
export default Equipements;