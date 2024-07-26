const Course=require('../models/Course');
const Category=require('../models/Category');
const User=require('../models/User')
const {resourceUploader}=require('../utils/imageUploader');

//This handler is responsible creating courses
exports.createCourse=async(req,res)=>{
    try {

        //Fetching data from the body of request
        const {title,description,learning,price,category:categoryId,}=req.body;
        const thumbnail=req.files.thumbnail;


        //Fetching the instructorId from the body of the request.It was added in the body of the request by the middleware from jwt
        const instructorId=req.user.id;
        console.log(title);
        console.log(description);
        console.log(learning);
        console.log(price);
        console.log(categoryId);
        console.log(thumbnail);
        //validation1
        if(!title||!description||!learning||!price||!categoryId){
            return res.status(400).json({
                success:false,
                message:"All fields are required",
            })
        }


        //Validation2
        const instructorDetails=await User.find({instructorId});
        if(!instructorDetails){
            return res.status(401).json({
                success:false,
                message:"Only Instructor have access to create a course",
            })
        }


        //Validation 3:Verifying the whether the given categoryid is correct or not
        const categoryDetails=await Category.find({categoryId});

        if(!categoryDetails){
            res.status(400).json({
                success:false,
                message:"No such category exists"
            })
        }


        //Uploading thumbnail
        const imageUpload=await resourceUploader(thumbnail,"StudyNotion");
        console.log(imageUpload);

        //creating the entry of the course in the database
        const response=await Course.create({title,description,learning,price,category:categoryId,instructor:instructorId,thumbnail:imageUpload.secure_url})

        //Adding the course in the course section of the user
        const updatedUser=await User.findByIdAndUpdate(instructorId,{$push:{course:response._id}},{new:true},).populate("course").exec();

        //Adding the course in the course section of the category
        const updatedCategory=await Category.findByIdAndUpdate(categoryId,{$push:{course:response._id}},{new:true}).populate("course").exec();

        //sending the successfull response
        res.status(200).json({
            success:true,
            message:"Course created Successfully",
            data:response,
        })
    } catch (error) {

        //handling the catch block
        console.log(error);
        res.status(500).json({
            success:false,
            message:"Internal server error",
            data:error.message,
        })
    }
}




//This handler is responsible for fetching all the courses


exports.getAllCourses=async(req,res)=>{
    try {


        //Fetching all the courses
        const response=await Course.find({});



        //Sending the successfull response
        res.status(200).json({
            success:true,
            message:"Courses fetched successfully",
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





//This handler is responsible for fetching the entire course details

exports.getCourseDetails=async(req,res)=>{
    try {
        //Fetching the courseid from the body of the request
        const {courseId}=req.body;



        //validation 1:whether courseid is empty or not
        if(!courseId){
            return res.status(400).json({
                success:false,
                message:"All fields are required",
            })
        }



        //Fetching the courseDetails
        const courseDetails=await Course.find({_id:courseId}).populate(
            {
            path:"instructor",
            populate:{
                path:"additionalDetails"
            }
        }
        ).populate({
            path:"courseContent",
            populate:{
                path:"subsections"
            }
        }).populate({
            path:"rating"
        }).populate({
            path:"category"
        }).exec();




        //Validation2:Whether courseid is correct or not
        if(!courseDetails){
            return res.status(400).json({
                success:false,
                message:"Invalid Course id",
            })
        }


        


        //sending the successful response
        res.status(200).json({
            success:true,
            message:"Course details fetched successfully",
            data:courseDetails,
        })




    } catch (error) {



        //Handling the catch block
        console.log(error);
        res.status(500).json({
            success:false,
            message:"Error in fetching course details",
            data:error.message,
        })


    }
}