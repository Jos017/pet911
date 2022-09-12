const router = require("express").Router();

const mongoose = require("mongoose");
const { populate } = require("../models/Report.model");

// Models Required
const Report = require("../models/Report.model");
const User = require("../models/User.model");

/* GET User Profile */
router.get("/user-profile", (req, res, next) => {
  res.render("user/user-profile");
});

/* GET My pets */
router.get("/my-pets", (req, res, next) => {
  res.render("user/my-pets");
});

/* GET New Report */
router.get("/new-report", (req, res, next) => {
  res.render("user/new-report");
})

/* POST New Report */
router.post("/new-report", (req, res) => {
  const {petName, situation, date} = req.body;
  const userId = req.session.user._id;
  Report.create({
    petName,
    situation,
    date,
    userId: userId
  })
    .then(console.log('New Report added'))
    .catch((err) => console.log(err));
})

module.exports = router;
