const express = require("express");

const router = express.Router();

const {
    addRating,
    updateRating,
    getStoreRatings,
    getMyRatings
} = require("../controllers/ratingController");

const authenticateToken = require("../middleware/authMiddleware");


router.post(
    "/",
    authenticateToken,
    addRating
);


router.put(
    "/",
    authenticateToken,
    updateRating
);


router.get(
    "/user/:userId",
    authenticateToken,
    (req, res, next) => {

        if (
            Number(req.params.userId) !==
            Number(req.user.id)
        ) {
            return res.status(403).json({
                message: "You can only view your own ratings"
            });
        }

        next();
    },
    getMyRatings
);


router.get(
    "/store/:storeId",
    authenticateToken,
    getStoreRatings
);


module.exports = router;