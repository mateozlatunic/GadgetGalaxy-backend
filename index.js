const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs"); // Hashiranje lozinki
const jwt = require("jsonwebtoken");
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
connectToDatabase()
  .then((db) => {
    userCollection = db.collection("User");

    // -------------------------------------------------------------- Register --------------------------------------------------------------
    app.post("/api/register", async (req, res) => {
      const { username, email, password, userType } = req.body;

      // Provjera postoji li već korisnik s tim emailom
      const existingUser = await userCollection.findOne({ email });
      if (existingUser) {
        return res.status(400).send("Email je već korišten");
      }

      // Provjera duljine lozinke
      if (password.length < 4) {
        return res.status(400).send("Lozinka mora biti minimalno 4 znakova");
      }

      // Hashiranje lozinke
      const hash_password = await bcrypt.hash(password, 10);

      try {
        // Stvaranje novog korisnika s ulogom i spremanje u bazu
        const newUser = { username, email, password: hash_password, userType };
        await userCollection.insertOne(newUser);

        const token = jwt.sign(
          { id: newUser._id, userType: newUser.userType, username: newUser.username },
          process.env.JWT_SECRET,
          {
            expiresIn: "1h",
          }
        );
        res.status(201).json({ newUser, token });
      } catch (err) {
        console.log("Greška pri kreiranju korisnika:", err);
        res.status(400).send("Pogreška, korisnik nije kreiran");
      }
    });

    // -------------------------------------------------------------- Login --------------------------------------------------------------
    app.post("/api/login", async (req, res) => {
      const { email, password } = req.body;

      // Provjera postoji li korisnik s emailom
      const existingUser = await userCollection.findOne({ email });
      if (!existingUser) {
        return res.status(400).send("Neispravni email ili lozinka");
      }

      // Provjera lozinke
      const isMatch = await bcrypt.compare(password, existingUser.password);
      if (!isMatch) {
        return res.status(400).send("Neispravni email ili lozinka");
      }

      // Generiranje tokena i vraćanje uloge
      const token = jwt.sign(
        { id: existingUser._id, userType: existingUser.userType, username: existingUser.username },
        process.env.JWT_SECRET,
        {
          expiresIn: "1h",
        }
      );

      try {
        // Uspješna prijava
        res.status(200).json({
          message: "Prijava uspješna",
          token,
          user: existingUser,
          userType: existingUser.userType,
          userName: existingUser.username, 
        });
      } catch (err) {
        console.log("Greška pri prijavi korisnika:", err);
        res.status(400).send("Pogreška, prijava nije uspjela");
      }
    });

    // Pokretanje servera
    app.listen(port, () => console.log(`Aktivan port: ${port}`));
  })
  .catch((error) => {
    console.error("Failed to connect to the database.", error);
    process.exit(1);
  });
