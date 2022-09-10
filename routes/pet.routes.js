const router = require("express").Router();

/* GET Pet Profile */
router.get("/pet-profile", (req, res, next) => {
  res.render("pet/pet-profile");
});

/* GET Pet Reports */
router.get("/pet-reports", (req, res, next) => {
  res.render("pet/pet-reports");
});

/* GET Pet Signup */
router.get("/pet-signup", (req, res, next) => {
  res.render("pet/pet-signup");
});

module.exports = router;
