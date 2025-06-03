#! /usr/bin/env node

const { Client } = require("pg");
require("dotenv").config();

const SQL = `
-- 清空现有的 users 和 messages 表
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 创建 users 表
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  is_member BOOLEAN DEFAULT FALSE,
  admin BOOLEAN DEFAULT FALSE
);

-- 创建 messages 表
CREATE TABLE IF NOT EXISTS messages (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  user_id INTEGER REFERENCES users(id)
);

-- 插入一些用户
INSERT INTO users (first_name, last_name, email, password_hash, is_member)
VALUES
  ('Alice', 'Smith', 'alice@example.com', 'hashedpassword1', TRUE),
  ('Bob', 'Jones', 'bob@example.com', 'hashedpassword2', FALSE);

-- 插入一些消息
INSERT INTO messages (title, content, user_id)
VALUES
  ('Welcome', 'Welcome to the clubhouse!', 1),
  ('Hello', 'Glad to be here!', 2);
`;

async function main() {
  console.log("seeding...");
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });
  await client.connect();
  await client.query(SQL);
  await client.end();
  console.log("done");
}

main();
