const jwt = require("jsonwebtoken");
const User = require("../models/User");

const JWT_SECRET =
  process.env.JWT_SECRET || "theeventstore_jwt_secret_fallback";
const JWT_REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET || "theeventstore_refresh_secret_fallback";

/**
 * Middleware to authenticate requests via httpOnly cookie or Authorization header
 */
async function authenticate(req, res, next) {
  try {
    let token = req.cookies?.accessToken;

    if (!token && req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication required. Please log in.",
      });
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = await User.findById(decoded.id).select("-passwordHash");

      if (!user || !user.isActive) {
        return res.status(401).json({
          success: false,
          message: "User account not found or deactivated.",
        });
      }

      req.user = user;
      return next();
    } catch (jwtErr) {
      // If access token is expired, attempt seamless refresh via refreshToken cookie
      if (jwtErr.name === "TokenExpiredError" && req.cookies?.refreshToken) {
        try {
          const refreshDecoded = jwt.verify(
            req.cookies.refreshToken,
            JWT_REFRESH_SECRET,
          );
          const user = await User.findById(refreshDecoded.id);

          if (
            !user ||
            !user.isActive ||
            user.refreshToken !== req.cookies.refreshToken
          ) {
            return res.status(401).json({
              success: false,
              message: "Session expired. Please log in again.",
            });
          }

          // Generate new access token
          const newAccessToken = jwt.sign(
            { id: user._id, role: user.role, email: user.email },
            JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || "15m" },
          );

          res.cookie("accessToken", newAccessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 15 * 60 * 1000,
          });

          req.user = user;
          return next();
        } catch (refreshErr) {
          return res.status(401).json({
            success: false,
            message: "Session expired. Please log in again.",
          });
        }
      }

      return res.status(401).json({
        success: false,
        message: "Invalid authentication token.",
      });
    }
  } catch (error) {
    return next(error);
  }
}

/**
 * Middleware factory for the single administrator role.
 * The parameter is retained so existing route declarations stay explicit.
 */
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    if (
      req.user.role !== "admin" ||
      (roles.length > 0 && !roles.includes("admin"))
    ) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: '${req.user.role}' role does not have permission to perform this action.`,
      });
    }

    next();
  };
}

module.exports = {
  authenticate,
  requireRole,
};
