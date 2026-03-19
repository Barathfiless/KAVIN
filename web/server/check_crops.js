const mongoose = require('mongoose');
const mongooseUri = 'mongodb+srv://KAVIN:KAVINM@cluster0.xxd9fwl.mongodb.net/Farmerapp?retryWrites=true&w=majority&appName=Cluster0';

async function checkCrops() {
    try {
        await mongoose.connect(mongooseUri);
        const Crop = mongoose.model('Crop', new mongoose.Schema({ userId: mongoose.Schema.Types.ObjectId, name: String }));
        const crops = await Crop.find();
        console.log('Total crops:', crops.length);
        const nullUserId = crops.filter(c => !c.userId);
        console.log('Crops with null/missing userId:', nullUserId.map(c => c.name));
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkCrops();
