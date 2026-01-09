"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOrder = createOrder;
exports.getOrdersByUser = getOrdersByUser;
const db_1 = require("../config/db");
async function createOrder({ user_id, items }) {
    const client = await db_1.pool.connect();
    try {
        await client.query("BEGIN");
        const total = items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);
        const orderRes = await client.query(`INSERT INTO orders (user_id, total_amount, status)
       VALUES ($1, $2, 'PENDING')
       RETURNING *`, [user_id, total]);
        const order = orderRes.rows[0];
        for (const item of items) {
            await client.query(`INSERT INTO order_items (order_id, product_id, quantity, unit_price)
         VALUES ($1, $2, $3, $4)`, [order.id, item.product_id, item.quantity, item.unit_price]);
        }
        await client.query("COMMIT");
        return order;
    }
    catch (error) {
        await client.query("ROLLBACK");
        throw error;
    }
    finally {
        client.release();
    }
}
async function getOrdersByUser(user_id) {
    const res = await db_1.pool.query(`SELECT * FROM orders WHERE user_id=$1 ORDER BY created_at DESC`, [user_id]);
    return res.rows;
}
