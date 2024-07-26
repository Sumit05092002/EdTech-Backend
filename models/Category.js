//importing the mongoose instance to create model
const mongoose=require('mongoose');

//Defining the categorySchema
const categorySchema=new mongoose.Schema({
   name:{
    type:String,
    required:true,
   },

   description:{
    type:String,
    required:true,
   },

   course:[{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Course",
   }]
})

module.exports=mongoose.model("Category",categorySchema)