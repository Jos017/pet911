const router = require("express").Router();
const Pet = require("../models/Pet.model");
const User = require("../models/User.model");
const Report = require('../models/Report.model');
const mongoose = require("mongoose")
const fileUploader = require("..//config/cloudinary")

/* GET Pet Reports */
router.get("/pet-reports" ,(req, res, next) => {
  const { filter } = req.query;
  const userPrivileges = req.session.user.userPrivileges;
  let privilegesStatus;
  if (userPrivileges === 'admin') {
    privilegesStatus = true;
  } else if (userPrivileges === 'user') {
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
        privilegesStatus
      }
      res.render('pet/pet-reports',{ reportsInfo, userInSession: req.session.user });
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
      .render("pet/pet-signup", { errorMessage: "Please provide your pet name."});  
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
      res.render("pet/pet-profile", { petInfo, userInSession: req.session.user });
    })
    .catch((err) => console.log(err));
});
  
  
 
  





module.exports = router;
