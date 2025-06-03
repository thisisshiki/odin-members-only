const session = require("express-session");

module.exports = () =>
  session({
    secret: process.env.SESSION_SECRET || "devsecret",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }, // 生产环境下应为 true 并用 https
  });