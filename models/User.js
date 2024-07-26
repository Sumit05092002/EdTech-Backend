//importing the instance of mongoose to create models
const mongoose=require('mongoose');

//Defining the userSchema
const userSchema=new mongoose.Schema({
    Firstname:{
        type:String,
        required:true,
        trim:true,
    },

    lastname:{
        type:String,
        required:true,
        trim:true,
    },

    email:{
        type:String,
        required:true,
        trim:true,
    },

    password:{
        type:String,
        required:true,
    },

    accountType:{
        type:String,
        enum:["Student","Instructor","Admin"],
        required:true,
    },

    additionalDetails:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:"Profile"
    },

    course:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"Course",
        }
    ],

    image:{
        type:String,
        required:true
    },

    token:{
        type:String,
    },

    expiresIn:{
        type:Date,
    },

    courseprogress:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"CourseProgress"
        }
    ],


})


module.exports=mongoose.model("User",userSchema);