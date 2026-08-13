const db = require("../config/db");

const Rating = {
    
    create: (rating, callback) => {
        const sql = `
            INSERT INTO ratings (user_id, store_id, rating)
            VALUES (?, ?, ?)
        `;

        db.query(
            sql,
            [
                rating.user_id,
                rating.store_id,
                rating.rating
            ],
            callback
        );
    },

    // Check whether user already rated this store
    findByUserAndStore: (userId, storeId, callback) => {
        const sql = `
            SELECT *
            FROM ratings
            WHERE user_id = ? AND store_id = ?
        `;

        db.query(
            sql,
            [userId, storeId],
            callback
        );
    },

    updateRating: (userId, storeId, rating, callback) => {
        const sql = `
            UPDATE ratings
            SET rating = ?
            WHERE user_id = ? AND store_id = ?
        `;

        db.query(
            sql,
            [rating, userId, storeId],
            callback
        );
    },

    
    getStoreRatings: (storeId, callback) => {
        const sql = `
            SELECT
                r.id,
                r.user_id,
                u.name,
                r.rating
            FROM ratings r
            JOIN users u ON r.user_id = u.id
            WHERE r.store_id = ?
            ORDER BY r.id DESC
        `;

        db.query(
            sql,
            [storeId],
            callback
        );
    }
};

module.exports = Rating;