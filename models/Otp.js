//importing the instance of mongoose to create model
const mongoose=require('mongoose');

//importing the mail function inorder to mail the otp
const mail=require('../utils/nodemailer')
const emailVerificationTemplate=require('../mail/templates/emailVerificationTemplate')
//Defining the OTPSchema
const otpSchema=new mongoose.Schema({
   email:{
    type:String,
    required:true,
   },

   otp:{
    type:Number,
    required:true,
   },

   createdAt:{
    type:Date,
    default:Date.now(),
    expires:5*60,
   }
})

//Defining a function that will call the mail function
async function sendVerificationEmail(email,otp){
    try {
        const mailResponse= await mail(email,"Email Verification",otp);
        console.log(mailResponse);
        
    } catch (error) {
        console.log(error);
    }
}

//Defining the pre middleware that is calling the above function
otpSchema.pre("save",async function(next){
    console.log("This is pre middleware");
    await sendVerificationEmail(this.email,emailVerificationTemplate(this.otp));
    next();
})

module.exports=mongoose.model("Otp",otpSchema)