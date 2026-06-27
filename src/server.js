require("dotenv").config();

const app = require("./app");

const pool = require("./config/postgres");
const connectMongo = require("./config/mongodb");

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {

    await pool.query("SELECT NOW()");
    console.log("PostgreSQL Connected");

    await connectMongo();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

  } catch (error) {
    console.error(error);
  }
};

startServer();