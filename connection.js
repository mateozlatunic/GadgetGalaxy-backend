const MongoClient = require("mongodb").MongoClient;
const dotenv = require("dotenv");
dotenv.config();

const connection = process.env.MONGO_URL;

let db = null; // Promjenjiva za bazu podataka

const connectToDatabase = async () => {
  if (db) return db; // Ako je veza već uspostavljena, vratite postojeću bazu

  try {
    console.log("Establishing connection...");
    const business = new MongoClient(connection, { useNewUrlParser: true, useUnifiedTopology: true });
    const con = await business.connect(); // Uspostavljanje veze
    db = business.db("aukcija"); // Postavljanje baze podataka
    console.log("Connection to database established.");
    return db; // Vraćanje instance baze podataka
  } catch (e) {
    console.error("Error connecting to the database:", e);
    throw e; // Ako se ne može spojiti, bacamo grešku
  }
};

// Izvoz funkcije koja vraća bazu podataka
module.exports = { connectToDatabase };
