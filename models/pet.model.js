const { Schema, model } = require("mongoose");

const petSchema = new Schema(
    {

    petName:{
        type:String,
        trim: true,
        required: [true, 'Pet name is required'],
        minlength:1,
        maxlength:30
    },
    status: {
        type:String,
        required: true,
        enum:["With his owner","Lost","Finden but no with this owner"],
    },
    picture:{
        type:String,
        required: true,
    },
    description: {
        type: [String],
    },
    owner:{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
    },
    {
        timestamps: true,
    }
  );
  
  const Pet = model("Pet", petSchema);
  
  module.exports = Pet;
  