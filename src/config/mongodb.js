const mongoose = require("mongoose");

const connectMongo = async () => {
  const conn = await mongoose.connect(process.env.MONGO_URI);
  console.log(`MongoDB Connected: ${conn.connection.host}`);

  // Drop the legacy global unique index 'name_1' if it exists
  try {
    const Category = mongoose.model("Category");
    if (Category) {
      await Category.collection.dropIndex("name_1");
      console.log("Successfully dropped legacy global 'name_1' unique index from categories collection.");
    }
  } catch (err) {
    // Code 27 is IndexNotFound, which we can safely ignore
    if (err.code !== 27 && err.codeName !== "IndexNotFound") {
      console.error("Warning: Failed to drop legacy 'name_1' index:", err.message);
    }
  }
};

module.exports = connectMongo;