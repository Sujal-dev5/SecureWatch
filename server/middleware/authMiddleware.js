const jwt = require("jsonwebtoken");

const protect = (req, res, next) => {
    try {
        const authHeader =
            req.headers.authorization;

        if (
            !authHeader ||
            !authHeader.startsWith("Bearer ")
        ) {
            return res.status(401).json({
                message: "Authentication required"
            });
        }

        const token =
            authHeader.slice(7).trim();

        if (!token) {
            return res.status(401).json({
                message: "Authentication required"
            });
        }

        if (!process.env.JWT_SECRET) {
            console.error(
                "JWT_SECRET is not configured"
            );

            return res.status(500).json({
                message:
                    "Authentication service is not configured"
            });
        }

        const decoded =
            jwt.verify(
                token,
                process.env.JWT_SECRET
            );

        if (!decoded.userId) {
            return res.status(401).json({
                message: "Invalid token"
            });
        }

        req.userId = decoded.userId;

        next();

    } catch (error) {
        return res.status(401).json({
            message:
                "Invalid or expired token"
        });
    }
};

module.exports = protect;