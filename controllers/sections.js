const Sections=require('../models/Sections');
const Course=require('../models/Course')
exports.createSections=async(req,res)=>{
    try {
        //Fetching the required details from the body of the request
        const {title,CourseId}=req.body;
        //Validation 1:Checking whether all the details are entered by the user or not
        if(!title||!CourseId){
            return res.status(400).json({
                success:false,
                message:"All fields are required",
            })
        }
        //Creating the section
        const response=await Sections.create({title});
        //Adding the section in the course model
        const updateCourse=await Course.findByIdAndUpdate(CourseId,{$push:{courseContent:response._id}},{new:true}).populate("courseContent").exec();
        //sending the successful response
        res.status(200).json({
            success:true,
            message:"Section created successfully",
            data:response,
        })
    } catch (error) {
        //Handling the catch block
        console.log(error);
        res.status(500).json({
            success:false,
            message:"Internal server error",
            data:error.message,
        })
    }
}

exports.updateSection=async(req,res)=>{
    try {
        //Fetching th required details
        const {newTitle,sectionId}=req.body;
        //Validation 1:Checking whether all the details are entered by the user or not
        
        if(!newTitle||!sectionId){
            return res.status(400).json({
                success:false,
                message:"All fields are required",
            })
        }
        //Updating the section
        const updatedSection=await Sections.findByIdAndUpdate(sectionId,{title:newTitle},{new:true});
        //sending the successful response
        res.status(200).json({
            success:true,
            message:"Section updated successfully",
            data:updatedSection,
        })
    } catch (error) {
        //Handling the catch block
        console.log(error);
        res.status(500).json({
            success:false,
            message:"Internal server error",
            data:error.message,
        })
    }
}

exports.deleteSection=async(req,res)=>{
    try {
        //Fetching the required details
        const courseId=req.body;
        const {sectionId}=req.params; 
        //Validation 1:Checking whether all the details are entered by the user or not

        console.log("delete request");
        if(!courseId||!sectionId){
            return res.status(400).json({
                success:false,
                message:"All fields are required",
            })
        }
        //Deleting the section
        const response=await Sections.findByIdAndDelete(sectionId);
        //Updating the course model
        const updateCourse=await Course.findByIdAndUpdate(courseId,{$pull:{courseContent:sectionId}},{new:true});
        //Sending the successful response
        res.status(200).json({
            success:true,
            message:"Section deleted successfully",
        })
    } catch (error) {
        //Handling the catch block
        console.log(error);
        res.status(500).json({
            success:false,
            message:"Internal server error",
            data:error.message,
        })
    }
}