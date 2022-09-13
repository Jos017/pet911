const router = require("express").Router();

const mongoose = require("mongoose");
const { populate } = require("../models/Report.model");

// Models Required
const Report = require("../models/Report.model");
const User = require("../models/User.model");
const Admin = require("../models/Admin.model");
const Pet = require("../models/Pet.model");

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
    return info.populate("pets")
  })
    .then((infoPopulate) =>{
      res.render("user/user-profile",infoPopulate)
    })
    .catch(error=>{
      console.log(error)
    })
  }
});

/* GET My pets */
router.get("/my-pets", (req, res, next) => {
  const userId = req.session.user._id;
  User.findById(userId)
    .then((userFound) => {
      return userFound.populate('pets');
    })
    .then((userWithPets) => {
      console.log(userWithPets);
      res.render("user/my-pets", userWithPets);
    })
    .catch((err) => console.log(err));
    
  
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
