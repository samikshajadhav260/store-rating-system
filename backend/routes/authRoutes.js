const express = require("express");
const router = express.Router();

const {
    register,
    login,
    changePassword
} = require("../controllers/authController");

const authenticateToken = require("../middleware/authMiddleware");

router.post("/register", register);

router.post("/login", login);




router.put(
    "/change-password",
    authenticateToken,
    changePassword
);

module.exports = router;