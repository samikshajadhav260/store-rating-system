const db = require("../config/db");
const bcrypt = require("bcryptjs");

const getDashboardStats = async (req, res) => {
  try {
    const [users] = await db.promise().query(
      "SELECT COUNT(*) AS totalUsers FROM users"
    );

    const [stores] = await db.promise().query(
      "SELECT COUNT(*) AS totalStores FROM stores"
    );

    const [ratings] = await db.promise().query(
      "SELECT COUNT(*) AS totalRatings FROM ratings"
    );

    res.json({
      totalUsers: Number(users[0].totalUsers),
      totalStores: Number(stores[0].totalStores),
      totalRatings: Number(ratings[0].totalRatings),
    });
  } catch (error) {
    console.error("Dashboard error:", error);

    res.status(500).json({
      message: "Failed to load dashboard statistics",
    });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const [users] = await db.promise().query(
      `SELECT id, name, email, address, role
       FROM users
       ORDER BY id DESC`
    );

    res.json(users);
  } catch (error) {
    console.error("Get users error:", error);

    res.status(500).json({
      message: "Failed to load users",
    });
  }
};

const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const [users] = await db.promise().query(
      `SELECT id, name, email, address, role
       FROM users
       WHERE id = ?`,
      [id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.json(users[0]);
  } catch (error) {
    console.error("Get user error:", error);

    res.status(500).json({
      message: "Failed to load user",
    });
  }
};

const createUser = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      address,
      role,
    } = req.body;

    if (!name || !email || !password || !address) {
      return res.status(400).json({
        message: "Name, email, password and address are required",
      });
    }

    const allowedRoles = ["ADMIN", "USER", "OWNER"];
    const finalRole = role || "USER";

    if (!allowedRoles.includes(finalRole)) {
      return res.status(400).json({
        message: "Invalid role",
      });
    }

    const [existingUser] = await db.promise().query(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );

    if (existingUser.length > 0) {
      return res.status(400).json({
        message: "Email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await db.promise().query(
      `INSERT INTO users
       (name, email, password, address, role)
       VALUES (?, ?, ?, ?, ?)`,
      [
        name,
        email,
        hashedPassword,
        address,
        finalRole,
      ]
    );

    res.status(201).json({
      message: "User created successfully",
      userId: result.insertId,
    });
  } catch (error) {
    console.error("Create user error:", error);

    res.status(500).json({
      message: "Failed to create user",
    });
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      name,
      email,
      address,
      role,
      password,
    } = req.body;

    if (!name || !email || !address || !role) {
      return res.status(400).json({
        message: "Name, email, address and role are required",
      });
    }

    const allowedRoles = ["ADMIN", "USER", "OWNER"];

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        message: "Invalid role",
      });
    }

    const [existingUser] = await db.promise().query(
      "SELECT id FROM users WHERE id = ?",
      [id]
    );

    if (existingUser.length === 0) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const [emailUser] = await db.promise().query(
      `SELECT id
       FROM users
       WHERE email = ?
       AND id != ?`,
      [email, id]
    );

    if (emailUser.length > 0) {
      return res.status(400).json({
        message: "Email already belongs to another user",
      });
    }

    if (password && password.trim() !== "") {
      const hashedPassword = await bcrypt.hash(password, 10);

      await db.promise().query(
        `UPDATE users
         SET name = ?,
             email = ?,
             address = ?,
             role = ?,
             password = ?
         WHERE id = ?`,
        [
          name,
          email,
          address,
          role,
          hashedPassword,
          id,
        ]
      );
    } else {
      await db.promise().query(
        `UPDATE users
         SET name = ?,
             email = ?,
             address = ?,
             role = ?
         WHERE id = ?`,
        [
          name,
          email,
          address,
          role,
          id,
        ]
      );
    }

    res.json({
      message: "User updated successfully",
      userId: Number(id),
    });
  } catch (error) {
    console.error("Update user error:", error);

    res.status(500).json({
      message: "Failed to update user",
    });
  }
};

const getAllStores = async (req, res) => {
  try {
    const [stores] = await db.promise().query(
      `SELECT
        s.id,
        s.name,
        s.email,
        s.address,
        s.owner_id,
        COALESCE(AVG(r.rating), 0) AS average_rating
       FROM stores s
       LEFT JOIN ratings r
         ON s.id = r.store_id
       GROUP BY
         s.id,
         s.name,
         s.email,
         s.address,
         s.owner_id
       ORDER BY s.id DESC`
    );

    res.json(stores);
  } catch (error) {
    console.error("Get stores error:", error);

    res.status(500).json({
      message: "Failed to load stores",
    });
  }
};

const getStoreById = async (req, res) => {
  try {
    const { id } = req.params;

    const [stores] = await db.promise().query(
      `SELECT
        s.id,
        s.name,
        s.email,
        s.address,
        s.owner_id,
        COALESCE(AVG(r.rating), 0) AS average_rating
       FROM stores s
       LEFT JOIN ratings r
         ON s.id = r.store_id
       WHERE s.id = ?
       GROUP BY
         s.id,
         s.name,
         s.email,
         s.address,
         s.owner_id`,
      [id]
    );

    if (stores.length === 0) {
      return res.status(404).json({
        message: "Store not found",
      });
    }

    res.json(stores[0]);
  } catch (error) {
    console.error("Get store error:", error);

    res.status(500).json({
      message: "Failed to load store",
    });
  }
};

const createStore = async (req, res) => {
  try {
    const {
      name,
      email,
      address,
      owner_id,
    } = req.body;

    if (!name || !email || !address) {
      return res.status(400).json({
        message: "Name, email and address are required",
      });
    }

    if (owner_id) {
      const [owner] = await db.promise().query(
        `SELECT id
         FROM users
         WHERE id = ?
         AND role = 'OWNER'`,
        [owner_id]
      );

      if (owner.length === 0) {
        return res.status(400).json({
          message: "Invalid owner_id",
        });
      }
    }

    const [result] = await db.promise().query(
      `INSERT INTO stores
       (name, email, address, owner_id)
       VALUES (?, ?, ?, ?)`,
      [
        name,
        email,
        address,
        owner_id || null,
      ]
    );

    res.status(201).json({
      message: "Store created successfully",
      storeId: result.insertId,
    });
  } catch (error) {
    console.error("Create store error:", error);

    res.status(500).json({
      message: "Failed to create store",
    });
  }
};

const deleteUser = async (req, res) => {
  const connection = db.promise();

  try {
    const { id } = req.params;

    // Prevent admin from deleting their own account
    if (Number(id) === Number(req.user.id)) {
      return res.status(400).json({
        message: "You cannot delete your own admin account",
      });
    }

    const [users] = await connection.query(
      "SELECT id, role FROM users WHERE id = ?",
      [id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Delete ratings submitted by this user
    await connection.query(
      "DELETE FROM ratings WHERE user_id = ?",
      [id]
    );

    // If deleting an owner, keep the store but remove ownership
    if (users[0].role === "OWNER") {
      await connection.query(
        "UPDATE stores SET owner_id = NULL WHERE owner_id = ?",
        [id]
      );
    }

    // Delete the user
    await connection.query(
      "DELETE FROM users WHERE id = ?",
      [id]
    );

    res.json({
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Delete user error:", error);

    res.status(500).json({
      message: "Failed to delete user",
    });
  }
};

const deleteStore = async (req, res) => {
  const connection = db.promise();

  try {
    const { id } = req.params;

    const [stores] = await connection.query(
      "SELECT id FROM stores WHERE id = ?",
      [id]
    );

    if (stores.length === 0) {
      return res.status(404).json({
        message: "Store not found",
      });
    }

    // Delete ratings associated with the store first
    await connection.query(
      "DELETE FROM ratings WHERE store_id = ?",
      [id]
    );

    // Delete the store
    await connection.query(
      "DELETE FROM stores WHERE id = ?",
      [id]
    );

    res.json({
      message: "Store deleted successfully",
    });
  } catch (error) {
    console.error("Delete store error:", error);

    res.status(500).json({
      message: "Failed to delete store",
    });
  }
};

const updateStore = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      name,
      email,
      address,
      owner_id,
    } = req.body;

    if (!name || !email || !address) {
      return res.status(400).json({
        message: "Name, email and address are required",
      });
    }

    const [existingStore] = await db.promise().query(
      "SELECT id FROM stores WHERE id = ?",
      [id]
    );

    if (existingStore.length === 0) {
      return res.status(404).json({
        message: "Store not found",
      });
    }

    if (owner_id) {
      const [owner] = await db.promise().query(
        `SELECT id
         FROM users
         WHERE id = ?
         AND role = 'OWNER'`,
        [owner_id]
      );

      if (owner.length === 0) {
        return res.status(400).json({
          message: "Invalid owner_id",
        });
      }
    }

    await db.promise().query(
      `UPDATE stores
       SET name = ?,
           email = ?,
           address = ?,
           owner_id = ?
       WHERE id = ?`,
      [
        name,
        email,
        address,
        owner_id || null,
        id,
      ]
    );

    res.json({
      message: "Store updated successfully",
      storeId: Number(id),
    });
  } catch (error) {
    console.error("Update store error:", error);

    res.status(500).json({
      message: "Failed to update store",
    });
  }
};

module.exports = {
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
  deleteStore,
};