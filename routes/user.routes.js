const router = require("express").Router();
const bcrypt = require("bcrypt")
const mongoose = require("mongoose");


const saltRounds = 10
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
    .then(userInfo =>{
      console.log("Informacion de usuario", userInfo)
      res.render("user/user-profile", { userInfo, userInSession: req.session.user });
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
    .then((userInfo) =>{
      res.render("user/user-profile", { userInfo, userInSession: req.session.user })
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
      res.render("user/my-pets", { userWithPets, userInSession: req.session.user });
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
      res.render("user/new-report", { userWithPets, userInSession: req.session.user });
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
        res.render('user/edit-report', { report, userInSession: req.session.user })
      })
  } else {
    res.send('<h1>Este no es tu reporte</h1>')
  }
})

/* POST Edit Report Status */
router.post("/edit-report/:reportId", (req, res) => {
  const { foundStatus, situation } = req.body;
  const { reportId } = req.params
  console.log(req.body);
  Report.findByIdAndUpdate(reportId, {
    foundStatus, situation 
  }, {new: true})
    .then((reportUpdated) => {
      res.redirect(`/pet/pet-reports`);
    }).
    catch((err) => console.log(err))
}) 


// edit user
router.get("/edit-userProfile", async (req, res) => {
  const currentUser = await User.findById(req.session.user._id)
  console.log(currentUser)
  res.render("user/edit-userProfile", {currentUser, userInSession: req.session.user})
}) 

router.post("/edit-userProfile", (req, res) => {
  const {username, firstName, lastName, email, password, phone, address} = req.body
  const userId = req.session.user._id
  const currentUser = req.session.user
  if (!username) {
    console.log("1")
    return res.status(400).render("user/edit-userProfile", {
      errorMessage: "Please provide a username.", currentUser
    });
  } 

  if(!email){
    console.log("3")
    return res.status(400).render("user/edit-userProfile", {
      errorMessage: "Please provide a email.", currentUser
    });
  } 

  const regex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}/;

  if (!regex.test(password)) {
    return res.status(400).render("user/edit-userProfile", {
      errorMessage:
        "Password needs to have at least 8 chars and must contain at least one number, one lowercase and one uppercase letter.", currentUser
    });
  }

  if(!phone){
    return res.status(400).render("user/edit-userProfile", {
      errorMessage: "Please provide a phone number.", currentUser
    });
  }

  if(!address){
    return res.status(400).render("user/edit-userProfile", {
      errorMessage: "Please provide an address.", currentUser
    });
  }
  // User.findByIdAndUpdate(userId, {username, firstName, lastName, email, password, phone, address}, {new: true})
  // .then((userUpdate) => {
  //   req.session.user = userUpdate
  //   res.redirect("/user/user-profile")
  // })
  User.findOne({username}).then((founded)=>{
    if (founded) {
      return res
        .status(400)
        .render("user/edit-userProfile", { errorMessage: "Usernae is already registered.", currentUser });
    }
    // if user is not found, create a new user - start with hashing the password
    console.log("Hola")
    return bcrypt
      .genSalt(saltRounds)
      .then((salt) => bcrypt.hash(password, salt))
      .then((hashedPassword) => {
        console.log(hashedPassword)
        // Create a user and save it in the database
        return User.findByIdAndUpdate(userId, {
          username, 
          firstName,
          lastName, 
          email, 
          phone, 
          address,
          password: hashedPassword,  
        }, {new: true});
      })
      .then((userUpdate) => {
        // console.log(userUpdate)
        // Bind the user to the session object
        req.session.user = userUpdate;
        
        res.redirect("/user/user-profile");
      
      })
      .catch((error) => {
        console.log(error)
        if (error instanceof mongoose.Error.ValidationError) {
          return res
            .status(400)
            .render("user/edit-userProfile",  { errorMessage: error.message, currentUser });
        }
        if (error.code === 11000) {
          return res
            .status(400)
            .render("user/edit-userProfile", { errorMessage: "Username need to be unique. The username you chose is already in use.", currentUser });
        }
        return res
          .status(500)
          .render("user/edit-userProfile", { errorMessage: error.message, currentUser });
      });
    }) 
})


module.exports = router;
