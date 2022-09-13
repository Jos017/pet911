const router = require("express").Router();
const Pet = require("../models/Pet.model");
const User = require("../models/User.model");
const Report = require('../models/Report.model');
const mongoose = require("mongoose")

/* GET Pet Profile */
router.get("/pet-profile", (req, res, next) => {
  res.render("pet/pet-profile");
});

/* GET Pet Reports */
router.get("/pet-reports", (req, res, next) => {
  const { filter } = req.query;
  // Report.find({})
  // Filtrando los reportes
  res.render("pet/pet-reports");
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

module.exports = router;
