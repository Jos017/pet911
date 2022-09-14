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
    .then(() => {
      console.log('New Report added')
      res.redirect('/pet/pet-reports')
    })
    .catch((err) => console.log(err));
})
 
// edit user
router.get("/edit-userProfile", async (req, res) => {
  const edit = await User.findById(req.session.user._id)
  console.log(edit)
  res.render("user/edit-userProfile", edit)
}) 

router.post("/edit-userProfile", (req, res) => {
  const {username, firstName, lastName, email, password, phone, address} = req.body
  const userId = req.session.user._id
  if (!username) {
    console.log("1")
    return res.status(400).render("auth/signup", {
      errorMessage: "Please provide a username.",
    });
  } 

  if(!email){
    console.log("3")
    return res.status(400).render("auth/signup", {
      errorMessage: "Please provide a email.",
    });
  } 

  const regex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}/;

  if (!regex.test(password)) {
    return res.status(400).render("auth/signup", {
      errorMessage:
        "Password needs to have at least 8 chars and must contain at least one number, one lowercase and one uppercase letter.",
    });
  }

  if(!phone){
    return res.status(400).render("auth/signup", {
      errorMessage: "Please provide a phone number."
    });
  }

  if(!address){
    return res.status(400).render("auth/signup", {
      errorMessage: "Please provide an address."
    });
  }
  User.findByIdAndUpdate(userId, {username, firstName, lastName, email, password, phone, address}, {new: true})
  .then((userUpdate) => {
    req.session.user = userUpdate
    res.redirect("/user/user-profile")
  })
 
})


module.exports = router;
