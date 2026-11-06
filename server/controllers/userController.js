const User = require("../models/user");

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(
      req.userId
    ).select(
      "name email createdAt"
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.status(200).json({
      user,
    });
  } catch (error) {
    console.error(
      "Get profile error:",
      error
    );

    return res.status(500).json({
      message: "Failed to fetch profile",
    });
  }
};

module.exports = {
  getProfile,
};