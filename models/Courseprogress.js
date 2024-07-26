//importing the instance of mongoose to create model
const mongoose=require('mongoose');

const courseprogressSchema=new mongoose.Schema({
    courseID:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Course",
    },

    completedVideos:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Subsections"
    }
})

module.exports=mongoose.model("Courseprogress",courseprogressSchema)