const mongoose = require('mongoose');

async function check() {
    try {
        await mongoose.connect('mongodb://localhost:27017/farmer_platform', { useNewUrlParser: true, useUnifiedTopology: true });
        console.log('Connected to DB...');
        const users = await mongoose.connection.collection('users').find({}).toArray();
        console.log('--- USERS IN DB ---');
        users.forEach(u => console.log(`Phone: ${u.phone}, Role: ${u.role}, Name: ${u.name}`));
        console.log('-------------------');
    } catch (err) {
        console.error('Error checking users:', err);
    } finally {
        await mongoose.disconnect();
        process.exit();
    }
}

check();
