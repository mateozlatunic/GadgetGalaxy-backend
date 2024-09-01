const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const auth = require("./routes/auth.js");

dotenv.config();

const app = express();

app.use(cors());
app.use(cookieParser());

const port = process.env.PORT || 50000;

app.use(bodyParser.json());
app.use(express.urlencoded({ extended: false }));

mongoose
  .connect(process.env.MONGO_URL, { dbName: "aukcija" })
  .then(() => console.log("DB spojen"))
  .catch((error) => console.log(error));

console.log("Loaded .env file with mongo URL:", process.env.MONGO_URL);

// Rute za auth
app.use("/api/auth", auth);

app.listen(port, () => console.log(`Aktivan port: ${port}`));
