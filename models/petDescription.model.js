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
        
    },
    {
        timestamps: true,
    }
  );
  
  const PetDescription = model("PetDescription", PetDescriptionModel);
  
  module.exports = PetDescription;
  
