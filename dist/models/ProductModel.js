"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createProduct = createProduct;
exports.getProductsByBrand = getProductsByBrand;
exports.getProductBySlug = getProductBySlug;
const db_1 = require("../config/db");
async function createProduct({ brand_id, name, slug, description, price, stock, image_url }) {
    const query = `
  INSERT INTO products (brand_id, name, slug, description, price, stock, image_url)
  VALUES ($1, $2, $3, $4, $5, $6, $7)
  RETURNING *
`;
    const values = [
        brand_id,
        name,
        slug,
        description || null,
        price,
        stock || 0,
        image_url || null
    ];
    const result = await db_1.pool.query(query, values);
    return result.rows[0];
}
async function getProductsByBrand(brand_id) {
    const result = await db_1.pool.query(`SELECT * FROM products WHERE brand_id=$1 AND is_active=TRUE ORDER BY created_at DESC`, [brand_id]);
    return result.rows;
}
async function getProductBySlug(slug) {
    const result = await db_1.pool.query(`SELECT * FROM products WHERE slug=$1`, [slug]);
    return result.rows[0] || null;
}
