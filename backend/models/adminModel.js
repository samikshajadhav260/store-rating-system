const db = require("../config/db");

const Admin = {
    
    getDashboardStats: (callback) => {

        const sql = `
            SELECT
                (SELECT COUNT(*) FROM users) AS total_users,
                (SELECT COUNT(*) FROM stores) AS total_stores,
                (SELECT COUNT(*) FROM ratings) AS total_ratings
        `;

        db.query(sql, callback);
    },

    getUsers: (search, sortBy, sortOrder, callback) => {

        const allowedSortColumns = {
            id: "u.id",
            name: "u.name",
            email: "u.email",
            address: "u.address",
            role: "u.role"
        };

        const column =
            allowedSortColumns[sortBy] || "u.id";

        const order =
            sortOrder === "asc" ? "ASC" : "DESC";

        let sql = `
            SELECT
                u.id,
                u.name,
                u.email,
                u.address,
                u.role
            FROM users u
        `;

        const params = [];

        if (search) {

            sql += `
                WHERE u.name LIKE ?
                   OR u.email LIKE ?
                   OR u.address LIKE ?
                   OR u.role LIKE ?
            `;

            const term = `%${search}%`;

            params.push(
                term,
                term,
                term,
                term
            );
        }

        sql += `
            ORDER BY ${column} ${order}
        `;

        db.query(
            sql,
            params,
            callback
        );
    },

    getUserById: (id, callback) => {

        const sql = `
            SELECT
                u.id,
                u.name,
                u.email,
                u.address,
                u.role
            FROM users u
            WHERE u.id = ?
        `;

        db.query(
            sql,
            [id],
            callback
        );
    },

    getStores: (search, sortBy, sortOrder, callback) => {

        const allowedSortColumns = {

            id: "s.id",

            name: "s.name",

            email: "s.email",

            address: "s.address",

            average_rating: "average_rating"
        };

        const column =
            allowedSortColumns[sortBy] || "s.id";

        const order =
            sortOrder === "asc"
                ? "ASC"
                : "DESC";

        let sql = `
            SELECT
                s.id,
                s.name,
                s.email,
                s.address,
                s.owner_id,
                COALESCE(
                    AVG(r.rating),
                    0
                ) AS average_rating

            FROM stores s

            LEFT JOIN ratings r
                ON s.id = r.store_id
        `;

        const params = [];

        if (search) {

            sql += `
                WHERE s.name LIKE ?
                   OR s.email LIKE ?
                   OR s.address LIKE ?
            `;

            const term = `%${search}%`;

            params.push(
                term,
                term,
                term
            );
        }

        sql += `
            GROUP BY
                s.id,
                s.name,
                s.email,
                s.address,
                s.owner_id

            ORDER BY ${column} ${order}
        `;

        db.query(
            sql,
            params,
            callback
        );
    },

    getStoreById: (id, callback) => {

        const sql = `
            SELECT
                s.id,
                s.name,
                s.email,
                s.address,
                s.owner_id,

                COALESCE(
                    AVG(r.rating),
                    0
                ) AS average_rating,

                COUNT(r.id) AS total_ratings

            FROM stores s

            LEFT JOIN ratings r
                ON s.id = r.store_id

            WHERE s.id = ?

            GROUP BY
                s.id,
                s.name,
                s.email,
                s.address,
                s.owner_id
        `;

        db.query(
            sql,
            [id],
            callback
        );
    },

    createUser: (user, callback) => {

        const sql = `
            INSERT INTO users
            (
                name,
                email,
                password,
                address,
                role
            )
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

    createStore: (store, callback) => {

        const sql = `
            INSERT INTO stores
            (
                name,
                email,
                address,
                owner_id
            )
            VALUES (?, ?, ?, ?)
        `;

        db.query(
            sql,
            [
                store.name,
                store.email,
                store.address,
                store.owner_id || null
            ],
            callback
        );
    },

    assignStoreOwner: (
        storeId,
        ownerId,
        callback
    ) => {

        const sql = `
            UPDATE stores
            SET owner_id = ?
            WHERE id = ?
        `;

        db.query(
            sql,
            [
                ownerId,
                storeId
            ],
            callback
        );
    }

};

module.exports = Admin;