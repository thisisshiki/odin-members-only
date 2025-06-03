const { body, validationResult } = require("express-validator");
const Message = require("../models/message");

// 显示所有消息
exports.message_list = async (req, res, next) => {
  try {
    const messages = await Message.allWithAuthors();
    res.render("index", { messages, currentUser: req.user });
  } catch (err) {
    next(err);
  }
};

// 显示新建消息表单
exports.message_create_get = (req, res) => {
  if (!req.isAuthenticated()) return res.redirect("/login");
  res.render("message_form", { errors: [], form: {} });
};

// 处理新建消息
exports.message_create_post = [
  body("title").trim().notEmpty().withMessage("Title required."),
  body("content").trim().notEmpty().withMessage("Content required."),
  async (req, res, next) => {
    if (!req.isAuthenticated()) return res.redirect("/login");
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render("message_form", { errors: errors.array(), form: req.body });
    }
    try {
      await Message.create({
        title: req.body.title,
        content: req.body.content,
        user_id: req.user.id,
      });
      res.redirect("/");
    } catch (err) {
      next(err);
    }
  }
];

// 删除消息（仅管理员）
exports.message_delete_post = async (req, res, next) => {
  if (!req.isAuthenticated() || !req.user.admin) return res.status(403).send("Forbidden");
  try {
    await Message.deleteById(req.params.id);
    res.redirect("/");
  } catch (err) {
    next(err);
  }
};