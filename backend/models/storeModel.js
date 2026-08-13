const db = require("../config/db");

const Store = {

    create: (store, callback) => {
        const sql = `
            INSERT INTO stores (name, email, address, owner_id)
            VALUES (?, ?, ?, ?)
        `;

        db.query(
            sql,
            [
                store.name,
                store.email,
                store.address,
                store.owner_id
            ],
            callback
        );
    },

    getAll: (callback) => {
        const sql = `
            SELECT 
                s.id,
                s.name,
                s.email,
                s.address,
                s.owner_id,
                COALESCE(AVG(r.rating), 0) AS average_rating
            FROM stores s
            LEFT JOIN ratings r ON s.id = r.store_id
            GROUP BY s.id
            ORDER BY s.id DESC
        `;

        db.query(sql, callback);
    },

    search: (searchTerm, callback) => {
        const sql = `
            SELECT 
                s.id,
                s.name,
                s.email,
                s.address,
                s.owner_id,
                COALESCE(AVG(r.rating), 0) AS average_rating
            FROM stores s
            LEFT JOIN ratings r ON s.id = r.store_id
            WHERE s.name LIKE ?
               OR s.address LIKE ?
            GROUP BY s.id
            ORDER BY s.id DESC
        `;

        const term = `%${searchTerm}%`;

        db.query(sql, [term, term], callback);
    },

    getById: (id, callback) => {
        const sql = `
            SELECT 
                s.id,
                s.name,
                s.email,
                s.address,
                s.owner_id,
                COALESCE(AVG(r.rating), 0) AS average_rating
            FROM stores s
            LEFT JOIN ratings r ON s.id = r.store_id
            WHERE s.id = ?
            GROUP BY s.id
        `;

        db.query(sql, [id], callback);
    }

};

module.exports = Store;