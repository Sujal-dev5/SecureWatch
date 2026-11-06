const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/user");

const registerUser = async (req, res) => {
    try {
        const {
            name,
            email,
            password
        } = req.body;

        // Validate required fields
        if (
            !name ||
            !email ||
            !password
        ) {
            return res.status(400).json({
                message:
                    "Name, email and password are required"
            });
        }

        const trimmedName =
            name.trim();

        const normalizedEmail =
            email.trim().toLowerCase();

        // Basic password validation
        if (password.length < 6) {
            return res.status(400).json({
                message:
                    "Password must be at least 6 characters long"
            });
        }

        // Check if user already exists
        const existingUser =
            await User.findOne({
                email: normalizedEmail
            });

        if (existingUser) {
            return res.status(409).json({
                message:
                    "User already exists with this email"
            });
        }

        // Hash password
        const hashedPassword =
            await bcrypt.hash(
                password,
                10
            );

        // Create user
        const user =
            await User.create({
                name: trimmedName,
                email: normalizedEmail,
                password: hashedPassword
            });

        return res.status(201).json({
            message:
                "User registered successfully",

            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {
        console.error(
            "Register user error:",
            error
        );

        return res.status(500).json({
            message:
                "Failed to register user"
        });
    }
};


const loginUser = async (req, res) => {
    try {
        const {
            email,
            password
        } = req.body;

        // Validate required fields
        if (
            !email ||
            !password
        ) {
            return res.status(400).json({
                message:
                    "Email and password are required"
            });
        }

        const normalizedEmail =
            email.trim().toLowerCase();

        // Find user
        const user =
            await User.findOne({
                email: normalizedEmail
            });

        if (!user) {
            return res.status(401).json({
                message:
                    "Invalid email or password"
            });
        }

        // Compare password
        const isPasswordValid =
            await bcrypt.compare(
                password,
                user.password
            );

        if (!isPasswordValid) {
            return res.status(401).json({
                message:
                    "Invalid email or password"
            });
        }

        // Make sure JWT secret exists
        if (!process.env.JWT_SECRET) {
            console.error(
                "JWT_SECRET is not configured"
            );

            return res.status(500).json({
                message:
                    "Authentication service is not configured"
            });
        }

        // Generate JWT
        const token =
            jwt.sign(
                {
                    userId: user._id.toString()
                },
                process.env.JWT_SECRET,
                {
                    expiresIn: "7d"
                }
            );

        return res.status(200).json({
            message:
                "Login successful",

            token,

            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {
        console.error(
            "Login user error:",
            error
        );

        return res.status(500).json({
            message:
                "Failed to login"
        });
    }
};


module.exports = {
    registerUser,
    loginUser
};