const mongoose = require("mongoose");
const Website = require("../models/website");
const { normalizeUrl } = require("../utils/urlUtils");


// Add website
const addWebsite = async (req, res) => {
    try {
        const { name, url } = req.body;

        if (!name || !url) {
            return res.status(400).json({
                message: "Website name and URL are required"
            });
        }

        let normalizedUrl;

        try {
            normalizedUrl = normalizeUrl(url);
        } catch (error) {
            return res.status(400).json({
                message: error.message
            });
        }

        const existingWebsite = await Website.findOne({
            userId: req.userId,
            url: normalizedUrl
        });

        if (existingWebsite) {
            return res.status(409).json({
                message: "Website already exists"
            });
        }

        const website = await Website.create({
            userId: req.userId,
            name: name.trim(),
            url: normalizedUrl
        });

        return res.status(201).json({
            message: "Website added successfully",
            website
        });

    } catch (error) {
        console.error("Add website error:", error);

        return res.status(500).json({
            message: "Failed to add website"
        });
    }
};


// Get user's websites
const getWebsites = async (req, res) => {
    try {

        const websites = await Website.find({
            userId: req.userId
        }).sort({
            createdAt: -1
        });

        res.status(200).json({
            websites
        });

    } catch (error) {

        console.error("Get websites error:", error);

        res.status(500).json({
            message: "Server error"
        });
    }
};


// Get one website
const getWebsite = async (req, res) => {
    try {

        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                message: "Invalid website ID"
            });
        }

        const website = await Website.findOne({
            _id: req.params.id,
            userId: req.userId
        });

        if (!website) {
            return res.status(404).json({
                message: "Website not found"
            });
        }

        res.status(200).json({
            website
        });

    } catch (error) {

        console.error("Get website error:", error);

        res.status(500).json({
            message: "Server error"
        });
    }
};


// Delete website
const deleteWebsite = async (req, res) => {
    try {

        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                message: "Invalid website ID"
            });
        }

        const website = await Website.findOneAndDelete({
            _id: req.params.id,
            userId: req.userId
        });

        if (!website) {
            return res.status(404).json({
                message: "Website not found"
            });
        }

        res.status(200).json({
            message: "Website deleted successfully"
        });

    } catch (error) {

        console.error("Delete website error:", error);

        res.status(500).json({
            message: "Server error"
        });
    }
};


module.exports = {
    addWebsite,
    getWebsites,
    getWebsite,
    deleteWebsite
};
