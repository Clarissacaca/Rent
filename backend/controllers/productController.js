const Product = require('../models/Product');
const Category = require('../models/Category');
require('dotenv').config();

const getAllProducts = async (req, res) => {
  try {
    const { kategori } = req.query;
    const filter = {};

    if (kategori && kategori.toLowerCase() !== 'semua') {
      const cat = await Category.findOne({
        nama_kategori: { $regex: `^${kategori}$`, $options: 'i' }
      });

      if (!cat) {
        return res.json([]);
      }
      filter.kategori = cat._id;
    }

    const products = await Product.find(filter).populate('kategori');
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('kategori');
    if (!product) return res.status(404).json({ message: 'Produk tidak ditemukan' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const createProduct = async (req, res) => {
  try {
    const { nama_produk, deskripsi, harga_sewa, stok, kategori } = req.body;
    const gambar = req.file ? req.file.path : null; // ✅ path = URL Cloudinary

    const product = new Product({
      nama_produk,
      deskripsi,
      harga_sewa: Number(harga_sewa),
      stok: Number(stok),
      kategori: kategori || null,
      gambar
    });

    await product.save();
    res.status(201).json({ message: 'Produk berhasil ditambahkan', product });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { nama_produk, deskripsi, harga_sewa, stok, kategori, status } = req.body;
    const updateData = {
      nama_produk,
      deskripsi,
      harga_sewa: Number(harga_sewa),
      stok: Number(stok),
      kategori: kategori || null,
      status
    };
    if (req.file) { // ✅ fix: tadinya req.files (tidak pernah terisi karena upload.single)
      updateData.gambar = req.file.path;
    }

    const product = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!product) return res.status(404).json({ message: 'Produk tidak ditemukan' });
    res.json({ message: 'Produk berhasil diupdate', product });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: 'Produk tidak ditemukan' });
    res.json({ message: 'Produk berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct };