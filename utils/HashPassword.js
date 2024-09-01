const bcrypt = require('bcryptjs');

function passwordHash(password) {
    const salt = bcrypt.genSaltSync(10);
    return bcrypt.hashSync(password, salt);
}

module.exports = { passwordHash };
