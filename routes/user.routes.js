const router = require("express").Router();
const bcrypt = require("bcrypt")
const mongoose = require("mongoose");


const saltRounds = 10
// Models Required
const Report = require("../models/report.model");
const User = require("../models/User.model");
const Admin = require("../models/Admin.model");
const Pet = require("../models/pet.model");


/* GET User Profile */
router.get("/user-profile", (req, res, next) => {
  const userId = req.session.user._id
  const userPrivileges = req.session.user.userPrivileges
  if (userPrivileges === 'admin') {
    Admin.findById(userId)
    .then(userInfo =>{
      res.render("user/user-profile", { userInfo, userInSession: req.session.user});
    })
    .catch(error=>{
      console.log(error)
    })
  }
  if (userPrivileges === 'user') {
    User.findById(userId)
    .then(info =>{
    return info.populate("pets")
  })
    .then((userInfo) =>{
      res.render("user/user-profile", { userInfo, userInSession: req.session.user})
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
      res.render("user/my-pets", { userWithPets, userInSession: req.session.user });
    })
    .catch((err) => console.log(err));
});

/* POST Delete My Pets */
router.post("/delete-pet/:petId", (req, res) => {
  const userId = req.session.user._id;
  const { petId } = req.params;
  Report.findByIdAndDelete(petId)
    .then(() => User.findByIdAndUpdate(userId, {$pull: {pets: petId}}))
    .then(() => {
      res.redirect('/user/my-pets');
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
  const {petName, situation, foundStatus, date, petPicture,lat,lng} = req.body;
  
  const userId = req.session.user._id;
  User.findById(userId)
    .then((userFound) => {
      return userFound.populate('pets');
    })
    .then((userWithPets) => {
      console.log(userWithPets);
      if (!petName) {
        return res.status(400).render('user/new-report', {
          userWithPets,
          errorMessage: 'Please provide a Pet name.',
          userInSession: req.session.user
        });
      }
    
      if (!date) {
        return res.status(400).render('user/new-report', {
          userWithPets,
          errorMessage: 'Give a valid date',
          userInSession: req.session.user
        });
      }
    
      if (!situation) {
        return res.status(400).render('user/new-report', {
          userWithPets,
          errorMessage: 'We need some information about your report, please provide some details',
          userInSession: req.session.user
        });
      }

      return Report.create({
        petName,
        situation,
        date,
        foundStatus,
        petPicture,
        userId: userId,
        lat,
        lng
      })
        .then((newReport) => {
          // const newReportId = newReport._id;
          return User.findByIdAndUpdate(userId,{$push:{reports:newReport._id}},{new:true})
        })
        .then((newUser) => {
          req.session.user = newUser;
          res.redirect('/pet/pet-reports')
        })
        .catch((err) => console.log(err));
    })
})

/* GET Edit Report */
router.get("/edit-report/:reportId", (req, res) => {
  const reportsMade = req.session.user.reports;
  const reportId = req.params.reportId;
  const report = reportsMade.find((id) => (id == reportId))
  if (report) {
    Report.findById(reportId)
      .then((report) => {
        res.render('user/edit-report', { report, userInSession: req.session.user })
      })
  } else {
    res.redirect('/pet/not-your-report');
  }
})

/* POST Edit Report Status */
router.post("/edit-report/:reportId", (req, res) => {
  const { foundStatus, situation } = req.body;
  const { reportId } = req.params
  const reportsMade = req.session.user.reports;
  
  if(foundStatus == 0){
    return Report.findById(reportId)
      .then((report) => {
        res.status(400).render(`user/edit-report`, {
          report,
          errorMessage: "Select your pet status",
          userInSession: req.session.user
        });
      })
  } 
  
  Report.findByIdAndUpdate(reportId, {
    foundStatus, situation 
  }, {new: true})
    .then((reportUpdated) => {
      res.redirect('/pet/pet-reports');
    }).
    catch((err) => console.log(err))
})

/* POST Delete Report Status */
router.post("/delete-report/:reportId", (req, res) => {
  const reportsMade = req.session.user.reports;
  const userId = req.session.user._id;
  const { reportId } = req.params;

  const report = reportsMade.find((id) => (id == reportId))
  if (report) {
    Report.findByIdAndDelete(reportId)
    .then(() => User.findByIdAndUpdate(userId, {$pull: {reports: reportId}}))
    .then(() => {
      res.redirect('/pet/pet-reports');
    })
    .catch((err) => console.log(err));
  } else {
    res.redirect('/pet/not-your-report');
  }
});

/* GET Edit User Profile */
router.get("/edit-userProfile", (req, res) => {
  const userId = req.session.user._id
  User.findById(userId)
    .then(info =>{
      return info.populate("pets")
    })
    .then((currentUser) =>{
      res.render("user/edit-userProfile", { currentUser, userInSession: req.session.user })
    })
    .catch(error=>{
      console.log(error)
    })
}) 

router.post("/edit-userProfile", (req, res) => {
  const {username, firstName, lastName, email, password, phone, address} = req.body
  const userId = req.session.user._id
  const currentUser = req.session.user
  if (!username) {
    return res.status(400).render("user/edit-userProfile", {
      errorMessage: "Please provide a username.",
      currentUser,
      userInSession: req.session.user
    });
  } 

  if(!email){
    return res.status(400).render("user/edit-userProfile", {
      errorMessage: "Please provide a email.",
      currentUser,
      userInSession: req.session.user
    });
  } 

  const regex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}/;

  if (!regex.test(password)) {
    return res.status(400).render("user/edit-userProfile", {
      errorMessage: "Password needs to have at least 8 chars and must contain at least one number, one lowercase and one uppercase letter.",
      currentUser,
      userInSession: req.session.user
    });
  }

  if(!phone){
    return res.status(400).render("user/edit-userProfile", {
      errorMessage: "Please provide a phone number.",
      currentUser,
      userInSession: req.session.user
    });
  }

  if(!address){
    return res.status(400).render("user/edit-userProfile", {
      errorMessage: "Please provide an address.",
      currentUser,
      userInSession: req.session.user
    });
  }
  
  User.findOne({username}).then((founded)=>{
    if (founded) {
      const foundedId = founded._id.toString();
      if(foundedId !== userId) {
        return res
          .status(400)
          .render("user/edit-userProfile", {
            errorMessage: "Username is already registered.",
            currentUser,
            userInSession: req.session.user
          });
      }
    }
    // if user is not found, create a new user - start with hashing the password
    return bcrypt
      .genSalt(saltRounds)
      .then((salt) => bcrypt.hash(password, salt))
      .then((hashedPassword) => {
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
        // Bind the user to the session object
        req.session.user = userUpdate;
        
        res.redirect("/user/user-profile");
      
      })
      .catch((error) => {
        console.log(error)
        if (error instanceof mongoose.Error.ValidationError) {
          return res
            .status(400)
            .render("user/edit-userProfile", {
              errorMessage: error.message,
              currentUser,
              userInSession: req.session.user
            });
        }
        if (error.code === 11000) {
          return res
            .status(400)
            .render("user/edit-userProfile", {
              errorMessage: "Username need to be unique. The username you chose is already in use.",
              currentUser,
              userInSession: req.session.user
            });
        }
        return res
          .status(500)
          .render("user/edit-userProfile", {
            errorMessage: error.message,
            currentUser,
            userInSession: req.session.user
          });
      });
    }) 
})


module.exports = router;
