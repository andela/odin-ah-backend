import crypto from 'crypto';
import Sequelize from 'sequelize';
import sequelize from "../database";

const User = sequelize.define('User', {
    username: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: true,
        validate: {
            isAlphanumeric: true,
        }
    },
    email: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: true,
        validate: {
            isEmail: true
        }
    },
    bio: Sequelize.STRING,
    image: Sequelize.STRING,
    hash: {
        type: Sequelize.TEXT,
        set(val) {
            const salt = crypto.randomBytes(16).toString('hex');
            const hash = crypto
                .pbkdf2Sync(val, salt, 10000, 512, 'sha512')
                .toString('hex');
            this.setDataValue('salt', salt);
            this.setDataValue('hash', hash);
        }
    },
    salt: Sequelize.STRING

}, {
    timestamps: true,
});

export default User