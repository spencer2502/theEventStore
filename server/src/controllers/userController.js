const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { logAction } = require("../utils/auditLogger");

// Password complexity helper (min 6 chars, at least 1 number)
function validatePasswordComplexity(password) {
  if (!password || password.length < 6) {
    return "Password must be at least 6 characters long";
  }
  if (!/\d/.test(password)) {
    return "Password must contain at least one number";
  }
  return null;
}

// GET /api/admin/users
exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find()
      .select("-passwordHash -refreshToken")
      .sort({ createdAt: -1 });
    res.json({ success: true, users });
  } catch (error) {
    next(error);
  }
};

// POST /api/admin/users
exports.createUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Name, email, and password are required",
        });
    }

    const complexityError = validatePasswordComplexity(password);
    if (complexityError) {
      return res.status(400).json({ success: false, message: complexityError });
    }

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res
        .status(400)
        .json({
          success: false,
          message: "A user with this email already exists",
        });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash,
      role: "admin",
      isActive: true,
    });

    await logAction({
      action: "USER_CREATE",
      entity: "User",
      entityId: newUser._id,
      performedBy: req.user,
      details: { name: newUser.name, email: newUser.email, role: newUser.role },
    });

    res.status(201).json({
      success: true,
      message: `User '${newUser.name}' created with role '${newUser.role}'`,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        isActive: newUser.isActive,
      },
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/admin/users/:id
exports.updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, email, isActive } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Protect against self-deactivation
    if (req.user._id.toString() === id) {
      if (isActive === false) {
        return res
          .status(400)
          .json({
            success: false,
            message: "You cannot deactivate your own account",
          });
      }
    }

    if (name) user.name = name.trim();
    if (email && email.toLowerCase().trim() !== user.email) {
      const duplicate = await User.findOne({
        _id: { $ne: id },
        email: email.toLowerCase().trim(),
      });
      if (duplicate) {
        return res
          .status(400)
          .json({
            success: false,
            message: "Email is already in use by another account",
          });
      }
      user.email = email.toLowerCase().trim();
    }
    user.role = "admin";
    if (isActive !== undefined) {
      user.isActive = isActive;
    }

    await user.save();

    await logAction({
      action: "USER_UPDATE",
      entity: "User",
      entityId: user._id,
      performedBy: req.user,
      details: { name: user.name, role: user.role, isActive: user.isActive },
    });

    res.json({
      success: true,
      message: "User updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/admin/users/:id/password
exports.resetUserPassword = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    const complexityError = validatePasswordComplexity(newPassword);
    if (complexityError) {
      return res.status(400).json({ success: false, message: complexityError });
    }

    const user = await User.findById(id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    user.refreshToken = null; // force re-login
    await user.save();

    await logAction({
      action: "USER_PASSWORD_RESET",
      entity: "User",
      entityId: user._id,
      performedBy: req.user,
      details: { userEmail: user.email },
    });

    res.json({
      success: true,
      message: `Password reset successfully for ${user.name}`,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/admin/users/:id
exports.deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (req.user._id.toString() === id) {
      return res
        .status(400)
        .json({
          success: false,
          message: "You cannot delete your own account",
        });
    }

    const user = await User.findById(id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    await User.findByIdAndDelete(id);

    await logAction({
      action: "USER_DELETE",
      entity: "User",
      entityId: id,
      performedBy: req.user,
      details: { deletedEmail: user.email, name: user.name },
    });

    res.json({
      success: true,
      message: `User '${user.name}' deleted successfully`,
    });
  } catch (error) {
    next(error);
  }
};
