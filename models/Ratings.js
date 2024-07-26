//Importing the instance of mongoose to create a model
const mongoose=require('mongoose');

const ratingSchema=new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },

    course:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Course"
    },

    rating:{
        type:Number,
        required:true,
    },

    body:{
        type:String,
        maxLength:200,
        required:true,
    }
})

module.exports=mongoose.model("Ratings",ratingSchema)