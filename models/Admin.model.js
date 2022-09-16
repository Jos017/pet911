const { Schema, model } = require("mongoose");

const adminSchema = new Schema(
  {
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
      minlength: 1,
      maxlength: 30
    },
    password: {
      type: String,
      required: true,
    },
    userPrivileges: {
      type: String,
      required: [true, 'Define user privileges is required'],
      enum: ['user', 'admin']
    }
  },
  {
    // this second object adds extra properties: `createdAt` and `updatedAt`
    timestamps: true,
  }
);

const Admin = model("Admin", adminSchema);

module.exports = Admin;
