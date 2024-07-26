const Subsection=require('../models/Subsections');
const Section=require('../models/Sections');
const {resourceUploader}=require('../utils/imageUploader')
require('dotenv').config();
exports.createSubsection=async(req,res)=>{
    try {
        //Fetching the required details
        const {title,timeDuration,description,sectionId}=req.body;
        const video=req.files.video;
        //Validation 1:Checking whether all the deattails are entered by the user or not

        console.log(title);
        console.log(description);
        console.log(timeDuration);
        console.log(sectionId);
        console.log(video);

        if(!title||!timeDuration||!description||!sectionId||!video){
                return res.status(400).json({
                    success:false,
                    message:"All fields are required",
                })
        }

        //Uploading the video on cloudinary
        const uploadVideo=await resourceUploader(video,process.env.FOLDER_NAME);
        //creating the entry in the database
        const response=await Subsection.create({title,timeDuration,description,videoUrl:uploadVideo.secure_url})
        //Updating the section
        const updatedSection=await Section.findByIdAndUpdate(sectionId,{$push:{subsections:response._id}},{new:true}).populate("subsections").exec();
        //Sending the successful response
        res.status(200).json({
            success:true,
            message:"subsection created successfully",
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




exports.updateSubsection=async(req,res)=>{

    //This method is fine but it consumes the cloud space too much for example if you want to only update the title of the video then also you have to provide the entire details including the video and the entire subsection is updated including the reuploading of the same video which consumes the cloud space too much whereas in the another method the only thing that the user wants to update he or she will provide that only and only that thing will be updated for exaple if you want to only update the title of the video then in the method 2 you only need to provide the title rest every thing will remain the same which will prevent the reuploading the video saving the cloud space

    //Method 1:


    // try {
    //     //Fetching the required details
    //     const {title,timeDuration,description,subsectionId}=req.body;
    //     const video=req.files.video;
    //     //Uploading the video
    //     const uploadVideo=await resourceUploader(video,"StudyNotion");
    //     //Updating the subsection entry in db
    //     const response= await Subsection.findByIdAndUpdate(subsectionId,{title,timeDuration,description,videoUrl:uploadVideo.secure_url})
    //     //Sending the successful response
    //     res.status(200).json({
    //         success:true,
    //         message:"Subsection updated successfully",
    //         data:response,
    //     })
    // } catch (error) {
    //     //Handling the catch block
    //     console.log(error);
    //     res.status(500).json({
    //         success:false,
    //         message:"Unable to update Subsection",
    //         data:error.message,
    //     })
    // }


    //Method 2:
    
    //This method of updation saves the cloud space
    try {
        const { subsectionId, title, description } = req.body
        const subSection = await Subsection.findById(subsectionId);
    
        if (!subSection) {
          return res.status(404).json({
            success: false,
            message: "SubSection not found",
          })
        }
    
        if (title !== undefined) {
          subSection.title = title
        }
    
        if (description !== undefined) {
          subSection.description = description
        }
        if (req.files && req.files.video !== undefined) {
          const video = req.files.video
          const uploadDetails = await resourceUploader(
            video,
            process.env.FOLDER_NAME
          )
          subSection.videoUrl = uploadDetails.secure_url
          subSection.timeDuration = `${uploadDetails.duration}`
        }
    
        await subSection.save()
    
        return res.json({
          success: true,
          message: "Subsection updated successfully",
        })
      } catch (error) {
        console.error(error)
        return res.status(500).json({
          success: false,
          message: "An error occurred while updating the subsection",
        })
      }
}



exports.deleteSubsection=async(req,res)=>{
    try {
        //Fetching the sectionId and subsectionId
        const {sectionId}=req.body;
        const {subsectionId}=req.params;
        //Validation 1:Checking whether all the datails are entered by the user or not
        
        if(!sectionId||!subsectionId){
            return res.status(400).json({
                success:false,
                message:"Please fill all the details"
            })
        }

        //Fetching and verifying the subsection details and Id
        const subsection=await Subsection.find({subsectionId});
        if(!subsection){
            return res.status(400).json({
                success:false,
                message:"Subsection does not exist",
            })
        }

        //Fetching and verifying the section details and section Id
        const section=await Section.find({sectionId});
        if(!section){
            return res.status(400).json({
                success:false,
                message:"Section does not exist",
            })
        }

        //Deleting the subsection
        const response=await Subsection.findByIdAndDelete(subsectionId);
        //Updating the section model
        const updatedSection=await Section.findByIdAndUpdate(sectionId,{$pull:{subsections:subsectionId}},{new:true}).populate("subsections").exec();
        //Sending the successful response
        res.status(200).json({
            success:true,
            message:"Subsection deleted successfully",
        })
    } catch (error) {
        //Handling the errors in catch block
        console.log(error);
        res.status(500).json({
            succes:false,
            message:"Unable to delete subsection",
            data:error.message,
        })
    }
}