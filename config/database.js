const mongoose = require("mongoose");
require('dotenv').config();

const uri = "mongodb+srv://ravi:ravi_uvce10@cluster0.dwda6kr.mongodb.net/badminton_courts?retryWrites=true&w=majority&appName=Cluster0";

const connectDb = async () => {
  try {
    const connect = await mongoose.connect(uri); // process.env.MONGODB_URI
    console.log(
      "Database connected.",
      connect.connection.host,
      connect.connection.name
    );
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
};

module.exports = connectDb;