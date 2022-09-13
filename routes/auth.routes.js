const router = require("express").Router();

// ℹ️ Handles password encryption
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");

// How many rounds should bcrypt run the salt (default [10 - 12 rounds])
const saltRounds = 10;

// Require the User model in order to interact with the database
const User = require("../models/User.model");
const Pet = require("../models/Pet.model");
const Admin = require("../models/Admin.model");
const Report =require("../models/Report.model")

// Require necessary (isLoggedOut and isLoggedIn) middleware in order to control access to specific routes
const isLoggedOut = require("../middleware/isLoggedOut");
const isLoggedIn = require("../middleware/isLoggedIn");

// Admin Sign up
router.get("/admin-signup",isLoggedOut,(req, res) => {
  res.render("auth/admin-signup")
})

router.post("/admin-signup",isLoggedOut,(req, res) => {
  const { username, password } = req.body;
  
  if (!username) {
    console.log("1")
    return res.status(400).render("auth/signup", {
      errorMessage: "Please provide your username.",
    });
  }
  console.log("ADMINADMINKEY", process.env.ADMIN_KEY)
  if (password !== process.env.ADMIN_KEY) {
    console.log("2")
    return res.status(400).render("auth/signup", {
      errorMessage: "Your password does not match credentials",
    });
  }

  Admin.findOne({ username }).then((found) => {
    // If the user is found, send the message username is taken
    if (found) {
      return res
        .status(400)
        .render("auth/signup", { errorMessage: "Username already taken." });
    }
    console.log("EROROROROROROR",req.body)

    // if user is not found, create a new user - start with hashing the password
    return bcrypt
      .genSalt(saltRounds)
      .then((salt) => bcrypt.hash(password, salt))
      .then((hashedPassword) => {
        console.log(hashedPassword)
        // Create a user and save it in the database
        return Admin.create({
          username, 
          password: hashedPassword,
          userPrivileges: 'admin'
        });
      })
      .then((user) => {
        // Bind the user to the session object
        console.log("UserUser", user)
        req.session.user = user;
        res.redirect("/user/user-profile");
      })
      .catch((error) => {
        console.log(error)
        if (error instanceof mongoose.Error.ValidationError) {
          return res
            .status(400)
            .render("auth/signup", { errorMessage: error.message });
        }
        if (error.code === 11000) {
          return res
            .status(400)
            .render("auth/signup", { errorMessage: "Username need to be unique. The username you chose is already in use." });
        }
        return res
          .status(500)
          .render("auth/signup", { errorMessage: error.message });
      });
  });
})

router.get("/signup", isLoggedOut, (req, res) => {
  res.render("auth/signup");
});

// User
router.post("/signup", (req, res) => {
  const { username, firstName, lastName, email, password, phone, address, check } = req.body;
  
  console.log(req.body)
  // return
  
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
  

  // Search the database for a user with the username submitted in the form
  User.findOne({ username }).then((found) => {
    // If the user is found, send the message username is taken
    if (found) {
      return res
        .status(400)
        .render("auth/signup", { errorMessage: "Username already taken." });
    }
    
  User.findOne({email}).then((founded)=>{
     if (founded) {
      return res
        .status(400)
        .render("auth/signup", { errorMessage: "Email is already registered." });
    }
    // if user is not found, create a new user - start with hashing the password
    console.log("Hola")
    return bcrypt
      .genSalt(saltRounds)
      .then((salt) => bcrypt.hash(password, salt))
      .then((hashedPassword) => {
        console.log(hashedPassword)
        // Create a user and save it in the database
        return User.create({
          username, 
          firstName,
          lastName, 
          email, 
          phone, 
          address,
          check,
          password: hashedPassword,
          userPrivileges: 'user'
        });
      })
      .then((user) => {
        // Bind the user to the session object
        req.session.user = user;
        res.redirect("/user/user-profile");
      })
      .catch((error) => {
        console.log(error)
        if (error instanceof mongoose.Error.ValidationError) {
          return res
            .status(400)
            .render("auth/signup", { errorMessage: error.message });
        }
        if (error.code === 11000) {
          return res
            .status(400)
            .render("auth/signup", { errorMessage: "Username need to be unique. The username you chose is already in use." });
        }
        return res
          .status(500)
          .render("auth/signup", { errorMessage: error.message });
      });
    })    
  });
});

router.get("/login", isLoggedOut, (req, res) => {
  res.render("auth/login");
});

router.post("/login", isLoggedOut, (req, res, next) => {
  const { username, password } = req.body;

  if (!username) {
    return res
      .status(400)
      .render("auth/login", { errorMessage: "Please provide your username." });
  }

  // Here we use the same logic as above
  // - either length based parameters or we check the strength of a password
  if (password.length < 8) {
    return res
      .status(400)
      .render("auth/login", { errorMessage: "Your password needs to be at least 8 characters long." });
  }

  // Search the database for a user with the username submitted in the form
  User.findOne({ username })
    .then((user) => {
      // If the user isn't found, send the message that user provided wrong credentials
      if (!user) {
        return res
          .status(400)
          .render("auth/login", { errorMessage: "Wrong credentials." });
      }

      // If user is found based on the username, check if the in putted password matches the one saved in the database
      bcrypt.compare(password, user.password).then((isSamePassword) => {
        if (!isSamePassword) {
          return res
            .status(400)
            .render("auth/login", { errorMessage: "Wrong credentials." });
        }

        req.session.user = user;
        // req.session.user = user._id; // ! better and safer but in this case we saving the entire user object
        return res.redirect("/user/user-profile");
      });
    })

    .catch((err) => {
      // in this case we are sending the error handling to the error handling middleware that is defined in the error handling file
      // you can just as easily run the res.status that is commented out below
      next(err);
      // return res.status(500).render("auth/login", { errorMessage: err.message });
    });
});

//Destroy
router.get("/logout", isLoggedIn, (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res
        .status(500)
        .render("auth/logout", { errorMessage: err.message });
    }
    
    res.redirect("/");
  });
});



module.exports = router;
