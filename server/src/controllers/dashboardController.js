const Sale = require('../models/Sale');
const Order = require('../models/Order');
const Product = require('../models/Product');
const AuditLog = require('../models/AuditLog');

// GET /api/admin/dashboard/stats
exports.getDashboardStats = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      salesAggregate,
      todaySalesAggregate,
      totalOrdersCount,
      pendingOrdersCount,
      totalProductsCount,
      lowStockProducts,
      recentSales,
      recentOrders,
      recentLogs,
    ] = await Promise.all([
      // All time sales total & revenue
      Sale.aggregate([
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$totalAmount' },
            totalSalesCount: { $sum: 1 },
          },
        },
      ]),
      // Today's sales
      Sale.aggregate([
        { $match: { createdAt: { $gte: today } } },
        {
          $group: {
            _id: null,
            todayRevenue: { $sum: '$totalAmount' },
            todaySalesCount: { $sum: 1 },
          },
        },
      ]),
      // Orders
      Order.countDocuments(),
      Order.countDocuments({ status: 'pending' }),
      // Products
      Product.countDocuments({ isActive: true }),
      // Low stock list (stock <= 5)
      Product.find({ stock: { $lte: 5 } })
        .populate('categoryId', 'name colorKey')
        .sort({ stock: 1 })
        .limit(10),
      // Recent sales
      Sale.find().sort({ createdAt: -1 }).limit(5),
      // Recent storefront orders
      Order.find().sort({ createdAt: -1 }).limit(5),
      // Recent audit logs
      AuditLog.find().sort({ createdAt: -1 }).limit(10),
    ]);

    const totalRevenue = salesAggregate[0]?.totalRevenue || 0;
    const totalSalesCount = salesAggregate[0]?.totalSalesCount || 0;
    const todayRevenue = todaySalesAggregate[0]?.todayRevenue || 0;
    const todaySalesCount = todaySalesAggregate[0]?.todaySalesCount || 0;

    res.json({
      success: true,
      stats: {
        totalRevenue,
        totalSalesCount,
        todayRevenue,
        todaySalesCount,
        totalOrdersCount,
        pendingOrdersCount,
        totalProductsCount,
        lowStockCount: lowStockProducts.length,
      },
      lowStockProducts,
      recentSales,
      recentOrders,
      recentLogs,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/admin/audit-logs
exports.getAuditLogs = async (req, res, next) => {
  try {
    const { limit = 50, page = 1 } = req.query;
    const parsedPage = Math.max(1, parseInt(page, 10));
    const parsedLimit = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (parsedPage - 1) * parsedLimit;

    const [logs, total] = await Promise.all([
      AuditLog.find().sort({ createdAt: -1 }).skip(skip).limit(parsedLimit),
      AuditLog.countDocuments(),
    ]);

    res.json({
      success: true,
      logs,
      pagination: {
        total,
        page: parsedPage,
        limit: parsedLimit,
        pages: Math.ceil(total / parsedLimit),
      },
    });
  } catch (error) {
    next(error);
  }
};
