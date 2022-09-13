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
      console.log("Informacion de usuario", info)
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
  const userId = req.session.user._id;
  User.findById(userId)
    .then((userFound) => {
      return userFound.populate('pets');
    })
    .then((userWithPets) => {
      console.log(userWithPets);
      res.render("user/new-report", userWithPets);
    })
    .catch((err) => console.log(err));
})

/* POST New Report */
router.post("/new-report", (req, res) => {
  const {petName, situation, foundStatus, date} = req.body;
  const userId = req.session.user._id;
  
  if (!petName) {
    return res.status(400).render('user/new-report', {
      errorMessage: 'Please provide a Pet name.'
    });
  }

  if (!date) {
    return res.status(400).render('user/new-report', {
      errorMessage: 'Give a valid date'
    });
  }

  if (!situation) {
    return res.status(400).render('user/new-report', {
      errorMessage: 'We need some information about your report, please provide some details'
    });
  }

  // User.findById(userId)
  //   .then((userFound) => {
  //     const { pets } = userFound;
  //     if(pets.length < 1) {
  //       return res.status(400).render("user/new-report", {
  //         errorMessage: "No pet registered, register your pet"
  //       });
  //     }
  //     pets.forEach( pet => {
  //       if ()
  //     });
  //   });
  
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
