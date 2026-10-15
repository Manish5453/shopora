const Product = require('../../models/Product.model');

// @desc    Get all products with pagination, search, category filter, & sorting
// @route   GET /api/v1/products
const getProducts = async (req, res, next) => {
  try {
    const keyword = req.query.keyword
      ? {
          title: {
            $regex: req.query.keyword,
            $options: 'i',
          },
        }
      : {};

    // Case-insensitive & special character safe regex filter
    let category = {};
    if (req.query.category && req.query.category !== 'All') {
      const cleanCat = req.query.category.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      category = { category: { $regex: new RegExp(`^${cleanCat}$`, 'i') } };
    }

    const filter = { ...keyword, ...category };

    // Sorting logic
    let sort = {};
    if (req.query.sort === 'price-low') {
      sort = { price: 1 };
    } else if (req.query.sort === 'price-high') {
      sort = { price: -1 };
    } else {
      sort = { createdAt: -1 };
    }

    const products = await Product.find(filter).sort(sort);
    res.json({ success: true, count: products.length, products });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single product by ID
// @route   GET /api/v1/products/:id
const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, product });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a product (Admin)
// @route   POST /api/v1/products
const createProduct = async (req, res, next) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json({ success: true, product });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a product (Admin)
// @route   PUT /api/v1/products/:id
const updateProduct = async (req, res, next) => {
  try {
    const { title, slug, description, price, category, stock, images } = req.body;
    const product = await Product.findById(req.params.id);

    if (product) {
      product.title = title || product.title;
      product.slug = slug || product.slug;
      product.description = description || product.description;
      product.price = price !== undefined ? price : product.price;
      product.category = category || product.category;
      product.stock = stock !== undefined ? stock : product.stock;
      product.images = images || product.images;

      const updatedProduct = await product.save();
      res.json({ success: true, product: updatedProduct });
    } else {
      res.status(404);
      throw new Error('Product not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a product (Admin)
// @route   DELETE /api/v1/products/:id
const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      await product.deleteOne();
      res.json({ success: true, message: 'Product removed' });
    } else {
      res.status(404);
      throw new Error('Product not found');
    }
  } catch (error) {
    next(error);
  }
};

module.exports = { 
  getProducts, 
  getProductById, 
  createProduct, 
  updateProduct, 
  deleteProduct 
};