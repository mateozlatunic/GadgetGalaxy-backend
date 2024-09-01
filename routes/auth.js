const express = require("express");
const { authenticateToken } = require("../utils/TokenAuthentication.js");
const { passwordHash, comparePassword } = require("../utils/HashPassword.js");

const router = express.Router();

router.post("/login", async (req, res) => {
    const { email, password } = req.body;
    try {
        const tokenData = await authenticateToken(email, password);
        res.json(tokenData);
    } catch (error) {
        res.status(401).json({ error: "Authentication failed" });
    }
});

router.post("/register", async (req, res) => {
    const { email, password } = req.body;
    try {
        const hashedPassword = passwordHash(password);
        // Funkcija za stvaranje korisnika
        const newUser = await createUser({ email, password: hashedPassword });
        res.status(201).json(newUser);
    } catch (error) {
        res.status(500).json({ error: "Registration failed" });
    }
});

module.exports = router;
