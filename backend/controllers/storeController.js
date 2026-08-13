const Store = require("../models/storeModel");

exports.createStore = (req, res) => {
    const { name, email, address, owner_id } = req.body;

    if (!name || !address) {
        return res.status(400).json({
            message: "Store name and address are required"
        });
    }

    const store = {
        name,
        email: email || null,
        address,
        owner_id: owner_id || null
    };

    Store.create(store, (err, result) => {
        if (err) {
            return res.status(500).json({
                message: "Failed to create store",
                error: err.message
            });
        }

        res.status(201).json({
            message: "Store created successfully",
            storeId: result.insertId
        });
    });
};

exports.getStores = (req, res) => {

    Store.getAll((err, results) => {

        if (err) {
            return res.status(500).json({
                message: "Failed to fetch stores",
                error: err.message
            });
        }

        res.json(results);
    });
};

exports.searchStores = (req, res) => {

    const { search } = req.query;

    if (!search) {
        return res.status(400).json({
            message: "Search term is required"
        });
    }

    Store.search(search, (err, results) => {

        if (err) {
            return res.status(500).json({
                message: "Search failed",
                error: err.message
            });
        }

        res.json(results);
    });
};

exports.getStoreById = (req, res) => {

    const { id } = req.params;

    Store.getById(id, (err, results) => {

        if (err) {
            return res.status(500).json({
                message: "Failed to fetch store",
                error: err.message
            });
        }

        if (results.length === 0) {
            return res.status(404).json({
                message: "Store not found"
            });
        }

        res.json(results[0]);
    });
};