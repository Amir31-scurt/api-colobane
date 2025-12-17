import { pool } from "../config/db";

export async function createProduct({
  brand_id,
  name,
  slug,
  description,
  price,
  stock,
  image_url
}: {
  brand_id: number;
  name: string;
  slug: string;
  description?: string;
  price: number;
  stock?: number;
  image_url?: string;
}) {
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

  const result = await pool.query(query, values);
  return result.rows[0];
}

export async function getProductsByBrand(brand_id: number) {
  const result = await pool.query(
    `SELECT * FROM products WHERE brand_id=$1 AND is_active=TRUE ORDER BY created_at DESC`,
    [brand_id]
  );
  return result.rows;
}

export async function getProductBySlug(slug: string) {
  const result = await pool.query(`SELECT * FROM products WHERE slug=$1`, [slug]);
  return result.rows[0] || null;
}
