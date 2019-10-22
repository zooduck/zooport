const bcrypt = require('bcrypt');

class PasswordHelper {
    constructor() {}

    async hash(password) {
        return new Promise((resolve) => {
            bcrypt.hash(password, 10, (_err, hash) => {
                resolve(hash);
            });
        });
    }

    async compare(password, hash) {
        return new Promise((resolve) => {
            bcrypt.compare(password, hash, (err, same) => {
                resolve(!err && same);
            });
        });
    }
}

module.exports = new PasswordHelper();
