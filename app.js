const express = require("express");
const path = require("path");
const createError = require("http-errors");
const passport = require("passport");
const sessionConfig = require("./config/sessionConfig");
require("dotenv").config();

const routes = require("./routes/index");
const errorHandler = require("./middleware/errorHandler");

const app = express();

// 设置视图引擎为 EJS
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// 中间件
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Session 和 Passport
app.use(sessionConfig());
app.use(passport.initialize());
app.use(passport.session());

// 当前用户信息传递到模板
app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  next();
});

// 加载 passport 策略
require("./config/passportConfig");

// 路由
app.use("/", routes);

// 404 处理
app.use((req, res, next) => {
  next(createError(404));
});

// 全局错误处理
app.use(errorHandler);

// 启动服务器
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

module.exports = app;