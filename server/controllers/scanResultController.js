const Scan = require("../models/scan");

const getScanResults = async (req, res) => {
    try {

        const scan = await Scan.findOne({
            _id: req.params.id,
            userId: req.userId
        });

        if (!scan) {
            return res.status(404).json({
                message: "Scan not found"
            });
        }

        res.status(200).json({
            scanId: scan._id,
            status: scan.status,
            progress: scan.progress,
            startedAt: scan.startedAt,
            completedAt: scan.completedAt,
            findings: scan.findings
        });

    } catch (error) {

        console.error(
            "Get scan results error:",
            error
        );

        res.status(500).json({
            message: "Failed to get scan results"
        });
    }
};

module.exports = {
    getScanResults
};