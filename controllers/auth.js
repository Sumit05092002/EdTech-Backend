const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const Otp = require('../models/Otp')
const otpgenerator = require('otp-generator')
const Profile=require('../models/Profile');
const mail=require('../utils/nodemailer')
const {passwordUpdate}=require('../mail/templates/passwordUpdate')
const mongoose=require('mongoose');







//Defining the signup handler
exports.signUp = async (req, res) => {
    try {
        //Fetching the required details from the body of the request
        const { Firstname, lastname, email, password, accountType,phoneNo,confirmPassword,otp } = req.body;
        //Validation 1:Verifying that all the fields have been filled up by the user
        if(!Firstname||!lastname||!email||!password||!phoneNo||!confirmPassword){
            return res.status(400).json({
                success:false,
                message:"All fields are required",
            })
        }

        //Validation 2:Verifying that user is already registered or not with this email
        const checkMail = await User.findOne({ email });

        if (checkMail) {
            return res.status(401).json({
                success: false,
                message: "Account with this email is already registered"
            })
        }

        //Validation 3:Matching the password and confirm password
        if(password!==confirmPassword){
            return res.status(401).json({
                success:false,
                message:"password and confirm passsword does not match",
            })
        }


        //Verifying the OTP
        const check=await Otp.find({email}).sort({createdAt:-1}).limit(1);
        if(check.length===0){
            return res.status(400).json({
                success:false,
                message:"OTP Invalid"
            })
        }else if(check[0].otp!=otp){
            return res.status(400).json({
                success:false,
                message:"OTP does not match",
            })
        }

        //Hashing the password
        let hashedPassword;
        try {
             hashedPassword = await bcrypt.hash(password,10);
        } catch (error) {
            console.log(error);
            return res.status(401).json({
                success: false,
                message: "Error in hashing the password"
            })
        }

        //Creating the profile of the user who is signing up
        const createProfile=await Profile.create({gender:null,dateofbirth:null,about:null,contactnumber:null});

        //creating the entry of the user in the database
        const response = await User.create({ Firstname, lastname, email, password: hashedPassword, accountType,phoneNo,additionalDetails:createProfile._id,image:`https://api.dicebear.com/5.x/initials/svg?seed=${Firstname} ${lastname}` });

        //Sending the successfull response
        res.status(200).json(
            {
                Success: true,
                message: "User registered successfully",
                data: response
            }
        )
    } catch (error) {
        //Defining the catch block
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            data: error.message
        })
    }
}







//Defining the login handler
exports.login = async (req, res) => {
    try {
        //Fetching the email and password from the body of the request
        const { email, password } = req.body;
        //Validation 1: Validating whether all the required fields are filled up by the user or not
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Please fill all the required details"
            })
        }

        //Fetching the details of the user from the database and verifying whether the user is registered or not
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "User is not registered",
            })
        }

        //Validating whether the password given by the user is correct or not
        const match = await bcrypt.compare(password, user.password);
        
        if (match) {
            //creating the payload
            const payLoad = {
                email: user.email,
                id:user._id,
                accountType: user.accountType
            }
            //creating the JWT token
            const Token = await jwt.sign(payLoad, process.env.JWT_SECRET, {
                expiresIn: "2h"
            });
            user.password = undefined;
            const Option = {
                expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
                httpOnly: true
            }
            //passing the token in the form of cookie
            res.cookie("token", Token, Option).status(200).json({
                success: true,
                message: "Logged in successfully",
                Token,
                user
            })
        } else {
            //Handling the else case if the password is incorrect
            return res.status(401).json({
                success: false,
                message: "Incorrect password"
            })
        }
    } catch (error) {

        //Handling the catch block
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            data: error.message
        })
    }
}








//Defining the change password handler
exports.changePassword = async (req, res) => {
    try {
        //Fetching the data from the body from the body of the request
        const {password,newPassword,confirmNewPassword}=req.body;
        const userId=req.user.id;
        //Validating if the user is registered or not
        const user=await User.findById(userId);
        console.log(user);
        if(!user){
            return res.status(401).json({
                success:false,
                message:"User is not registered",
            })
        }
        console.log(user.password);
        console.log(password);
        //Hashing the password
        let hashedPassword;
        const check=await bcrypt.compare(password,user.password);
        console.log(check);
        //Authenticating the user by comparing the old password
        if(check){
            //Hashing the new password
            hashedPassword=await bcrypt.hash(newPassword,10);
            //Updating the password in the database
            const response=await User.findByIdAndUpdate(user._id,{password:hashedPassword});
            //Sending mail to the user about the password change
            const mailResponse=await mail(user.email,"Password changed Successfully","password Changed Successfully");
            console.log(mailResponse);
            //Sending the successful response
            res.status(200).json(
                {
                    Success: true,
                    message: "Password Changed Successfully",
                    data: response
                }
            )
        }else{
            //Handling the else case in case the old password does not match
            return res.status(401).json({
                success: false,
                message: "Incorrect password"
            })
        }
    } catch (error) {
        //Handling the catch block
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            data: error.message
        })
    }
}








//Defining the send otp handler
exports.sendOtp = async (req, res) => {
    try {

        //Fetching the email from the body of the request
        const { email } = req.body;
        //Validating if the user is already registered or not
        const user = await User.findOne({ email });
        if (user) {
            return res.status(401).json({
                success: false,
                message: "Account with this email is already registered"
            })
        }
        //Genrating the otp
        var otp =  otpgenerator.generate(6, {
            upperCaseAlphabets: false,
            lowerCaseAlphabets: false,
            specialChars: false,
        })
        console.log(otp);
        
        //Validaing if the generated otp is unique or not
        // const otpCheck = await Otp.findOne({ otp: otp })
        // while (otpCheck) {
        //     var otp = otpgenerator.generate(6, {
        //         upperCaseAlphabets: false,
        //         lowerCaseAlphabets: false,
        //         specialChars: false,
        //     })
        //     const otpCheck = await Otp.findOne({ otp: otp });
        // }

        //Creating an otp payload
        const otpPayload = { email, otp };
        //Creating the entry of the otp in the database
        const otpEntry = await Otp.create(otpPayload);

        //Sending the successful response
        res.status(200).json({
            success: true,
            message: "otp sent successfully",
            data: otpEntry
        })
    } catch (error) {

        //Handling the catch block
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            data: error.message,
        })
    }
}