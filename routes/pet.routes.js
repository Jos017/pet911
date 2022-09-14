const router = require("express").Router();
const Pet = require("../models/Pet.model");
const User = require("../models/User.model");
const Report = require('../models/Report.model');
const mongoose = require("mongoose")

/* GET Pet Profile */
// router.get("/pet-profile", (req, res, next) => {
//   res.render("pet/pet-profile");
// });

/* GET Pet Reports */
router.get("/pet-reports", (req, res, next) => {
  const { filter } = req.query;
  
  // Filtrando los reportes
  const reportsArrayPopulated = []
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
            value = 'Lost but not with its owner'
            break;
          case '3':
            value = 'Lost but not with its owner'
            break;
        }
        report.foundStatus = value;
      })

      res.render('pet/pet-reports', { reportsFiltered });
    })
    .catch((err) => console.log(err))
});

/* GET Pet Signup */
router.get("/pet-signup", (req, res, next) => {
  res.render("pet/pet-signup");
});

router.post("/pet-signup", (req, res) => {
 const {petName, specie, picture, description} = req.body
 const userId = req.session.user._id
 if (!petName) {
  return res
    .status(400)
    .render("pet/pet-signup", { errorMessage: "Please provide your pet name."});  
}
if (!picture) {
  return res
    .status(400)
    .render("pet/pet-signup", { errorMessage: "Please provide a picture of your pet."});  
}
 
  Pet.create({
    petName,
    specie,
    picture,
    description,
    owner: userId
  })
  .then((newPet)=>{
    return User.findByIdAndUpdate(userId,{$push:{pets:newPet._id}},{new:true})
    })
  .then((newUser) => {
    res.redirect("/pet/pet-profile")
  })
})

//Get pet Profile

router.get("/pet-profile/:petId", (req, res, next) => {
  
  const {petId} =req.params

    Pet.findById(petId)
    .then((petInfo) => {
      console.log(petInfo);
      res.render("pet/pet-profile", petInfo);
    })
    .catch((err) => console.log(err));
  });
  
  
 
  





module.exports = router;
