const Profile=require('../models/Profile');
const User=require('../models/User');
const {resourceUploader}=require('../utils/imageUploader')
require('dotenv').config();
exports.updateProfile=async(req,res)=>{
    // try {
    //     //Fetching the required details from the body of the request
    //     const {gender,dateofbirth,about,contactnumber,}=req.body;
    //     //Fetching the user id from the payload attached in the bpdy of the request
    //     const id=req.user.id;

    //     console.log(id);
    //     console.log(gender);
    //     console.log(dateofbirth);
    //     console.log(about);
    //     console.log(contactnumber);
    //     //Validation 1:Whether all the details are filled up by the user or not
    //     if(!gender||!dateofbirth||!about||!contactnumber||!id){
    //         return res.status(400).json({
    //             success:false,
    //             message:"All fields are required",
    //         })
    //     }

    //     //Fetching the user details
    //     const userDetails=await User.find({id});
    //     //Fetching the id of the profile of the user
    //     const profileId=userDetails.additionalDetails;
    //     //Updating the profile of the user
    //     const response=await Profile.findByIdAndUpdate(profileId,{gender:gender,dateofbirth:dateofbirth,about:about,contactnumber:contactnumber},{new:true});
    //     //Sending the successful response
    //     res.status(200).json({
    //         success:true,
    //         message:"profile updated successfully",
    //         data:response,
    //     })
    // } catch (error) {
    //     //Handling the catch block
    //     console.log(error);
    //     res.status(500).json({
    //         success:false,
    //         message:"Internal server error",
    //         data:error.message,
    //     })
    // }
    try {
		const { dateofbirth = "", about = "", contactnumber,gender="" } = req.body;
		const id = req.user.id;

		// Find the profile by id
		const userDetails = await User.findById(id);
		const profile = await Profile.findById(userDetails.additionalDetails);

		// Update the profile fields
		profile.dateofbirth = dateofbirth;
		profile.about = about;
		profile.contactnumber = contactnumber;
        profile.gender=gender;

		// Save the updated profile
		await profile.save();

		return res.json({
			success: true,
			message: "Profile updated successfully",
			profile,
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			success: false,
			error: error.message,
		});
	}
}






exports.deleteAccount=async(req,res)=>{
    try {
        //Fetching the id of the user from the paylaod attached in the body of the request
        const id=req.user.id;
        //Fetching the details of the user
        const check=await User.findById({_id:id});
        //Validation 1: If the given user id is correct or not
        if(!check){
            return res.status(400).json({
                success:false,
                message:"Invalid user id",
            })
        }
        //Fetching the profile id from the user details
        const profileId= check.additionalDetails;
        //Deleting the profile of the user
        const deleteProfile=await Profile.findByIdAndDelete({_id:profileId});
        //Deleting the user
        const accountDelete=await User.findByIdAndDelete({_id:id});
        //Sending the successful response
        res.status(200).json({
            success:true,
            message:"Account deleted successfully",
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

exports.updateDisplayPicture = async (req, res) => {
    try {
      const displayPicture = req.files.displayPicture
      const userId = req.user.id
      const image = await resourceUploader(
      displayPicture,
      process.env.FOLDER_NAME,
        1000,
      )
      console.log(image)
      const updatedProfile = await User.findByIdAndUpdate(
        { _id: userId },
        { image: image.secure_url },
        { new: true }
      )
      res.send({
        success: true,
        message: `Image Updated successfully`,
        data: updatedProfile,
      })
    } catch (error) {
        console.log(error);
      return res.status(500).json({
        success: false,
        message: error.message,
      })
    }
};

exports.getEnrolledCourses = async (req, res) => {
    try {
      const userId = req.user.id
      const userDetails = await User.findOne({
        _id: userId,
      })
        .populate("courses")
        .exec()
      if (!userDetails) {
        return res.status(400).json({
          success: false,
          message: `Could not find user with id: ${userDetails}`,
        })
      }
      return res.status(200).json({
        success: true,
        data: userDetails.courses,
      })
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      })
    }
};