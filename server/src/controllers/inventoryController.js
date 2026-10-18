const Product = require('../models/Product');
const Category = require('../models/Category');

// GET /api/admin/inventory
exports.getInventoryReport = async (req, res, next) => {
  try {
    const { category, lowStockOnly, search } = req.query;
    const query = {};

    if (category) query.categoryId = category;

    if (lowStockOnly === 'true') {
      query.stock = { $lte: 5 };
    }

    if (search && search.trim() !== '') {
      query.$or = [
        { name: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    const products = await Product.find(query)
      .populate('categoryId', 'name colorKey')
      .sort({ stock: 1, name: 1 });

    const LOW_STOCK_THRESHOLD = 5;

    const report = products.map((p) => {
      let stockStatus = 'IN STOCK';
      if (p.stock === 0) {
        stockStatus = 'OUT OF STOCK';
      } else if (p.stock <= LOW_STOCK_THRESHOLD) {
        stockStatus = 'LOW STOCK';
      }

      return {
        _id: p._id,
        name: p.name,
        slug: p.slug,
        category: p.categoryId ? p.categoryId.name : 'Uncategorized',
        categoryColorKey: p.categoryId ? p.categoryId.colorKey : 'yellow',
        price: p.price,
        stock: p.stock,
        isLowStock: p.stock <= LOW_STOCK_THRESHOLD,
        isOutOfStock: p.stock === 0,
        stockStatus,
        coverImage: p.images[0] || '',
        isActive: p.isActive,
        updatedAt: p.updatedAt,
      };
    });

    const summary = {
      totalProducts: products.length,
      lowStockCount: products.filter((p) => p.stock > 0 && p.stock <= LOW_STOCK_THRESHOLD).length,
      outOfStockCount: products.filter((p) => p.stock === 0).length,
      inStockCount: products.filter((p) => p.stock > LOW_STOCK_THRESHOLD).length,
    };

    res.json({
      success: true,
      summary,
      inventory: report,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/admin/inventory/export-csv
exports.exportInventoryCSV = async (req, res, next) => {
  try {
    const products = await Product.find()
      .populate('categoryId', 'name')
      .sort({ name: 1 });

    const LOW_STOCK_THRESHOLD = 5;

    const headers = [
      'Product ID',
      'Product Name',
      'Category',
      'Listed Price (₹)',
      'Current Stock',
      'Stock Status',
      'Active Status',
      'Last Updated',
    ];

    const escapeCsv = (str) => {
      if (str === null || str === undefined) return '""';
      const s = String(str).replace(/"/g, '""');
      return `"${s}"`;
    };

    const rows = products.map((p) => {
      let stockStatus = 'IN STOCK';
      if (p.stock === 0) {
        stockStatus = 'OUT OF STOCK';
      } else if (p.stock <= LOW_STOCK_THRESHOLD) {
        stockStatus = `LOW STOCK (<= ${LOW_STOCK_THRESHOLD})`;
      }

      return [
        escapeCsv(p._id),
        escapeCsv(p.name),
        escapeCsv(p.categoryId ? p.categoryId.name : 'Uncategorized'),
        escapeCsv(p.price.toFixed(2)),
        escapeCsv(p.stock),
        escapeCsv(stockStatus),
        escapeCsv(p.isActive ? 'Active' : 'Inactive'),
        escapeCsv(new Date(p.updatedAt).toLocaleString()),
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\r\n');
    const dateStr = new Date().toISOString().slice(0, 10);
    const filename = `theeventstore-inventory-${dateStr}.csv`;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.status(200).send(csvContent);
  } catch (error) {
    next(error);
  }
};
