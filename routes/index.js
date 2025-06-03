const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const passport = require("passport");
const pool = require("../db/pool");
const { isAuth, isAdmin } = require("../middlewares/auth");
const { signupValidation, postValidation } = require("../middlewares/validation");

// 用户信息传递到模板
router.all("*", (req, res, next) => {
  if (req.user) res.locals.currentUser = req.user;
  next();
});

// 首页：显示所有消息
router.get("/", async (req, res, next) => {
  try {
    const messages = await pool.query(
      `SELECT messages.*, users.first_name, users.last_name 
       FROM messages 
       JOIN users ON messages.user_id = users.id
       ORDER BY created_at DESC`
    );
    res.render("index", { messages: messages.rows, currentUser: req.user });
  } catch (err) {
    next(err);
  }
});

// 注册页面
router.get("/signup", (req, res) => {
  res.render("signup", { errors: [], form: {} });
});

// 注册处理
router.post("/signup", signupValidation, async (req, res, next) => {
  const errors = validationResult(req);
  const { first_name, last_name, email, password } = req.body;
  if (!errors.isEmpty()) {
    return res.render("signup", { errors: errors.array(), form: req.body });
  }
  try {
    const hash = await bcrypt.hash(password, 10);
    await pool.query(
      "INSERT INTO users (first_name, last_name, email, password_hash) VALUES ($1, $2, $3, $4)",
      [first_name, last_name, email, hash]
    );
    res.redirect("/login");
  } catch (err) {
    if (err.code === "23505") {
      // 邮箱唯一约束
      return res.render("signup", { errors: [{ msg: "Email already registered." }], form: req.body });
    }
    next(err);
  }
});

// 登录页面
router.get("/login", (req, res) => {
  res.render("login", { errors: [] });
});

// 登录处理
router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: false,
  })
);

// 退出登录
router.get("/logout", isAuth, (req, res, next) => {
  req.logout(err => {
    if (err) return next(err);
    res.redirect("/");
  });
});

// 加入俱乐部页面
router.get("/join", isAuth, (req, res) => {
  res.render("join", { errors: [] });
});

// 加入俱乐部处理
router.post(
  "/join",
  isAuth,
  body("passcode").trim().notEmpty().withMessage("Passcode required."),
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render("join", { errors: errors.array() });
    }
    if (req.body.passcode === process.env.CLUB_PASSCODE) {
      await pool.query("UPDATE users SET is_member = true WHERE id = $1", [req.user.id]);
      req.user.is_member = true;
      return res.redirect("/");
    } else {
      return res.render("join", { errors: [{ msg: "Incorrect passcode." }] });
    }
  }
);

// 新建消息页面
router.get("/new-message", isAuth, (req, res) => {
  res.render("message_form", { errors: [], form: {} });
});

// 新建消息处理
router.post(
  "/new-message",
  isAuth,
  postValidation,
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render("message_form", { errors: errors.array(), form: req.body });
    }
    try {
      await pool.query(
        "INSERT INTO messages (title, content, user_id) VALUES ($1, $2, $3)",
        [req.body.title, req.body.content, req.user.id]
      );
      res.redirect("/");
    } catch (err) {
      next(err);
    }
  }
);

// 删除消息（仅管理员）
router.post("/message/:id/delete", isAdmin, async (req, res, next) => {
  try {
    await pool.query("DELETE FROM messages WHERE id = $1", [req.params.id]);
    res.redirect("/");
  } catch (err) {
    next(err);
  }
});

module.exports = router;