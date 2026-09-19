// seedWasteRules.cjs
// Run with: node seedWasteRules.cjs
// Make sure MONGODB_URI is set in your .env file and mongoose + dotenv are installed:
//   npm install mongoose dotenv

require("dotenv").config();
const mongoose = require("mongoose");
const rules = require("./waste-rules-seed.json");

const WasteRuleSchema = new mongoose.Schema({
  itemKeyword: { type: String, required: true },
  category: { type: String, required: true },
  disposalInstruction: { type: String, required: true },
  municipality: { type: String, default: "general" },
  updatedAt: { type: Date, default: Date.now },
});

const WasteRule = mongoose.model("WasteRule", WasteRuleSchema);

async function seed() {
  try {
    const uri = process.env.MONGODB_URI?.trim();
    if (!uri) {
      console.error("❌ Error: MONGODB_URI is not set in your environment or .env file.");
      console.log("\n📘 How to get and configure your MongoDB URI:");
      console.log("  1. Go to https://cloud.mongodb.com and create a free M0 cluster.");
      console.log("  2. In 'Database Access', create a database user and copy the password.");
      console.log("  3. In 'Network Access', click 'Add IP Address' and choose 'Allow Access from Anywhere' (0.0.0.0/0).");
      console.log("  4. Click 'Connect' -> 'Drivers' and copy the connection string.");
      console.log("  5. Replace <password> with your actual database password and set the db name, e.g.:");
      console.log("     mongodb+srv://admin:myRealPassword@cluster0.abcde.mongodb.net/ecosort?retryWrites=true&w=majority\n");
      process.exit(1);
    }

    if (uri.includes("<username>") || uri.includes("<password>")) {
      console.error("❌ Error: Your MONGODB_URI still contains '<username>' or '<password>' placeholder brackets.");
      console.log("👉 Replace '<username>' with your database user, and '<password>' with your actual password.");
      process.exit(1);
    }

    console.log("Connecting to MongoDB Atlas...");
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });
    console.log("✅ Connected to MongoDB successfully!");

    // Clear existing rules before reseeding
    await WasteRule.deleteMany({});
    console.log("Cleared existing WasteRule collection");

    const inserted = await WasteRule.insertMany(rules);
    console.log(`🎉 Seeded ${inserted.length} municipal waste rules into MongoDB successfully!`);

    await mongoose.disconnect();
    console.log("Database connection closed cleanly.");
    process.exit(0);
  } catch (err) {
    console.error("\n❌ MongoDB Seeding failed:", err.message || err);
    if (err.message && err.message.includes("bad auth")) {
      console.log("💡 Tip: Authentication failed. Double-check your MongoDB Atlas username and password. If your password has special characters like '@' or ':', URL-encode them.");
    } else if (err.message && (err.message.includes("whitelist") || err.message.includes("timed out"))) {
      console.log("💡 Tip: Connection timed out. Go to MongoDB Atlas -> Network Access -> Add IP Address -> Select 'Allow Access from Anywhere' (0.0.0.0/0).");
    }
    process.exit(1);
  }
}

seed();
