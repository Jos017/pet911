const router = require("express").Router();

/* GET home page */
router.get("/", (req, res, next) => {
  res.render("index");
});

router.get("/recommendations", (req, res, next) => {
  res.render("recommendations");
});


module.exports = router;
