const router = require("express").Router();

/* GET User Profile */
router.get("/user-profile", (req, res, next) => {
  res.render("user/user-profile");
});

/* GET My pets */
router.get("/my-pets", (req, res, next) => {
  res.render("user/my-pets");
});

module.exports = router;
