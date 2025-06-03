const pool = require("../db/pool");

module.exports = {
  async create({ title, content, user_id }) {
    await pool.query(
      "INSERT INTO messages (title, content, user_id) VALUES ($1, $2, $3)",
      [title, content, user_id]
    );
  },
  async allWithAuthors() {
    const res = await pool.query(
      `SELECT messages.*, users.first_name, users.last_name 
       FROM messages 
       JOIN users ON messages.user_id = users.id
       ORDER BY created_at DESC`
    );
    return res.rows;
  },
  async deleteById(id) {
    await pool.query("DELETE FROM messages WHERE id = $1", [id]);
  }
};