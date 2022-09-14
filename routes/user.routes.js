const router = require("express").Router();

const mongoose = require("mongoose");

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
  const {petName, situation, foundStatus, date, petPicture} = req.body;
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
    petPicture,
    userId: userId
  })
    .then((newReport) => {
      // const newReportId = newReport._id;
      return User.findByIdAndUpdate(userId,{$push:{reports:newReport._id}},{new:true})
    })
    .then((newUser) => {
      req.session.user = newUser;
      console.log(newUser);
      res.redirect('/pet/pet-reports')
    })
    .catch((err) => console.log(err));
})

/* GET Edit Report */
router.get("/edit-report/:reportId", (req, res) => {
  // const {petName, situation, foundStatus, date } = req.body;
  const reportsMade = req.session.user.reports;
  const reportId = req.params.reportId;
  // Report.findById(reportId)
  const report = reportsMade.find((id) => (id == reportId))
  if (report) {
    console.log('Se encontro report', report)
    Report.findById(reportId)
      .then((report) => {
        res.render('user/edit-report', report)
      })
  } else {
    res.send('<h1>No puedes editar este report, no es tuyo</h1>')
  }
  // res.send('<h1>Este no es tu reporte</h1>')
})
 
// edit user
router.get("/edit-userProfile", async (req, res) => {
  const edit = await User.findById(req.session.user._id)
  console.log(edit)
  res.render("user/edit-userProfile", edit)
}) 

router.post("/edit-userProfile", (req, res) => {
  const {username,} = req.body
  const userId = req.session.user._id
  User.findByIdAndUpdate(userId, {username}, {new: true})
  .then((userUpdate) => {
    req.session.user = userUpdate
    res.redirect("/user/user-profile")
  })
 
})


module.exports = router;
