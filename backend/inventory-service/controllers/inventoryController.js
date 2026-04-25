const db = require('../models/db');

const LOW_STOCK_THRESHOLD = 10;

const checkAndCreateAlert = async (productId, quantity, userId) => {
  if (quantity < LOW_STOCK_THRESHOLD) {
    try {
      // Check if an active alert already exists for this product
      const existingAlert = await db.query(
        "SELECT id FROM alerts WHERE product_id = $1 AND status = 'active'",
        [productId]
      );

      if (existingAlert.rows.length === 0) {
        await db.query(
          "INSERT INTO alerts (product_id, user_id, message, status) VALUES ($1, $2, $3, 'active')",
          [productId, userId, `Low stock alert! Only ${quantity} items left.`]
        );
        await db.query("NOTIFY new_alert, 'alert_created'");
        console.log(`Low stock alert created for product ID: ${productId} by user ID: ${userId}`);
      }
    } catch (error) {
      console.error('Error creating alert:', error);
    }
  } else {
     try {
         // Resolve any active alerts if stock is replenished
         await db.query(
             "UPDATE alerts SET status = 'resolved' WHERE product_id = $1 AND status = 'active'",
             [productId]
         );
     } catch (error) {
         console.error('Error resolving alert:', error);
     }
  }
};

const getInventory = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT i.id, i.product_id, p.name as product_name, i.quantity, i.last_updated
      FROM inventory i
      JOIN products p ON i.product_id = p.id
      ORDER BY i.last_updated DESC
    `);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching inventory:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const addInventory = async (req, res) => {
  const { product_id, quantity } = req.body;

  if (!product_id || quantity === undefined) {
    return res.status(400).json({ message: 'Product ID and quantity are required' });
  }

  try {
    const result = await db.query(
      'INSERT INTO inventory (product_id, quantity) VALUES ($1, $2) RETURNING *',
      [product_id, quantity]
    );

    // Check low stock
    await checkAndCreateAlert(product_id, quantity, req.user.id);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error adding inventory:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const updateInventory = async (req, res) => {
  const { id } = req.params;
  const { quantity } = req.body;

  try {
    const result = await db.query(
      'UPDATE inventory SET quantity = $1, last_updated = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [quantity, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Inventory record not found' });
    }

    const inventoryRecord = result.rows[0];

    // Check low stock
    await checkAndCreateAlert(inventoryRecord.product_id, inventoryRecord.quantity, req.user.id);

    res.status(200).json(inventoryRecord);
  } catch (error) {
    console.error('Error updating inventory:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const deleteInventory = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.query('DELETE FROM inventory WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Inventory record not found' });
    }

    res.status(200).json({ message: 'Inventory record deleted successfully', id: result.rows[0].id });
  } catch (error) {
    console.error('Error deleting inventory:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  getInventory,
  addInventory,
  updateInventory,
  deleteInventory
};
