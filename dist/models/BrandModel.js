"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createBrand = createBrand;
exports.getAllBrands = getAllBrands;
exports.getBrandBySlug = getBrandBySlug;
const db_1 = require("../config/db");
async function createBrand({ name, slug, description, primary_color, secondary_color, logo_url }) {
    const query = `
    INSERT INTO brands (name, slug, description, primary_color, secondary_color, logo_url)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *
  `;
    const values = [name, slug, description || null, primary_color || null, secondary_color || null, logo_url || null];
    const result = await db_1.pool.query(query, values);
    return result.rows[0];
}
async function getAllBrands() {
    const result = await db_1.pool.query(`
    SELECT id, name, slug, description, primary_color, secondary_color, logo_url, created_at
    FROM brands WHERE is_active = TRUE ORDER BY created_at DESC
  `);
    return result.rows;
}
async function getBrandBySlug(slug) {
    const result = await db_1.pool.query(`SELECT * FROM brands WHERE slug=$1`, [slug]);
    return result.rows[0] || null;
}
