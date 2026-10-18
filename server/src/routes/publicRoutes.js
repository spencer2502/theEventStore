const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const productController = require('../controllers/productController');
const orderController = require('../controllers/orderController');
const { orderLimiter } = require('../middleware/rateLimiter');

// Categories
router.get('/categories', categoryController.getPublicCategories);

// Products
router.get('/products', productController.getPublicProducts);
router.get('/products/:idOrSlug', productController.getPublicProductById);

// Cart & Orders
router.post('/cart/validate', orderController.validateCart);
router.post('/orders', orderLimiter, orderController.createStorefrontOrder);

module.exports = router;
