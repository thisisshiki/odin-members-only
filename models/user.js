const pool = require("../db/pool");

module.exports = {
  async findByEmail(email) {
    const res = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    return res.rows[0];
  },
  async findById(id) {
    const res = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
    return res.rows[0];
  },
  async create({ first_name, last_name, email, password_hash }) {
    const res = await pool.query(
      "INSERT INTO users (first_name, last_name, email, password_hash) VALUES ($1, $2, $3, $4) RETURNING *",
      [first_name, last_name, email, password_hash]
    );
    return res.rows[0];
  },
  async setMember(id) {
    await pool.query("UPDATE users SET is_member = true WHERE id = $1", [id]);
  },
  async setAdmin(id) {
    await pool.query("UPDATE users SET admin = true WHERE id = $1", [id]);
  }
};