const Rating=require('../models/Ratings');
const User=require('../models/User');
const Course=require('../models/Course');
const mongoose=require('mongoose');
exports.createRating= async (req,res) => {
    try {
        //Fetching the required details from the body of the request
        const {courseId,rating,body}=req.body;
        const {userId}= req.user.id;

        //Converting the user id from String to objectid
        const uid=mongoose.Types.ObjectId(userId);
        //Verifying if all required details are given or not
        if(!rating||!body||!courseId){
            return res.status(400).json({
                success:false,
                message:"All fields are required",
            })
        }

        //Fetching the user details
        const userDetails=await User.find({userId});
        //Validation 2:Verifying the user id
        if(!userDetails){
            return res.status(400).json({
                success:false,
                message:"Invalid User id",
            })
        }

        //Fetching the course details
        const courseDetails=await Course.find({courseId});
        //Validation 3:Verifying the given course id
        if(!courseDetails){
            return res.status(400).json({
                success:false,
                message:"Invalid Course id",
            })
        }

        //Validation 4:Verifying if the user is enrolled in the course or not
        const enrollmentCheck=courseDetails.enrolledStudent.includes(uid);
        if(!enrollmentCheck){
            return res.status(401).json({
                success:false,
                message:"User is not enrolled in the given course"
            })
        }
        //Validation 5:If the user has already rated this course or not
        const checkReview=await Rating.find({user:userId,
        course:courseId});
        if(checkReview){
            return res.status(400).json({
                success:false,
                message:"You have already rated this course",
            })
        }
        //Creating the new entry of the rating in the database
        const newRating= await Rating.create({userId,courseId,rating,body});
        //Updating the rating in the course model also
        const updatedCourse= await User.findByIdAndUpdate(courseId,{$push:{rating:newRating._id}},{new:true}).populate("rating").exec();

        //Sending the successful response
        res.status(200).json({
            success:true,
            message:"Rating submitted successfully",
            data:newRating,
        })

    } catch (error) {

        //Handling the caatch block
        console.log(error);
        res.status(500).json({
            success:false,
            message:"Internal server error! please try again later",
            data:error.message,
        })
    }
}


//This handler is responsible for fetching the ratings
exports.fetchRatings=async(req,res)=>{
    try {
        //Fetching the course id from the body of the request
        const {courseId}=req.body;
        //Fetching the ratings
        const response=await Rating.find({course:courseId}).sort({rating:"desc"}).populate({
            path:"User",
            select:"Firstname Lastname email image"
        }).populate({
            path:"Course",
            select:"title"
        }).exec();
        //Sending the successful response
        return res.status(200).json({
            success:true,
            message:"Ratings fetched successfully",
            data:response,
        })
    } catch (error) {
        //Handling the catch block
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"Internal server error",
            data:error.message,
        })
    }
}

//This handler is responsible for fetching the average rating
exports.getAverageRating=async(req,res)=>{
    try {
        //Fetching the course id from the body of the request
        const {courseId}=req.body;
        //Calculating the average rating
        const result= await Rating.aggregate([
            {
                $match:{
                    course:new mongoose.Types.ObjectId(courseId),
                }, 
            },
            {
                $group:{
                    _id:null,
                    averageRating:{$avg:"$rating"}
                }
            }
        ])

        //In case if any rating is not given to a particular course
        if(result.length>0){
            return res.status(200).json({
                success:true,
                averageRating:result[0].averageRating,
                message:"Average rating fetched successfully"
            })
        }

        //Sending the successful response
        return res.status(200).json({
            success:true,
            message:"no ratings are given till now to this course"
        })
    } catch (error) {
        //Handling the catch block
        console.log(error);
        res.status(500).json({
            success:false,
            message:"Error in fetching the average rating",
            data:error.message,
        })
    }
}