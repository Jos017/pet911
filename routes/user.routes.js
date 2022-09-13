const router = require("express").Router();

const mongoose = require("mongoose");
const { populate } = require("../models/Report.model");

// Models Required
const Report = require("../models/Report.model");
const User = require("../models/User.model");
const Admin = require("../models/Admin.model")

/* GET User Profile */
router.get("/user-profile", (req, res, next) => {
  const userId = req.session.user._id
  const userPrivileges = req.session.user.userPrivileges
  if (userPrivileges === 'admin') {
    console.log("User privileges", userPrivileges)
    Admin.findById(userId)
    .then(info =>{
      console.log("Informacion de usuario", info)
      res.render("user/user-profile",info);
    })
    .catch(error=>{
      console.log()
    })
  }
  if (userPrivileges === 'user') {
    User.findById(userId)
    .then(info =>{
      // console.log("Informacion de usuario", info)
      res.render("user/user-profile",info);
    })
    .catch(error=>{
      console.log()
    })
  }
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
  const {petName, situation, foundStatus, date} = req.body;
  const userId = req.session.user._id;
  Report.create({
    petName,
    situation,
    date,
    foundStatus,
    userId: userId
  })
    .then(console.log('New Report added'))
    .catch((err) => console.log(err));
})

module.exports = router;
