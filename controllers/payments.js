const { default: mongoose } = require('mongoose');
const {instance}=require('../config/razorpay');
const Course=require('../models/Course');
const User=require('../models/User');
const mail=require('../utils/nodemailer')
const courseEnrollmentEmail=require('../mail/templates/courseEnrollmentEmail')
exports.paymentCapture= async(req,res)=>{
    try {

        //Fetching the courseId and userId
        const {courseId}=req.body;
        const userId=req.user.id;

        console.log(courseId);
        console.log(userId);
        //Validation 1: Checking whether the courseid or userid is empty or not
        if(!courseId||!userId){
            return res.status(400).json({
                success:false,
                message:"All field are required",
            })

        }

        //Fetching the course and user details and verifying whether the userid and courseid is correct or not
        const courseDetails=await Course.findById(courseId);
        const userDetails=await User.findById(userId);
        if(!courseDetails||!userDetails){
            return res.status(400).json({
                success:false,
                message:"Invalid CourseId or UserId",
            })
        }

        //converting the userid from string to objectid
        const uid= new mongoose.Types.ObjectId(userId)

        //validating whether the user is already enrolled in the requested course or not
        const enrollmentCheck= await courseDetails.studentEnrolled.includes(uid);
        if(enrollmentCheck){
            return res.status(400).json({
                success:false,
                message:"you are already enrolled in this course",
            })
        }

        try {
            
            //creating order for further processing
            const amount=courseDetails.price;
            const currency="INR";
            const options={
                amount:amount*100,
                currency,
                notes:{
                    courseID:courseId,
                    userId,
                }
            }
            const paymentResponse=await instance.orders.create(options);


            res.status(200).json({
                success:true,
                message:"Order created successfully",
                coursename:courseDetails.title,
                courseDescription:courseDetails.description,
                thumbnail:courseDetails.thumbnail,
                order_id:paymentResponse.id,
                currency:paymentResponse.currency,
                amount:paymentResponse.amount,
            })
        
            
        } catch (error) {

            console.log(error);
            //Handling the catch block in case of any error while order creation
            return res.status(500).json({
                success:false,
                message:"Could not initiate your order",
            })
        }

    } catch (error) {


        //Handling the catch block
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"OOPs the server is down! Please try again after some time",
            data:error.message,
        })


    }
}


exports.verifySignature=async(req,res)=>{
    try {

        //Webhook of my backend
        const webhook="12345678";

        //Fetching the signature from razorpay
        const signature=req.headers["x-razorpay-signature"];

        //Encrypting the webhook of my backend
        const shasum=crypto.createHmac("sha256",webhook);
        shasum.update(JSON.stringify(req.body));
        const digest=shasum.digest("hex");


        //Matching the webhook in my backend with the webhook returned by razorpay account
        if(signature===digest){
            console.log("Payment is authorized");
            //Enrolling the user in the purchased course
            const {userId,courseId}=req.body;
            const userDetails=await User.find({userId});
            const updatedUser= await User.findByIdAndUpdate(userId,{$push:{course:courseId}},{new:true}).populate("course").exec();
            const updatedCourse=await Course.findByIdAndUpdate(courseId,{$push:{studentEnrolled:userId}},{new:true}).populate("studentEnrolled").exec();
            //Mailing the Student about the successfull enrollment of the course
            const courseDetails=await Course.find({courseId})
           const mailResponse=mail(userDetails.email,"Welcome Email",courseEnrollmentEmail(courseDetails.title,userDetails.firstname));
        }else{
            //Handling the case if the payment signature does not match
            return res.status(401).json({
                success:false,
                message:"Payment signature did not match",
                data:error.message,
            })
        }
    } catch (error) {
        //Handling the error block
        console.log(error);
        res.status(500).json({
            success:false,
            message:"Internal Server error",
            data:error.message,
        })
    }
}