const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User.js');

// Asinkronizacija hashiranja lozinke
async function passwordHash(password) {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
}

// Asinkronizacija usporedbe lozinki
async function comparePassword(raw, hash) {
    return bcrypt.compare(raw, hash);
}

// Autentifikacija korisnika i generiranje JWT tokena
async function authenticateToken(email, password) {
    const userDb = await User.findOne({ email });
    if (userDb && userDb.password && await comparePassword(password, userDb.password)) {
        const token = jwt.sign({ email: userDb.email, role: userDb.role }, process.env.TOKEN_SECRET, {
            algorithm: "HS512",
            expiresIn: "6d"
        });

        return {
            token,
            email: userDb.email,
            role: userDb.role
        };
    } else {
        throw new Error("Cannot authenticate");
    }
}

// Verifikacija JWT tokena
function verify(req, res, next) {
    try {
        const [type, token] = req.headers.authorization.split(' ');

        if (type !== 'CustomToken ') {
            return res.status(401).json({ msg: "Token type nije 'CustomToken '" });
        }

        const decodedToken = jwt.verify(token, process.env.TOKEN_SECRET);
        req.user = decodedToken;
        next();
    } catch (e) {
        res.status(401).send('Invalid token');
    }
}

module.exports = {
    passwordHash,
    comparePassword,
    authenticateToken,
    verify
};
