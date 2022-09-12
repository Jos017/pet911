const router = require("express").Router();
const Pet = require("../models/Pet.model");
const User = require("../models/User.model");
const mongoose = require("mongoose")

/* GET Pet Profile */
router.get("/pet-profile", (req, res, next) => {
  res.render("pet/pet-profile");
});

/* GET Pet Reports */
router.get("/pet-reports", (req, res, next) => {
  res.render("pet/pet-reports");
});

/* GET Pet Signup */
router.get("/pet-signup", (req, res, next) => {
  res.render("pet/pet-signup");
});

router.post("/pet-signup", (req, res) => {
 const {petName, specie, picture, description} = req.body
 const userId = req.session.user._id
  Pet.create({
    petName,
    specie,
    picture,
    description,
    owner: userId
  })
  .then((newPet) => {
    console.log('newPetCreat')
    res.redirect("/pet/pet-profile")
  })
})

module.exports = router;
