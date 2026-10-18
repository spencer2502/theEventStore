const Sale = require('../models/Sale');
const Product = require('../models/Product');
const Order = require('../models/Order');
const { logAction } = require('../utils/auditLogger');

function generateBillNumber() {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `BILL-${dateStr}-${randomSuffix}`;
}

// POST /api/admin/sales
exports.createSale = async (req, res, next) => {
  try {
    const { items, paymentMethod, customerName, customerPhone, customerAddress, notes, linkedOrderId } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one line item is required to finalize a bill.',
      });
    }

    // Step 1: Pre-validate all items exist and have valid soldPrices and quantities
    for (const item of items) {
      if (!item.productId || !item.quantitySold || item.quantitySold <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Each item must have a valid productId and positive quantity.',
        });
      }
      if (item.soldPrice === undefined || item.soldPrice < 0) {
        return res.status(400).json({
          success: false,
          message: 'Sold price must be greater than or equal to 0.',
        });
      }
    }

    // Step 2: Atomic stock deduction with rollback capability if any item fails
    const decrementedItems = [];
    const processedItems = [];
    let grandTotal = 0;

    for (const item of items) {
      const quantitySold = parseInt(item.quantitySold, 10);
      const soldPrice = parseFloat(item.soldPrice);
      const subtotal = quantitySold * soldPrice;

      // ATOMIC UPDATE: Only decrements if current stock >= quantitySold
      const updatedProduct = await Product.findOneAndUpdate(
        { _id: item.productId, stock: { $gte: quantitySold } },
        { $inc: { stock: -quantitySold } },
        { new: true }
      );

      if (!updatedProduct) {
        // Find current product to provide clear error message
        const currentProd = await Product.findById(item.productId);
        const available = currentProd ? currentProd.stock : 0;
        const prodName = currentProd ? currentProd.name : item.name || 'Item';

        // ROLLBACK previously decremented items
        for (const rolledItem of decrementedItems) {
          await Product.findByIdAndUpdate(rolledItem.productId, {
            $inc: { stock: rolledItem.quantitySold },
          });
        }

        return res.status(409).json({
          success: false,
          message: `Cannot finalize bill: Insufficient stock for '${prodName}'. Available: ${available}, Requested: ${quantitySold}. All stock changes rolled back.`,
        });
      }

      decrementedItems.push({
        productId: item.productId,
        quantitySold,
      });

      processedItems.push({
        productId: updatedProduct._id,
        name: updatedProduct.name,
        quantitySold,
        soldPrice,
        subtotal,
      });

      grandTotal += subtotal;
    }

    const billNumber = generateBillNumber();

    // Step 3: Create finalized Sale record
    const sale = await Sale.create({
      billNumber,
      items: processedItems,
      totalAmount: grandTotal,
      createdBy: req.user._id,
      createdByName: req.user.name,
      linkedOrderId: linkedOrderId || null,
      paymentMethod: paymentMethod || 'cash',
      customerName: customerName ? customerName.trim() : 'Walk-in Customer',
      customerPhone: customerPhone ? customerPhone.trim() : '',
      customerAddress: customerAddress ? customerAddress.trim() : '',
      notes: notes || '',
    });

    // Step 4: If linked to an order enquiry, mark that Order as confirmed
    if (linkedOrderId) {
      await Order.findByIdAndUpdate(linkedOrderId, { status: 'confirmed' });
    }

    // Step 5: Audit log
    await logAction({
      action: 'SALE_FINALIZE',
      entity: 'Sale',
      entityId: sale._id,
      performedBy: req.user,
      details: {
        billNumber: sale.billNumber,
        totalAmount: sale.totalAmount,
        itemCount: sale.items.length,
        linkedOrderId,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Bill finalized successfully and inventory adjusted.',
      sale,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/admin/sales
exports.getAdminSales = async (req, res, next) => {
  try {
    const { search, startDate, endDate, limit = 50, page = 1 } = req.query;
    const query = {};

    if (search && search.trim() !== '') {
      query.$or = [
        { billNumber: { $regex: search.trim(), $options: 'i' } },
        { customerName: { $regex: search.trim(), $options: 'i' } },
        { customerPhone: { $regex: search.trim(), $options: 'i' } },
        { customerAddress: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.createdAt.$lte = end;
      }
    }

    const parsedPage = Math.max(1, parseInt(page, 10));
    const parsedLimit = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (parsedPage - 1) * parsedLimit;

    const [sales, total] = await Promise.all([
      Sale.find(query)
        .populate('createdBy', 'name email role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parsedLimit),
      Sale.countDocuments(query),
    ]);

    res.json({
      success: true,
      sales,
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

// GET /api/admin/sales/:id
exports.getAdminSaleById = async (req, res, next) => {
  try {
    const sale = await Sale.findById(req.params.id).populate('createdBy', 'name email role');
    if (!sale) {
      return res.status(404).json({ success: false, message: 'Sale record not found' });
    }
    res.json({ success: true, sale });
  } catch (error) {
    next(error);
  }
};
