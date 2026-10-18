const Product = require('../models/Product');
const Category = require('../models/Category');
const { uploadToCloudinary } = require('../config/cloudinary');
const { logAction } = require('../utils/auditLogger');

// GET /api/public/products
exports.getPublicProducts = async (req, res, next) => {
  try {
    const { category, search, featured, sort, limit = 50, page = 1 } = req.query;

    const query = { isActive: true };

    if (category) {
      // Check if category is slug or ObjectId
      if (category.match(/^[0-9a-fA-F]{24}$/)) {
        query.categoryId = category;
      } else {
        const cat = await Category.findOne({ slug: category });
        if (cat) query.categoryId = cat._id;
      }
    }

    if (featured === 'true') {
      query.featured = true;
    }

    if (search && search.trim() !== '') {
      query.$or = [
        { name: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    let sortObj = { createdAt: -1 };
    if (sort === 'price_asc') sortObj = { price: 1 };
    if (sort === 'price_desc') sortObj = { price: -1 };
    if (sort === 'name_asc') sortObj = { name: 1 };

    const parsedPage = Math.max(1, parseInt(page, 10));
    const parsedLimit = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (parsedPage - 1) * parsedLimit;

    const [products, total] = await Promise.all([
      Product.find(query)
        .populate('categoryId', 'name slug colorKey')
        .sort(sortObj)
        .skip(skip)
        .limit(parsedLimit),
      Product.countDocuments(query),
    ]);

    res.json({
      success: true,
      products,
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

// GET /api/public/products/:idOrSlug
exports.getPublicProductById = async (req, res, next) => {
  try {
    const { idOrSlug } = req.params;
    let query = { isActive: true };

    if (idOrSlug.match(/^[0-9a-fA-F]{24}$/)) {
      query._id = idOrSlug;
    } else {
      query.slug = idOrSlug;
    }

    const product = await Product.findOne(query).populate('categoryId', 'name slug colorKey');

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.json({ success: true, product });
  } catch (error) {
    next(error);
  }
};

// GET /api/admin/products
exports.getAdminProducts = async (req, res, next) => {
  try {
    const { category, search, stockStatus } = req.query;
    const query = {};

    if (category) query.categoryId = category;
    if (search && search.trim() !== '') {
      query.$or = [
        { name: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } },
      ];
    }
    if (stockStatus === 'low') {
      query.stock = { $lte: 5 };
    } else if (stockStatus === 'out') {
      query.stock = { $eq: 0 };
    }

    const products = await Product.find(query)
      .populate('categoryId', 'name slug colorKey')
      .sort({ createdAt: -1 });

    res.json({ success: true, products });
  } catch (error) {
    next(error);
  }
};

// POST /api/admin/products
exports.createProduct = async (req, res, next) => {
  try {
    const { name, description, categoryId, price, stock, images, isActive, featured } = req.body;

    if (!name || !categoryId || price === undefined || stock === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Name, Category, Price, and Stock are required fields.',
      });
    }

    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(400).json({ success: false, message: 'Invalid category selected.' });
    }

    const imageArray = Array.isArray(images) && images.length > 0 ? images : [
      'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=600&q=80'
    ];

    const product = await Product.create({
      name: name.trim(),
      description: description ? description.trim() : '',
      categoryId,
      price: parseFloat(price),
      stock: parseInt(stock, 10),
      images: imageArray,
      isActive: isActive !== undefined ? isActive : true,
      featured: featured !== undefined ? featured : false,
    });

    await logAction({
      action: 'PRODUCT_CREATE',
      entity: 'Product',
      entityId: product._id,
      performedBy: req.user,
      details: { name: product.name, price: product.price, stock: product.stock },
    });

    const populated = await Product.findById(product._id).populate('categoryId', 'name slug colorKey');

    res.status(201).json({
      success: true,
      product: populated,
      message: 'Product created successfully',
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/admin/products/:id
exports.updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, categoryId, price, stock, images, isActive, featured } = req.body;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    if (name) product.name = name.trim();
    if (description !== undefined) product.description = description.trim();
    if (categoryId) {
      const category = await Category.findById(categoryId);
      if (!category) {
        return res.status(400).json({ success: false, message: 'Invalid category selected.' });
      }
      product.categoryId = categoryId;
    }
    if (price !== undefined) product.price = parseFloat(price);
    if (stock !== undefined) product.stock = parseInt(stock, 10);
    if (Array.isArray(images) && images.length > 0) product.images = images;
    if (isActive !== undefined) product.isActive = isActive;
    if (featured !== undefined) product.featured = featured;

    await product.save();

    await logAction({
      action: 'PRODUCT_UPDATE',
      entity: 'Product',
      entityId: product._id,
      performedBy: req.user,
      details: { name: product.name, price: product.price, stock: product.stock },
    });

    const populated = await Product.findById(product._id).populate('categoryId', 'name slug colorKey');

    res.json({
      success: true,
      product: populated,
      message: 'Product updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/admin/products/:id
exports.deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    await Product.findByIdAndDelete(id);

    await logAction({
      action: 'PRODUCT_DELETE',
      entity: 'Product',
      entityId: id,
      performedBy: req.user,
      details: { name: product.name },
    });

    res.json({ success: true, message: `Product '${product.name}' deleted successfully` });
  } catch (error) {
    next(error);
  }
};

// POST /api/admin/products/upload-images
exports.uploadImages = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'No image files uploaded.' });
    }

    const uploadPromises = req.files.map((file) =>
      uploadToCloudinary(file.buffer, file.originalname, file.mimetype)
    );

    const urls = await Promise.all(uploadPromises);

    res.json({
      success: true,
      urls,
      message: `Uploaded ${urls.length} image(s) successfully`,
    });
  } catch (error) {
    next(error);
  }
};
