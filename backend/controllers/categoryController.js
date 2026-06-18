const Category = require('../models/Category');

// GET semua kategori
const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET kategori by ID
const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Kategori tidak ditemukan' });
    }
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// POST tambah kategori
const createCategory = async (req, res) => {
  try {
    const { nama_kategori, deskripsi } = req.body;
    const category = new Category({ nama_kategori, deskripsi });
    await category.save();
    res.status(201).json({ message: 'Kategori berhasil ditambahkan', category });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// PUT update kategori
const updateCategory = async (req, res) => {
  try {
    const { nama_kategori, deskripsi } = req.body;
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { nama_kategori, deskripsi },
      { new: true }
    );
    if (!category) {
      return res.status(404).json({ message: 'Kategori tidak ditemukan' });
    }
    res.json({ message: 'Kategori berhasil diupdate', category });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// DELETE kategori
const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Kategori tidak ditemukan' });
    }
    res.json({ message: 'Kategori berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
};