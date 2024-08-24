import bcrypt from 'bcryptjs';

function passwordHash(password) {
    const salt = bcrypt.genSaltSync(10);
    return bcrypt.hashSync(password, salt)
}

export default passwordHash;