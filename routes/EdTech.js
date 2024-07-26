//importing the instance of express and also importing the express router
const express = require('express');
const router = express.Router();

//importing the controllers and middlewares
const {signUp,login,changePassword,sendOtp} = require('../controllers/auth');
const {createCourse,getAllCourses,getCourseDetails}=require('../controllers/course');
const {updateProfile,deleteAccount, updateDisplayPicture, getEnrolledCourses} = require('../controllers/profile');
const {createRating,fetchRatings,getAverageRating} = require('../controllers/ratings');
const {resetPasswordToken, resetPassword} = require('../controllers/resetPassword')
const {createSections,updateSection,deleteSection} = require('../controllers/sections')
const {createSubsection,updateSubsection,deleteSubsection} = require('../controllers/subsections')
const {createcategory,getcategory,getCategoryPageDetails} = require('../controllers/category')
const {paymentCapture} =require('../controllers/payments')
const {checkAuth,isStudent,isInstructor,isAdmin} = require('../middlewares/checkAuth')


//creating the different protected routes
router.post("/signUp",signUp);//checked
router.post("/login",login);//checked
router.put("/changePassword",checkAuth,changePassword);//checked
router.post("/createCourse",checkAuth,isInstructor,createCourse);//checked
router.get("/getAllCourses",getAllCourses);//checked
router.post("/getCourseDetails",getCourseDetails);//checked
router.put("/updateProfile",checkAuth,updateProfile);//checked
router.delete("/deleteAccount",checkAuth,deleteAccount);//problem 2
router.post("/createRating",checkAuth,isStudent,createRating); 
router.get("/fetchRatings",fetchRatings);
router.get("/getAverageRating",getAverageRating);
router.post("/resetPasswordToken",resetPasswordToken);//checked 3
router.put("/resetPassword",resetPassword);//problem 4
router.post("/createSection",checkAuth,isInstructor,createSections);//checked
router.put("/updateSection",checkAuth,isInstructor,updateSection);//checked
router.post("/deleteSection",checkAuth,isInstructor,deleteSection);//problem 5
router.post("/createSubsection",checkAuth,isInstructor,createSubsection);//checked
router.put("/updateSubsection",checkAuth,isInstructor,updateSubsection);//checked
router.post("/deleteSubsection",checkAuth,isInstructor,deleteSubsection);//problem 6
router.post("/createcategory",checkAuth,isAdmin,createcategory);//checked
router.get("/getcategory",getcategory);//checked
router.post("/getCategoryPageDetails",getCategoryPageDetails);//checked
router.post("/paymentCapture",checkAuth,isStudent,paymentCapture);///checked
router.post("/sendOTP",sendOtp);//checked
router.post("/updateDisplayPicture",checkAuth,updateDisplayPicture);//checked
router.get("/getEnrolledCourses",getEnrolledCourses);
router.get("/test",(req,res)=>{
    console.log("hello");
    res.send("Welcome to test route")
})
//exporting the router
module.exports=router;