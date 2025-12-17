import { pool } from "../config/db";

export async function createOrder({
  user_id,
  items
}: {
  user_id: number;
  items: { product_id: number; quantity: number; unit_price: number }[];
}) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const total = items.reduce(
      (sum, item) => sum + item.quantity * item.unit_price,
      0
    );

    const orderRes = await client.query(
      `INSERT INTO orders (user_id, total_amount, status)
       VALUES ($1, $2, 'PENDING')
       RETURNING *`,
      [user_id, total]
    );

    const order = orderRes.rows[0];

    for (const item of items) {
      await client.query(
        `INSERT INTO order_items (order_id, product_id, quantity, unit_price)
         VALUES ($1, $2, $3, $4)`,
        [order.id, item.product_id, item.quantity, item.unit_price]
      );
    }

    await client.query("COMMIT");
    return order;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function getOrdersByUser(user_id: number) {
  const res = await pool.query(
    `SELECT * FROM orders WHERE user_id=$1 ORDER BY created_at DESC`,
    [user_id]
  );
  return res.rows;
}
