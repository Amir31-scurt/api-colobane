"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUser = createUser;
exports.findUserByEmail = findUserByEmail;
exports.findUserById = findUserById;
exports.verifyPassword = verifyPassword;
const db_1 = require("../config/db");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
async function createUser({ name, email, password, phone, role = "CUSTOMER" }) {
    const hash = await bcryptjs_1.default.hash(password, 10);
    const query = `
    INSERT INTO users (name, email, password_hash, role, phone)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id, name, email, role, phone, created_at
  `;
    const values = [name, email, hash, role, phone || null];
    const result = await db_1.pool.query(query, values);
    return result.rows[0];
}
async function findUserByEmail(email) {
    const result = await db_1.pool.query("SELECT * FROM users WHERE email=$1", [email]);
    return result.rows[0] || null;
}
async function findUserById(id) {
    const result = await db_1.pool.query("SELECT id, name, email, role, phone, created_at FROM users WHERE id=$1", [id]);
    return result.rows[0] || null;
}
function verifyPassword(plain, hash) {
    return bcryptjs_1.default.compare(plain, hash);
}
