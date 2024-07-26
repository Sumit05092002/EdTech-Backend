const jwt = require('jsonwebtoken');
const User = require('../models/User');
const mail = require('../utils/nodemailer')
const crypto=require('crypto');
const bcrypt=require('bcrypt');
//This handler is responsible for sending the email for resetting the password
exports.resetPasswordToken = async (req, res) => {
    try {
        //Fetching the email from the body of the request
        const { email } = req.body;
        //Validation 1:Checking whether the email is entered by the user or not
        const user = await User.find({ email });
        if (!email) {
            return res.status(401).json({
                success: false,
                message: "Please fill all the details",
            })
        }
        //Validation 2:verifying whether user is registered or not
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User is not registered"
            })
        }
        //Creating the token
        const token =crypto.randomBytes(20).toString("hex")
        //Adding the entry of token in the model of the user
        const updatedResponse = User.findOneAndUpdate({ email: email }, {
            token: token,
            expiresIn: Date.now() + 5 * 60 * 1000
        },
            { new: true })
            console.log(updatedResponse);
            //Creating the url for resetting the password
        const url = `http://localhost:3000/update-password/${token}`
        //Mailing the link to the user
        const mailResponse = await mail(email, "Reset Password", url);
        //Sending the successful response
        res.status(200).json({
            success: true,
            message: "Reset link sent successfully to your email"
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



//This handler is responsible for resetting the password
exports.resetPassword = async (req, res) => {
    try {
        //Fetching the required details from the body of the body of the request
        const { updatedPassword, confirmUpdatedPassword, token } = req.body;

        //Validation 1:Checking whether all the details is entered by the user or not

        if (!updatedPassword || !confirmUpdatedPassword) {
            return res.status(401).json({
                success: false,
                message: "Please fill all the details"
            })
        }
        //Validation 2
        if (updatedPassword !== confirmUpdatedPassword) {
            return res.status(401).json({
                success: false,
                message: "password and confirm passsword does not match",
            })
        }
        //Fetching the details of the user
        const user = await User.find({ token });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid token",
            })
        }
        //Checking whether the token is expired or not
        if (user.expiresIn < Date.now()) {
            return res.status(401).json({
                success: false,
                message: "Token expired, please regenerate new token",
            })
        }
        //Hashing the password
        let hashedPassword;
        try {
            hashedPassword = await bcrypt.hash(updatedPassword, 10);
        } catch (error) {
            console.log(error);
            return res.status(500).json({
                success: false,
                message: "Internal server error",
                data: error.message
            })
        }
        //Updating the entry in the database
        const response = await User.findByIdAndUpdate(user._id, { password: updatedPassword }, { new: true });
        res.status(200).json({
            success: true,
            message: "Password updated successfully",
            data: response,
        })
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