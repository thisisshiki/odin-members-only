const { body, validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const passport = require("passport");
const User = require("../models/user");

// 注册页面
exports.signup_get = (req, res) => {
  res.render("signup", { errors: [], form: {} });
};

// 注册处理
exports.signup_post = [
  body("first_name").trim().notEmpty().withMessage("First name required."),
  body("last_name").trim().notEmpty().withMessage("Last name required."),
  body("email").isEmail().withMessage("Valid email required.").normalizeEmail(),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 chars."),
  body("confirmPassword").custom((value, { req }) => value === req.body.password)
    .withMessage("Passwords do not match."),
  async (req, res, next) => {
    const errors = validationResult(req);
    const { first_name, last_name, email, password } = req.body;
    if (!errors.isEmpty()) {
      return res.render("signup", { errors: errors.array(), form: req.body });
    }
    try {
      const existing = await User.findByEmail(email);
      if (existing) {
        return res.render("signup", { errors: [{ msg: "Email already registered." }], form: req.body });
      }
      const hash = await bcrypt.hash(password, 10);
      await User.create({ first_name, last_name, email, password_hash: hash });
      res.redirect("/login");
    } catch (err) {
      next(err);
    }
  }
];

// 登录页面
exports.login_get = (req, res) => {
  res.render("login", { errors: [] });
};

// 登录处理
exports.login_post = passport.authenticate("local", {
  successRedirect: "/",
  failureRedirect: "/login",
  failureFlash: false,
});

// 退出登录
exports.logout_get = (req, res, next) => {
  req.logout(err => {
    if (err) return next(err);
    res.redirect("/");
  });
};

// 加入俱乐部页面
exports.join_get = (req, res) => {
  if (!req.isAuthenticated()) return res.redirect("/login");
  res.render("join", { errors: [] });
};

// 加入俱乐部处理
exports.join_post = [
  body("passcode").trim().notEmpty().withMessage("Passcode required."),
  async (req, res, next) => {
    if (!req.isAuthenticated()) return res.redirect("/login");
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render("join", { errors: errors.array() });
    }
    if (req.body.passcode === process.env.CLUB_PASSCODE) {
      await User.setMember(req.user.id);
      req.user.is_member = true;
      return res.redirect("/");
    } else {
      return res.render("join", { errors: [{ msg: "Incorrect passcode." }] });
    }
  }
];