const User = require("../models/User");

const requireAuth = async (req, res, next) => {
  try {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({
        message: "Authentication required. Please log in to continue."
      });
    }

    const user = await User.findById(req.session.userId);
    if (!user) {
      req.session.destroy();
      return res.status(401).json({
        message: "User session is invalid or user was removed."
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(500).json({ message: "Internal server error during authentication" });
  }
};

module.exports = {
  requireAuth
};
