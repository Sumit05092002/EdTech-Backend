//importing the mongoose instance to create model
const mongoose=require('mongoose');

//Defining the courseSchema
const courseSchema=new mongoose.Schema({
    title:{
        type:String,
        required:true,
    },

    description:{
        type:String,
        required:true,
    },

    learning:{
        type:String,
        required:true,
    },

    instructor:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
    },

    courseContent:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Sections",
    }],

    rating:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Ratings",
    }],

    price:{
        type:Number,
        required:true,
    },

    thumbnail:{
        type:String,
        required:true,
    },

    category:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Category",
    },

    studentEnrolled:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    }]
})

module.exports=mongoose.model("Course",courseSchema)