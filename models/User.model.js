const { Schema, model } = require("mongoose");

const userSchema = new Schema(
  {
    username: {
      type: String,
      trim: true,
      required: [true, 'Username is required.'],
      unique: true
    },
    firstName: {
      type: String,
      trim: true,
    },
    lastName: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required.'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address.'],
    },
    password: {
      type: String,
      required: [true, 'Password is required.'],
    },
    phone:{
      type: String,
      required: [true, 'phone missing']
    },

    profilePic:{
      type: String,
      default: "/images/userProfile.jpg"
    },


    address:{
      type: String,
      required: [true, 'address missing']
    },
    userPrivileges: {
      type: String,
      required: [true, 'Define user privileges is required'],
      enum: ['user', 'admin']
    },
    pets: [{
      type: Schema.Types.ObjectId,
      ref: 'Pet'
    }],
    reports: [{
      type: Schema.Types.ObjectId,
      ref: 'Report'
    }]
  },
  {
    // this second object adds extra properties: `createdAt` and `updatedAt`
    timestamps: true,
  }
);

const User = model("User", userSchema);

module.exports = User;
