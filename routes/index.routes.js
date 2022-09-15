const router = require("express").Router();

/* GET home page */
router.get("/", (req, res, next) => {
  res.render("index", {userInSession: req.session.user});
});

router.get("/recommendations", (req, res, next) => {
  res.render("recommendations", { userInSession: req.session.user});
});


module.exports = router;
