//Calling the instance of mongoose to create a model
const mongoose=require('mongoose');

const profileSchema=new mongoose.Schema({
    gender:{
        type:String
    },

    dateofbirth:{
        type:String,
    },

    about:{
        type:String,
    },

    contactnumber:{
        type:Number,
        trim:true
    }
})

module.exports=mongoose.model("Profile",profileSchema)