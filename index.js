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
let userCredentials;
let sellerContent;

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
          {
            id: newUser._id,
            userType: newUser.userType,
            username: newUser.username,
          },
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
        {
          id: existingUser._id,
          userType: existingUser.userType,
          username: existingUser.username,
        },
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

    // -------------------------------------------------------------- Profile Edit --------------------------------------------------------------
    app.patch("/api/update_profile", async (req, res) => {
      const { token, username, email, password } = req.body;

      try {
        console.log("Primljen zahtjev za ažuriranje profila:", {
          token,
          username,
          email,
          password,
        });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        let userId = decoded.id;

        console.log("Token uspješno dekodiran, ID korisnika:", userId);

        // userId u ObjectId
        const { ObjectId } = require("mongodb");
        userId = new ObjectId(userId);

        const updateData = {};
        if (username) {
          updateData.username = username;
          console.log("Ažuriranje korisničkog imena:", username);
        }
        if (email) {
          updateData.email = email;
          console.log("Ažuriranje email adrese:", email);
        }
        if (password) {
          const hash_password = await bcrypt.hash(password, 10);
          updateData.password = hash_password;
          console.log("Lozinka hashirana i ažurirana.");
        }

        const result = await userCollection.updateOne(
          { _id: userId },
          { $set: updateData }
        );
        console.log("Rezultat ažuriranja:", result);

        if (result.matchedCount === 0) {
          console.log("Nema korisnika s ovim ID-om:", userId);
          return res.status(400).send("Korisnik nije pronađen.");
        }

        res.json({ message: "Podaci uspješno ažurirani" });
      } catch (err) {
        console.log("Greška pri ažuriranju profila:", err);
        res.status(400).send("Pogreška pri ažuriranju profila");
      }
    });

    // -------------------------------------------------------------- Delete Account --------------------------------------------------------------
    app.delete("/api/delete_account", async (req, res) => {
      const { token } = req.body;

      try {
        console.log("Primljen zahtjev za brisanje računa:", { token });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        let userId = decoded.id;

        // userId u ObjectId
        const { ObjectId } = require("mongodb");
        userId = new ObjectId(userId);

        console.log("Token uspješno dekodiran, ID korisnika:", userId);

        const result = await userCollection.deleteOne({ _id: userId });
        console.log("Rezultat brisanja računa:", result);

        if (result.deletedCount === 0) {
          console.log("Nema korisnika za brisanje s ovim ID-om:", userId);
          return res.status(400).send("Račun nije pronađen.");
        }

        res.status(200).send("Račun uspješno izbrisan");
      } catch (err) {
        console.log("Greška pri brisanju računa:", err);
        res.status(400).send("Pogreška pri brisanju računa");
      }
    });

    // -------------------------------------------------------------- Seller --------------------------------------------------------------
    sellerContent = db.collection("Content");

    app.get("/api/products", async (req, res) => {
      try {
        const products = await sellerContent.find({}).toArray();
        res.status(200).json(products);
      } catch (err) {
        console.error("Greška prilikom dohvaćanja proizvoda:", err);
        res.status(500).send("Greška prilikom dohvaćanja proizvoda.");
      }
    });

    app.get("/api/product/:id", async (req, res) => {
      const { id } = req.params;
      const { ObjectId } = require("mongodb");
    
      // Provjera da  li je ID validan
      try {
        if (!ObjectId.isValid(id)) {
          return res.status(400).send("Neispravan ID formata.");
        }
    
        const product = await sellerContent.findOne({ _id: new ObjectId(id) });
    
        if (!product) {
          return res.status(404).send("Proizvod nije pronađen.");
        }
        
        res.status(200).json(product);
      } catch (err) {
        console.error("Greška prilikom dohvaćanja proizvoda:", err);
        res.status(500).send("Greška prilikom dohvaćanja proizvoda.");
      }
    });    
    
    app.post("/api/add_product", async (req, res) => {
      const { name, category, shortDescription, longDescription, price, image, spesification, auctionDuration } = req.body;
    
      // Vrijeme završetka aukcije
      const endTime = new Date();
      endTime.setSeconds(endTime.getSeconds() + 
        auctionDuration.days * 86400 + 
        auctionDuration.hours * 3600 + 
        auctionDuration.minutes * 60 + 
        auctionDuration.seconds);
    
      try {
        const newProduct = {
          name,
          category,
          shortDescription,
          longDescription,
          price,
          image,
          spesification,
          participant: 0,
          newPrice: price,
          auctionEndTime: endTime, // Vrijeme završetka aukcije
        };
    
        await sellerContent.insertOne(newProduct);
        res.status(201).send("Proizvod je uspješno dodan.");
      } catch (err) {
        console.error("Greška prilikom dodavanja proizvoda:", err);
        res.status(500).send("Greška prilikom dodavanja proizvoda.");
      }
    });

    // -------------------------------------------------------------- Credentials --------------------------------------------------------------
    userCredentials = db.collection("Resources");
    
    app.post("/api/save_credentials", async (req, res) => {
      const { bidAmount, cardNumber, expiryDate, securityCode, cardName } = req.body;
    
      // Provjera da li su svi podaci poslani
      if (!bidAmount || !cardNumber || !expiryDate || !securityCode || !cardName) {
        return res.status(400).send("Svi podaci su obavezni");
      }
    
      try {
        // Spremanje podataka u kolekciju Resources
        const newCredentials = {
          bidAmount,
          cardNumber,
          expiryDate,
          securityCode,
          cardName,
          // timestamp: new Date(), // Vrijeme kada su podaci uneseni
        };
    
        await userCredentials.insertOne(newCredentials);
        res.status(201).json({ message: "Podaci su uspješno spremljeni" });
      } catch (err) {
        console.error("Greška prilikom spremanja podataka:", err);
        res.status(500).send("Greška prilikom spremanja podataka");
      }
    });

    // Pokretanje servera
    app.listen(port, () => console.log(`Aktivan port: ${port}`));
  })
  .catch((error) => {
    console.error("Failed to connect to the database.", error);
    process.exit(1);
  });
