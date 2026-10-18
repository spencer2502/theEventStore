const Order = require('../models/Order');
const Product = require('../models/Product');
const { sendTelegramOrderNotification } = require('../config/telegram');
const { logAction } = require('../utils/auditLogger');

function generateOrderNumber() {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `ORD-${dateStr}-${randomSuffix}`;
}

function buildWhatsAppUrl(order) {
  const storePhone = (process.env.STORE_WHATSAPP_NUMBER || '918962690000').replace(/[^0-9]/g, '');
  const storeName = process.env.STORE_NAME || 'THE EVENT STORE';

  const itemsList = order.items
    .map((item, i) => `${i + 1}. *${item.name}* x ${item.quantity} — ₹${(item.priceAtOrder * item.quantity).toFixed(2)}`)
    .join('\n');

  const text = `
Hello ${storeName}! 👋
I would like to place an enquiry/order:

🧾 *Order ID:* ${order.orderNumber}
👤 *Name:* ${order.customerName}
📞 *Phone:* ${order.customerPhone}
📍 *Address:* ${order.customerAddress || 'Not provided'}

🛍️ *Requested Items:*
${itemsList}

💰 *Total:* ₹${order.totalAmount.toFixed(2)}

Please confirm availability and booking details. Thank you!
  `.trim();

  return `https://wa.me/${storePhone}?text=${encodeURIComponent(text)}`;
}

// POST /api/public/cart/validate
exports.validateCart = async (req, res, next) => {
  try {
    const { items } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.json({ success: true, valid: true, items: [] });
    }

    const productIds = items.map((i) => i.productId);
    const products = await Product.find({ _id: { $in: productIds } });

    const productMap = products.reduce((acc, p) => {
      acc[p._id.toString()] = p;
      return acc;
    }, {});

    let hasIssue = false;
    const validatedItems = items.map((item) => {
      const product = productMap[item.productId];
      if (!product || !product.isActive) {
        hasIssue = true;
        return {
          productId: item.productId,
          name: item.name || 'Unknown Product',
          requestedQuantity: item.quantity,
          availableStock: 0,
          currentPrice: 0,
          isAvailable: false,
          error: 'Product is no longer available',
        };
      }

      const isExceeded = item.quantity > product.stock;
      if (isExceeded) hasIssue = true;

      return {
        productId: item.productId,
        name: product.name,
        requestedQuantity: item.quantity,
        availableStock: product.stock,
        currentPrice: product.price,
        isAvailable: product.stock > 0,
        adjustedQuantity: Math.min(item.quantity, product.stock),
        error: isExceeded
          ? product.stock === 0
            ? 'Item is currently out of stock'
            : `Only ${product.stock} left in stock`
          : null,
      };
    });

    res.json({
      success: true,
      valid: !hasIssue,
      items: validatedItems,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/public/orders
exports.createStorefrontOrder = async (req, res, next) => {
  try {
    const { customerName, customerPhone, customerAddress, items, notes } = req.body;

    if (!customerName || !customerPhone || !customerAddress) {
      return res.status(400).json({
        success: false,
        message: 'Customer name, phone number, and delivery/event address are required.',
      });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart is empty.',
      });
    }

    // Hard stock check against live database
    const productIds = items.map((i) => i.productId);
    const products = await Product.find({ _id: { $in: productIds }, isActive: true });
    const productMap = products.reduce((acc, p) => {
      acc[p._id.toString()] = p;
      return acc;
    }, {});

    const orderItems = [];
    let calculatedTotal = 0;
    const stockErrors = [];

    for (const item of items) {
      const product = productMap[item.productId];
      if (!product) {
        stockErrors.push(`Item '${item.name || item.productId}' is no longer available.`);
        continue;
      }

      if (product.stock < item.quantity) {
        stockErrors.push(
          product.stock === 0
            ? `'${product.name}' is out of stock.`
            : `Only ${product.stock} available for '${product.name}' (requested ${item.quantity}).`
        );
        continue;
      }

      const itemTotal = product.price * item.quantity;
      calculatedTotal += itemTotal;

      orderItems.push({
        productId: product._id,
        name: product.name,
        quantity: item.quantity,
        priceAtOrder: product.price,
        image: product.images[0] || '',
      });
    }

    if (stockErrors.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Stock check failed. Please review your cart.',
        stockErrors,
      });
    }

    const orderNumber = generateOrderNumber();

    // Create Order record (status: pending). NOTE: Does NOT decrement stock!
    const order = await Order.create({
      orderNumber,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerAddress: customerAddress.trim(),
      items: orderItems,
      totalAmount: calculatedTotal,
      status: 'pending',
      notes: notes || '',
    });

    // Send Telegram Notification in background
    let telegramSent = false;
    try {
      telegramSent = await sendTelegramOrderNotification(order);
      if (telegramSent) {
        order.telegramNotified = true;
        await order.save();
      }
    } catch (tErr) {
      console.error('Telegram notification error:', tErr.message);
    }

    // Generate WhatsApp deep link
    const whatsappUrl = buildWhatsAppUrl(order);

    res.status(201).json({
      success: true,
      message: 'Your enquiry has been received! Our team will contact you shortly.',
      order: {
        id: order._id,
        orderNumber: order.orderNumber,
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        customerAddress: order.customerAddress,
        items: order.items,
        totalAmount: order.totalAmount,
        status: order.status,
        createdAt: order.createdAt,
      },
      whatsappUrl,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/admin/orders
exports.getAdminOrders = async (req, res, next) => {
  try {
    const { status, search, limit = 50, page = 1 } = req.query;
    const query = {};

    if (status && status !== 'all') {
      query.status = status;
    }

    if (search && search.trim() !== '') {
      query.$or = [
        { customerName: { $regex: search.trim(), $options: 'i' } },
        { customerPhone: { $regex: search.trim(), $options: 'i' } },
        { orderNumber: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    const parsedPage = Math.max(1, parseInt(page, 10));
    const parsedLimit = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (parsedPage - 1) * parsedLimit;

    const [orders, total] = await Promise.all([
      Order.find(query).sort({ createdAt: -1 }).skip(skip).limit(parsedLimit),
      Order.countDocuments(query),
    ]);

    res.json({
      success: true,
      orders,
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

// GET /api/admin/orders/:id
exports.getAdminOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    res.json({ success: true, order });
  } catch (error) {
    next(error);
  }
};

// PUT /api/admin/orders/:id/status
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['pending', 'confirmed', 'cancelled'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const order = await Order.findByIdAndUpdate(id, { status }, { new: true });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    await logAction({
      action: 'ORDER_STATUS_UPDATE',
      entity: 'Order',
      entityId: order._id,
      performedBy: req.user,
      details: { orderNumber: order.orderNumber, status },
    });

    res.json({ success: true, order, message: `Order status updated to ${status}` });
  } catch (error) {
    next(error);
  }
};
