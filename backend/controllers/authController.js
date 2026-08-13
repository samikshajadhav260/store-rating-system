const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const JWT_SECRET = "store_rating_secret_2026";

exports.register = (req, res) => {
    const {
        name,
        email,
        password,
        address,
        role
    } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({
            message: "Name, email and password are required"
        });
    }

    User.findByEmail(email, async (err, results) => {

        if (err) {
            console.error("Registration database error:", err);

            return res.status(500).json({
                message: "Database error",
                error: err.message
            });
        }

        if (results.length > 0) {
            return res.status(400).json({
                message: "Email already registered"
            });
        }

        try {
            const hashedPassword =
                await bcrypt.hash(password, 10);

            const user = {
                name,
                email,
                password: hashedPassword,
                address: address || null,
                role: role || "USER"
            };

            User.create(
                user,
                (err, result) => {

                    if (err) {
                        console.error(
                            "Registration error:",
                            err
                        );

                        return res.status(500).json({
                            message: "Registration failed",
                            error: err.message
                        });
                    }

                    return res.status(201).json({
                        message: "Registration successful",
                        userId: result.insertId
                    });
                }
            );

        } catch (error) {

            console.error(
                "Password hashing error:",
                error
            );

            return res.status(500).json({
                message: "Registration failed"
            });
        }
    });
};


exports.login = (req, res) => {

    const {
        email,
        password
    } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            message: "Email and password are required"
        });
    }

    User.findByEmail(
        email,
        async (err, results) => {

            if (err) {
                console.error(
                    "Login database error:",
                    err
                );

                return res.status(500).json({
                    message: "Database error",
                    error: err.message
                });
            }

            if (
                !results ||
                results.length === 0
            ) {
                return res.status(401).json({
                    message: "Invalid email or password"
                });
            }

            const user = results[0];

            try {

                const isPasswordValid =
                    await bcrypt.compare(
                        password,
                        user.password
                    );

                if (!isPasswordValid) {
                    return res.status(401).json({
                        message: "Invalid email or password"
                    });
                }

                const token = jwt.sign(
                    {
                        id: user.id,
                        role: user.role
                    },
                    JWT_SECRET,
                    {
                        expiresIn: "1d"
                    }
                );

                return res.json({
                    message: "Login successful",

                    token,

                    user: {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        role: user.role
                    }
                });

            } catch (error) {

                console.error(
                    "Login error:",
                    error
                );

                return res.status(500).json({
                    message: "Login failed"
                });
            }
        }
    );
};


exports.changePassword = async (req, res) => {

    const userId = req.user.id;

    const {
        currentPassword,
        newPassword
    } = req.body;

    if (
        !currentPassword ||
        !newPassword
    ) {
        return res.status(400).json({
            message:
                "Current password and new password are required"
        });
    }

    try {

        User.findById(
            userId,
            async (err, results) => {

                if (err) {
                    return res.status(500).json({
                        message: "Database error"
                    });
                }

                if (
                    !results ||
                    results.length === 0
                ) {
                    return res.status(404).json({
                        message: "User not found"
                    });
                }

                const user = results[0];

                const passwordMatches =
                    await bcrypt.compare(
                        currentPassword,
                        user.password
                    );

                if (!passwordMatches) {
                    return res.status(401).json({
                        message:
                            "Current password is incorrect"
                    });
                }

                const samePassword =
                    await bcrypt.compare(
                        newPassword,
                        user.password
                    );

                if (samePassword) {
                    return res.status(400).json({
                        message:
                            "New password must be different from current password"
                    });
                }

                const hashedPassword =
                    await bcrypt.hash(
                        newPassword,
                        10
                    );

                User.updatePassword(
                    userId,
                    hashedPassword,
                    (updateErr) => {

                        if (updateErr) {
                            console.error(
                                "Password update error:",
                                updateErr
                            );

                            return res.status(500).json({
                                message:
                                    "Failed to update password"
                            });
                        }

                        return res.json({
                            message:
                                "Password updated successfully"
                        });
                    }
                );
            }
        );

    } catch (error) {

        console.error(
            "Change password error:",
            error
        );

        return res.status(500).json({
            message:
                "Failed to update password"
        });
    }
};