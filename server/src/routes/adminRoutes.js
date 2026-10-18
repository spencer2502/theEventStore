const express = require("express");
const router = express.Router();
const multer = require("multer");

const { authenticate, requireRole } = require("../middleware/auth");
const productController = require("../controllers/productController");
const categoryController = require("../controllers/categoryController");
const orderController = require("../controllers/orderController");
const saleController = require("../controllers/saleController");
const inventoryController = require("../controllers/inventoryController");
const userController = require("../controllers/userController");
const dashboardController = require("../controllers/dashboardController");

// Configure Multer for in-memory file uploads (never written to server disk)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB per image
    files: 5, // max 5 images per upload
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are permitted."));
    }
  },
});

// All routes require authentication
router.use(authenticate);

// ==========================================
// Dashboard & Stats
// ==========================================
router.get(
  "/dashboard/stats",
  requireRole("admin"),
  dashboardController.getDashboardStats,
);

router.get(
  "/audit-logs",
  requireRole("admin"),
  dashboardController.getAuditLogs,
);

// ==========================================
// Product Management
// ==========================================
router.get(
  "/products",
  requireRole("admin"),
  productController.getAdminProducts,
);

router.post("/products", requireRole("admin"), productController.createProduct);

router.put(
  "/products/:id",
  requireRole("admin"),
  productController.updateProduct,
);

router.delete(
  "/products/:id",
  requireRole("admin"),
  productController.deleteProduct,
);

router.post(
  "/products/upload-images",
  requireRole("admin"),
  upload.array("images", 5),
  productController.uploadImages,
);

// ==========================================
// Category Management
// ==========================================
router.get(
  "/categories",
  requireRole("admin"),
  categoryController.getAdminCategories,
);

router.post(
  "/categories",
  requireRole("admin"),
  categoryController.createCategory,
);

router.put(
  "/categories/:id",
  requireRole("admin"),
  categoryController.updateCategory,
);

router.delete(
  "/categories/:id",
  requireRole("admin"),
  categoryController.deleteCategory,
);

router.post(
  "/categories/reassign",
  requireRole("admin"),
  categoryController.reassignProducts,
);

// ==========================================
// Inventory Reports & CSV
// ==========================================
router.get(
  "/inventory",
  requireRole("admin"),
  inventoryController.getInventoryReport,
);

router.get(
  "/inventory/export-csv",
  requireRole("admin"),
  inventoryController.exportInventoryCSV,
);

// ==========================================
// Billing & POS
// ==========================================
router.post("/sales", requireRole("admin"), saleController.createSale);

router.get("/sales", requireRole("admin"), saleController.getAdminSales);

router.get("/sales/:id", requireRole("admin"), saleController.getAdminSaleById);

// ==========================================
// Storefront Orders Inbox
// ==========================================
router.get("/orders", requireRole("admin"), orderController.getAdminOrders);

router.get(
  "/orders/:id",
  requireRole("admin"),
  orderController.getAdminOrderById,
);

router.put(
  "/orders/:id/status",
  requireRole("admin"),
  orderController.updateOrderStatus,
);

// ==========================================
// User Accounts
// ==========================================
router.get("/users", requireRole("admin"), userController.getUsers);

router.post("/users", requireRole("admin"), userController.createUser);

router.put("/users/:id", requireRole("admin"), userController.updateUser);

router.put(
  "/users/:id/password",
  requireRole("admin"),
  userController.resetUserPassword,
);

router.delete("/users/:id", requireRole("admin"), userController.deleteUser);

module.exports = router;
