const db = require('../models/db');

const getProducts = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM products ORDER BY created_at DESC');
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getProductById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query('SELECT * FROM products WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const createProduct = async (req, res) => {
  const { name, category, description } = req.body;

  if (!name) {
    return res.status(400).json({ message: 'Product name is required' });
  }

  try {
    const result = await db.query(
      'INSERT INTO products (name, category, description) VALUES ($1, $2, $3) RETURNING *',
      [name, category, description]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const updateProduct = async (req, res) => {
  const { id } = req.params;
  const { name, category, description } = req.body;

  try {
    const result = await db.query(
      'UPDATE products SET name = $1, category = $2, description = $3 WHERE id = $4 RETURNING *',
      [name, category, description, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const deleteProduct = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.query('DELETE FROM products WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json({ message: 'Product deleted successfully', id: result.rows[0].id });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};
