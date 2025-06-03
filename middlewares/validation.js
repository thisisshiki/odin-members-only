const { body } = require("express-validator");

exports.signupValidation = [
  body("first_name").trim().notEmpty().withMessage("First name required."),
  body("last_name").trim().notEmpty().withMessage("Last name required."),
  body("email").isEmail().withMessage("Valid email required.").normalizeEmail(),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 chars."),
  body("confirmPassword").custom((value, { req }) => value === req.body.password)
    .withMessage("Passwords do not match."),
];

exports.postValidation = [
  body("title").trim().notEmpty().withMessage("Title required."),
  body("content").trim().notEmpty().withMessage("Content required."),
];
