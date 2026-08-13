const db = require("../config/db");

const User = {

    create: (user, callback) => {

        const sql = `
            INSERT INTO users
            (name, email, password, address, role)
            VALUES (?, ?, ?, ?, ?)
        `;

        db.query(
            sql,
            [
                user.name,
                user.email,
                user.password,
                user.address,
                user.role
            ],
            callback
        );
    },

    findByEmail: (email, callback) => {

        const sql = `
            SELECT *
            FROM users
            WHERE email = ?
        `;

        db.query(
            sql,
            [email],
            callback
        );
    },

    findById: (id, callback) => {

        const sql = `
            SELECT *
            FROM users
            WHERE id = ?
        `;

        db.query(
            sql,
            [id],
            callback
        );
    },

    updatePassword: (id, password, callback) => {

        const sql = `
            UPDATE users
            SET password = ?
            WHERE id = ?
        `;

        db.query(
            sql,
            [
                password,
                id
            ],
            callback
        );
    }

};

module.exports = User;