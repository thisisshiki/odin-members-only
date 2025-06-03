// 认证中间件
exports.isAuth = (req, res, next) => {
  if (req.isAuthenticated()) return next();
  res.redirect("/login");
};

// 管理员权限中间件
exports.isAdmin = (req, res, next) => {
  if (req.isAuthenticated() && req.user.admin) return next();
  res.status(403).send("Forbidden: Admins only");
};
