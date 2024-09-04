const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs"); // Hashiranje lozinki
const { connectToDatabase } = require("./connection.js"); // Funkcija za povezivanje s bazom podataka

dotenv.config(); // Učitavanje varijabli iz .env datoteke

const app = express();

app.use(cors());
app.use(cookieParser());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: false }));

const port = process.env.PORT || 50000;

let userCollection;

// Povezivanje s MongoDB bazom podataka koristeći MongoDB
connectToDatabase().then((db) => {
  userCollection = db.collection("User");

  // Ruta za registraciju korisnika
  app.post("/register", async (req, res) => {
    const { username, email, password } = req.body;

    // Provjera postoji li već korisnik s tim emailom
    const existingUser = await userCollection.findOne({ email });
    if (existingUser) {
      return res.status(400).send("Email je već korišten");
    }

    // Provjera duljine lozinke
    if (password.length < 8) {
      return res.status(400).send("Lozinka mora biti minimalno 8 znakova");
    }

    // Hashiranje lozinke
    const hash_password = await bcrypt.hash(password, 10);

    try {
      // Stvaranje novog korisnika i spremanje u bazu
      const newUser = { username, email, password: hash_password };
      await userCollection.insertOne(newUser); 
      res.status(201).json(newUser); 
    } catch (err) {
      console.log("Greška pri kreiranju korisnika:", err);
      res.status(400).send("Pogreška, korisnik nije kreiran");
    }
  });

  // Pokretanje servera
  app.listen(port, () => console.log(`Aktivan port: ${port}`));
}).catch((error) => {
  console.error("Failed to connect to the database.", error);
  process.exit(1);
});
