//importing the mongoose instance to create a model
const mongoose=require('mongoose');

const sectionSchema=new mongoose.Schema({
   title:{
    type:String,
    required:true,
   },

   subsections:[{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Subsections"
   }]
})

module.exports=mongoose.model("Sections",sectionSchema)