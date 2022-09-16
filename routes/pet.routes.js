const router = require("express").Router();
const Pet = require("../models/pet.model");
const User = require("../models/User.model");
const Report = require('../models/report.model');
const mongoose = require("mongoose")
const fileUploader = require("..//config/cloudinary")

/* GET Pet Reports */
router.get("/pet-reports" ,(req, res, next) => {
  const { filter } = req.query;
  console.log(req.query)
  let userPrivileges;
  let privilegesStatus;
  if (!req.session.user) {
    userPrivileges = 'visitor'
  } else {
    userPrivileges = req.session.user.userPrivileges;
  }
  if (userPrivileges === 'admin') {
    privilegesStatus = true;
  } 
  else {
    privilegesStatus = false;
  }
  // Filtrando los reportes
  if (!filter || filter === '0') {
    Report.find()
      .populate({ path: 'userId'})
      .then ((reportsFiltered) => {
        reportsFiltered.forEach((report) => {
          let value = '';
          switch (report.foundStatus) {
            case '1': 
              value = 'Lost'
              break;
            case '2':
              value = 'Found but not with its owner'
              break;
            case '3':
              value = 'With its owner'
              break;
          }
        report.foundStatus = value;
      })
      const reportsInfo = {
        reportsFiltered,
        userPrivileges,
        privilegesStatus,
        userLogged: true
      }
      console.log('Primer IF', reportsInfo)
      console.log(req.session.user)
      res.render('pet/pet-reports',{ 
        reportsInfo,
        userInSession: req.session.user
      });
    })
    .catch((err) => console.log(err));
  } else {
    Report.find({foundStatus: filter})
    .populate({ path: 'userId'})
    .then ((reportsFiltered) => {
      reportsFiltered.forEach((report) => {
        let value = '';
        switch (report.foundStatus) {
          case '1': 
            value = 'Lost'
            break;
          case '2':
            value = 'Found but not with its owner'
            break;
          case '3':
            value = 'With its owner'
            break;
        }
        report.foundStatus = value;
      })
      const reportsInfo = {
        reportsFiltered,
        userPrivileges,
        privilegesStatus
      }
      console.log('Segundo IF', reportsInfo)
      res.render('pet/pet-reports', { reportsInfo, userInSession: req.session.user });
    })
    .catch((err) => console.log(err));
  }
});

/* GET Pet Signup */
router.get("/pet-signup",(req, res, next) => {
  res.render("pet/pet-signup", { userInSession: req.session.user });
});

/* POST Pet Signup*/
router.post("/pet-signup", fileUploader.single("petPic") , (req, res) => {
  const {petName, specie, petPic, description} = req.body
  const userId = req.session.user._id
  console.log(req.body)
  let newPetId;
  if (!petName) {
    return res
      .status(400)
      .render("pet/pet-signup", {
        errorMessage: "Please provide your pet name.",
        userInSession: req.session.user
      });  
  }
 
  Pet.create({
    petName,
    specie,
    petPic:req.file.path,
    description,
    owner: userId
  })
  .then((newPet)=>{
    newPetId = newPet._id;
    return User.findByIdAndUpdate(userId,{$push:{pets:newPet._id}},{new:true})
    })
  .then((newUser) => {
    req.session.user = newUser;
    res.redirect(`/pet/pet-profile/${newPetId}`)
  })
})

/* GET Pet profile */
router.get("/pet-profile/:petId", (req, res, next) => {
  const {petId} =req.params
  Pet.findById(petId)
    .then((petInfo) => {
      console.log(petInfo);
      res.render("pet/pet-profile", { petInfo, userInSession: req.session.user});
    })
    .catch((err) => console.log(err));
});

/* GET Not your report */
router.get("/not-your-report", (req, res, next) => {
  res.render("pet/not-your-report", { userInSession: req.session.user});
});

module.exports = router;
