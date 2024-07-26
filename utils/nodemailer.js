//immporting the instance of nodemailer inorder to use the nodemailer
const nodemailer=require('nodemailer');
require('dotenv').config();
//defining the mail function
const mail=async(email,subject,body)=>{
    try {
        //defining the transporter 
        let transporter=nodemailer.createTransport({
            host:process.env.MAIL_HOST,
            auth:{
                user:process.env.MAIL_USER,
                pass:process.env.MAIL_PASS
            }
        })
        
        //send mail function
        let info=await transporter.sendMail({
            from:`StudyNotion`,
            to:`${email}`,
            subject:`${subject}`,
            html: `${body}`
        })
        console.log(info);
        return info;
    } catch (error) {
        console.log(error);
    }
}

module.exports=mail;