const {
    generateIntelligence
} = require("../services/intelligence/intelligenceService");


const getIntelligence = async (req, res) => {

    try {

        const scanId =
            req.params.scanId;


        const intelligence =
            await generateIntelligence({
                scanId,
                userId: req.userId
            });


        return res.status(200).json(
            intelligence
        );

    } catch (error) {

        console.error(
            "Intelligence error:",
            error
        );


        return res.status(
            error.statusCode || 500
        ).json({

            message:
                error.message ||
                "Failed to generate security intelligence"

        });
    }
};


module.exports = {
    getIntelligence
};