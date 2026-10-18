const Category = require('../models/Category');
const Product = require('../models/Product');
const { logAction } = require('../utils/auditLogger');

// GET /api/public/categories
exports.getPublicCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({ isActive: true }).sort({ name: 1 });
    
    // Aggregate product counts for active categories
    const counts = await Product.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$categoryId', count: { $sum: 1 } } },
    ]);
    const countMap = counts.reduce((acc, curr) => {
      acc[curr._id.toString()] = curr.count;
      return acc;
    }, {});

    const result = categories.map((cat) => ({
      ...cat.toObject(),
      productCount: countMap[cat._id.toString()] || 0,
    }));

    res.json({ success: true, categories: result });
  } catch (error) {
    next(error);
  }
};

// GET /api/admin/categories
exports.getAdminCategories = async (req, res, next) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });

    const counts = await Product.aggregate([
      { $group: { _id: '$categoryId', count: { $sum: 1 } } },
    ]);
    const countMap = counts.reduce((acc, curr) => {
      acc[curr._id.toString()] = curr.count;
      return acc;
    }, {});

    const result = categories.map((cat) => ({
      ...cat.toObject(),
      productCount: countMap[cat._id.toString()] || 0,
    }));

    res.json({ success: true, categories: result });
  } catch (error) {
    next(error);
  }
};

// POST /api/admin/categories
exports.createCategory = async (req, res, next) => {
  try {
    const { name, colorKey, description, isActive } = req.body;

    if (!name || name.trim() === '') {
      return res.status(400).json({ success: false, message: 'Category name is required' });
    }

    const existing = await Category.findOne({ name: new RegExp(`^${name.trim()}$`, 'i') });
    if (existing) {
      return res.status(400).json({ success: false, message: 'A category with this name already exists' });
    }

    const category = await Category.create({
      name: name.trim(),
      colorKey: colorKey || 'yellow',
      description: description || '',
      isActive: isActive !== undefined ? isActive : true,
    });

    await logAction({
      action: 'CATEGORY_CREATE',
      entity: 'Category',
      entityId: category._id,
      performedBy: req.user,
      details: { name: category.name, colorKey: category.colorKey },
    });

    res.status(201).json({ success: true, category, message: 'Category created successfully' });
  } catch (error) {
    next(error);
  }
};

// PUT /api/admin/categories/:id
exports.updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, colorKey, description, isActive } = req.body;

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    if (name && name.trim() !== category.name) {
      const duplicate = await Category.findOne({
        _id: { $ne: id },
        name: new RegExp(`^${name.trim()}$`, 'i'),
      });
      if (duplicate) {
        return res.status(400).json({ success: false, message: 'Another category with this name already exists' });
      }
      category.name = name.trim();
    }

    if (colorKey) category.colorKey = colorKey;
    if (description !== undefined) category.description = description;
    if (isActive !== undefined) category.isActive = isActive;

    await category.save();

    await logAction({
      action: 'CATEGORY_UPDATE',
      entity: 'Category',
      entityId: category._id,
      performedBy: req.user,
      details: { name: category.name, colorKey: category.colorKey },
    });

    res.json({ success: true, category, message: 'Category updated successfully' });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/admin/categories/:id
exports.deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reassignToCategoryId } = req.body;

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    const linkedProductsCount = await Product.countDocuments({ categoryId: id });

    if (linkedProductsCount > 0) {
      if (!reassignToCategoryId) {
        return res.status(400).json({
          success: false,
          requiresReassignment: true,
          productCount: linkedProductsCount,
          message: `This category has ${linkedProductsCount} product(s) assigned. Please select another category to reassign them before deleting.`,
        });
      }

      const targetCategory = await Category.findById(reassignToCategoryId);
      if (!targetCategory || targetCategory._id.toString() === id) {
        return res.status(400).json({
          success: false,
          message: 'Invalid target category for reassignment.',
        });
      }

      // Reassign all products
      await Product.updateMany({ categoryId: id }, { categoryId: targetCategory._id });
    }

    await Category.findByIdAndDelete(id);

    await logAction({
      action: 'CATEGORY_DELETE',
      entity: 'Category',
      entityId: id,
      performedBy: req.user,
      details: {
        deletedCategoryName: category.name,
        reassignedProductsCount: linkedProductsCount,
        reassignedTo: reassignToCategoryId || null,
      },
    });

    res.json({
      success: true,
      message: `Category '${category.name}' deleted successfully.${
        linkedProductsCount > 0 ? ` ${linkedProductsCount} product(s) reassigned.` : ''
      }`,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/admin/categories/reassign
exports.reassignProducts = async (req, res, next) => {
  try {
    const { fromCategoryId, toCategoryId } = req.body;

    if (!fromCategoryId || !toCategoryId) {
      return res.status(400).json({ success: false, message: 'Both source and target categories are required' });
    }

    if (fromCategoryId === toCategoryId) {
      return res.status(400).json({ success: false, message: 'Source and target category cannot be the same' });
    }

    const targetCategory = await Category.findById(toCategoryId);
    if (!targetCategory) {
      return res.status(404).json({ success: false, message: 'Target category not found' });
    }

    const updateResult = await Product.updateMany(
      { categoryId: fromCategoryId },
      { categoryId: toCategoryId }
    );

    await logAction({
      action: 'CATEGORY_PRODUCTS_REASSIGN',
      entity: 'Product',
      performedBy: req.user,
      details: {
        fromCategoryId,
        toCategoryId,
        modifiedCount: updateResult.modifiedCount,
      },
    });

    res.json({
      success: true,
      modifiedCount: updateResult.modifiedCount,
      message: `Successfully reassigned ${updateResult.modifiedCount} product(s) to ${targetCategory.name}.`,
    });
  } catch (error) {
    next(error);
  }
};
