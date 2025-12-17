import { pool } from "../config/db";

export async function createBrand({
  name,
  slug,
  description,
  primary_color,
  secondary_color,
  logo_url
}: {
  name: string;
  slug: string;
  description?: string;
  primary_color?: string;
  secondary_color?: string;
  logo_url?: string;
}) {
  const query = `
    INSERT INTO brands (name, slug, description, primary_color, secondary_color, logo_url)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *
  `;
  const values = [name, slug, description || null, primary_color || null, secondary_color || null, logo_url || null];

  const result = await pool.query(query, values);
  return result.rows[0];
}

export async function getAllBrands() {
  const result = await pool.query(`
    SELECT id, name, slug, description, primary_color, secondary_color, logo_url, created_at
    FROM brands WHERE is_active = TRUE ORDER BY created_at DESC
  `);

  return result.rows;
}

export async function getBrandBySlug(slug: string) {
  const result = await pool.query(`SELECT * FROM brands WHERE slug=$1`, [slug]);
  return result.rows[0] || null;
}
