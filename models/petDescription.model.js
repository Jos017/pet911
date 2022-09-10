const { Schema, model } = require("mongoose");

const PetDescriptionModel = new Schema(
    {
        age:{
            type:Number,
            required: [true, 'pet age is required.'],
            trim:true,
            min:1,
            max:25,
        },
        size:{
            type:String,
            required: true,
            enum:["Small","Medium","Large"], 
        },
        gender:{
            type:String,
            required: true,
            enum:["Female","Male"],    
        },
        Situation:{
            type:String,
            trim: true,
            required: [true,'Give details about the situation'],
            minlength:1,
            maxlength:100
        },
    },
    {
        timestamps: true,
    }
  );
  
  const PetDescription = model("PetDescription", PetDescriptionModel);
  
  module.exports = PetDescription;
  
