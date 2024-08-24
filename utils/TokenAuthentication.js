import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

function comparePassword(raw, hash) {
    return bcrypt.compareSync(raw, hash)
}

async function authenticateToken(email, password) {
    let userDb = await User.findOne({ email })
    if (userDb && userDb.password && comparePassword(password, userDb.password)) {
        delete userDb.password

        let token = jwt.sign({email: userDb.email, profilna: userDb.profilnaSlika}, process.env.JWT_SECRET, {
            algorithm: 'HS512',
            expiresIn: "1hour"
        })

        return {
            token,
            email: userDb.email,
            profilna: userDb.profilnaSlika
        }
    
    } else {
        throw new Error("Cannot authenticate");
    }
}


function verify(req, res, next) {
    try {
        let authorization = req.headers.authorization.split(' ');
        let type = authorization[0];
        let token = authorization[1];

        if(type !== 'Bearer') {
            return res.status(401).send();
        } else {
            const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decodedToken;
            return next();
        }
    } catch(error) {
        return res.status(401).send();
    }
}

const auth = {
    authenticateToken,
    verify
}

export default auth;