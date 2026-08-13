const Rating = require("../models/ratingModel");
const db = require("../config/db");

// =====================================================
// ADD RATING
// =====================================================

exports.addRating = (req, res) => {
    const user_id = req.user.id;
    const { store_id, rating } = req.body;

    if (!store_id || rating === undefined) {
        return res.status(400).json({
            message: "store_id and rating are required"
        });
    }

    const ratingNumber = Number(rating);

    if (
        !Number.isInteger(ratingNumber) ||
        ratingNumber < 1 ||
        ratingNumber > 5
    ) {
        return res.status(400).json({
            message: "Rating must be a whole number between 1 and 5"
        });
    }

    Rating.findByUserAndStore(
        user_id,
        store_id,
        (err, results) => {

            if (err) {
                console.error("Find rating error:", err);

                return res.status(500).json({
                    message: "Database error",
                    error: err.message
                });
            }

            if (results.length > 0) {
                return res.status(400).json({
                    message: "You have already rated this store"
                });
            }

            Rating.create(
                {
                    user_id: user_id,
                    store_id: store_id,
                    rating: ratingNumber
                },
                (err, result) => {

                    if (err) {
                        console.error("Create rating error:", err);

                        return res.status(500).json({
                            message: "Failed to add rating",
                            error: err.message
                        });
                    }

                    return res.status(201).json({
                        message: "Rating submitted successfully",
                        ratingId: result.insertId
                    });
                }
            );
        }
    );
};


// =====================================================
// UPDATE RATING
// =====================================================

exports.updateRating = (req, res) => {
    const user_id = req.user.id;
    const { store_id, rating } = req.body;

    if (!store_id || rating === undefined) {
        return res.status(400).json({
            message: "store_id and rating are required"
        });
    }

    const ratingNumber = Number(rating);

    if (
        !Number.isInteger(ratingNumber) ||
        ratingNumber < 1 ||
        ratingNumber > 5
    ) {
        return res.status(400).json({
            message: "Rating must be a whole number between 1 and 5"
        });
    }

    Rating.findByUserAndStore(
        user_id,
        store_id,
        (err, results) => {

            if (err) {
                console.error("Find rating error:", err);

                return res.status(500).json({
                    message: "Database error",
                    error: err.message
                });
            }

            if (results.length === 0) {
                return res.status(404).json({
                    message: "Rating not found"
                });
            }

            Rating.updateRating(
                user_id,
                store_id,
                ratingNumber,
                (err, result) => {

                    if (err) {
                        console.error(
                            "Update rating error:",
                            err
                        );

                        return res.status(500).json({
                            message: "Failed to update rating",
                            error: err.message
                        });
                    }

                    if (result.affectedRows === 0) {
                        return res.status(404).json({
                            message: "Rating could not be updated"
                        });
                    }

                    return res.status(200).json({
                        message: "Rating updated successfully"
                    });
                }
            );
        }
    );
};


// =====================================================
// GET STORE RATINGS
// =====================================================

exports.getStoreRatings = (req, res) => {
    const { storeId } = req.params;

    if (!storeId) {
        return res.status(400).json({
            message: "Store ID is required"
        });
    }

    const sql = `
        SELECT
            r.id,
            r.user_id,
            r.store_id,
            r.rating,
            u.name,
            u.email,
            u.address
        FROM ratings r
        INNER JOIN users u
            ON r.user_id = u.id
        WHERE r.store_id = ?
        ORDER BY r.id DESC
    `;

    db.query(
        sql,
        [storeId],
        (err, results) => {

            if (err) {
                console.error(
                    "Get store ratings error:",
                    err
                );

                return res.status(500).json({
                    message: "Failed to fetch ratings",
                    error: err.message
                });
            }

            return res.status(200).json(results);
        }
    );
};


// =====================================================
// GET CURRENT USER RATINGS
// =====================================================

exports.getMyRatings = (req, res) => {
    const userId = req.user.id;

    const sql = `
        SELECT
            id,
            user_id,
            store_id,
            rating
        FROM ratings
        WHERE user_id = ?
        ORDER BY id DESC
    `;

    db.query(
        sql,
        [userId],
        (err, results) => {

            if (err) {
                console.error(
                    "Get my ratings error:",
                    err
                );

                return res.status(500).json({
                    message: "Failed to fetch your ratings",
                    error: err.message
                });
            }

            return res.status(200).json(results);
        }
    );
};