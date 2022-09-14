const { Schema, model } = require("mongoose");

// TODO: Please make sure you edit the user model to whatever makes sense in this case
const reportSchema = new Schema(
  {
    situation:{
        type:String,
        trim: true,
        required: [true,'Give details about the situation'],
        minlength:1,
        
    },
    date: {
        type: Date,
        required: [true,'Give a valid date'],
    },
    petName: {
        type: String,
        required: [true,'Give a valid Name'],
        lowercase: true,
        trim: true,
        minlength: 1,
    },
    foundStatus: {
      type:String,
      required: true,
      enum:['1', '2', '3'],
    },
    petPicture: {
      type: String,
    },
    userId: { 
      type: Schema.Types.ObjectId,
      ref: 'User'
    }
},
  {
    // this second object adds extra properties: `createdAt` and `updatedAt`
    timestamps: true,
  }
);

const Report = model("Report", reportSchema);

module.exports = Report;