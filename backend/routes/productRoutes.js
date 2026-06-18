const express = require('express');
const router = express.Router();
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');
const {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
} = require('../controllers/productController');

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'renttech/produk',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
  },
});
const upload = multer({ storage });

router.get('/', getAllProducts);
router.get('/:id', getProductById);
router.post('/', upload.single('gambar'), createProduct);
router.put('/:id', upload.single('gambar'), updateProduct);
router.delete('/:id', deleteProduct);

module.exports = router;