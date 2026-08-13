const express = require("express");

const router = express.Router();

const {
    createStore,
    getStores,
    searchStores,
    getStoreById
} = require("../controllers/storeController");

router.post("/", createStore);

router.get("/", getStores);

router.get("/search", searchStores);

router.get("/:id", getStoreById);

module.exports = router;