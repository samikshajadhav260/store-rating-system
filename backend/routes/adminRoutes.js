const express = require("express");

const router = express.Router();

const {
  getDashboardStats,
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getAllStores,
  getStoreById,
  createStore,
  updateStore,
  deleteStore
} = require("../controllers/adminController");

const authMiddleware = require("../middleware/authMiddleware");

router.get(
  "/dashboard",
  authMiddleware,
  (req, res, next) => {
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({
        message: "Admin access required"
      });
    }
    next();
  },
  getDashboardStats
);

router.get(
  "/users",
  authMiddleware,
  (req, res, next) => {
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({
        message: "Admin access required"
      });
    }
    next();
  },
  getAllUsers
);

router.get(
  "/users/:id",
  authMiddleware,
  (req, res, next) => {
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({
        message: "Admin access required"
      });
    }
    next();
  },
  getUserById
);

router.post(
  "/users",
  authMiddleware,
  (req, res, next) => {
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({
        message: "Admin access required"
      });
    }
    next();
  },
  createUser
);

router.put(
  "/users/:id",
  authMiddleware,
  (req, res, next) => {
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({
        message: "Admin access required"
      });
    }
    next();
  },
  updateUser
);

router.delete(
  "/users/:id",
  authMiddleware,
  (req, res, next) => {
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({
        message: "Admin access required"
      });
    }
    next();
  },
  deleteUser
);

router.get(
  "/stores",
  authMiddleware,
  (req, res, next) => {
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({
        message: "Admin access required"
      });
    }
    next();
  },
  getAllStores
);

router.get(
  "/stores/:id",
  authMiddleware,
  (req, res, next) => {
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({
        message: "Admin access required"
      });
    }
    next();
  },
  getStoreById
);

router.post(
  "/stores",
  authMiddleware,
  (req, res, next) => {
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({
        message: "Admin access required"
      });
    }
    next();
  },
  createStore
);

router.put(
  "/stores/:id",
  authMiddleware,
  (req, res, next) => {
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({
        message: "Admin access required"
      });
    }
    next();
  },
  updateStore
);

router.delete(
  "/stores/:id",
  authMiddleware,
  (req, res, next) => {
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({
        message: "Admin access required"
      });
    }
    next();
  },
  deleteStore
);

module.exports = router;