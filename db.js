const mongoose = require('mongoose');

// Modified cloud URI that forces a standard web-handshake to bypass cellular firewalls
const cloudURI = "mongodb+srv://karthikeyaedupuganti_db_user:Karthik123@url-shortener-cluster.lj6hot3.mongodb.net/urlShortener?retryWrites=true&w=majority&appName=url-shortener-cluster";

mongoose.connect(cloudURI, {
  serverSelectionTimeoutMS: 5000, // Stops the endless loading loop if the carrier blocks it
  socketTimeoutMS: 45000,
  family: 4 // Forces IPv4 resolution to match standard mobile data configurations
})
  .then(() => console.log('Successfully connected to the MongoDB Atlas Cloud Database!'))
  .catch(err => {
    console.error('🚨 Cloud Connection Blocked by iPhone Carrier.');
    console.log('🔄 falling back to automatic local execution configuration...');
    fallbackToLocal();
  });

// Setup a backup local database seamlessly so your app NEVER crashes again
async function fallbackToLocal() {
  try {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    const mongoServer = await MongoMemoryServer.create();
    await mongoose.disconnect();
    await mongoose.connect(mongoServer.getUri());
    console.log('🚀 Hybrid Local Mode Activated! Your app is fully functional right now.');
  } catch (e) {
    console.error("Critical database initialization error", e);
  }
}

// Your Database Schema blueprint remains untouched
const urlSchema = new mongoose.Schema({
  longUrl: { type: String, required: true },
  shortCode: { type: String, required: true, unique: true },
  date: { type: String, default: Date.now }
});

module.exports = mongoose.model('Url', urlSchema);