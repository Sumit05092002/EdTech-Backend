//importing the instance of jsonwebtoken
const jwt=require('jsonwebtoken');
require('dotenv').config();
exports.checkAuth=(req,res,next)=>{
    try {
        //fetching the token from the body of the request
        const token=req.body.token;
        // console.log(token);
        if(!token||token==undefined){
            return res.status(401).json({
                success:false,
                message:"Token not found"
            })
        }

        //Decoding the token
        try {
            const payload=jwt.verify(token,process.env.JWT_SECRET);
            //Inserting the payload in the body of request so that the next middlewares can use it to authorize the users
            req.user=payload;
        } catch (error) {
            return res.status(401).json({
                success:false,
                message:"Invalid token"
            })
        }
        //moving on to next middleware
        next();
    } catch (error) {
        //Handling the catch block
        console.log(error);
        res.status(500).json({
            success:false,
            message:"Internal server Error",
            data:error.message,
        })
    }
}

exports.isStudent=(req,res,next)=>{
    try {
        //Fetching the account type from the payload attached in the body of the request
        const isStudent=req.user.accountType;
        //Handling the case if the account type is not student
        if(isStudent!=="Student"){
            return res.status(401).json({
                success:false,
                message:"This is a protected route for students and you do not have access to this section of the webapp"
            })
        }
        next();
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success:false,
            message:"Internal server error",
            message:error.message,
        })
    }
}

exports.isInstructor=(req,res,next)=>{
    try {
        const role=req.user.accountType;
        if(role!=="Instructor"){
            return res.status(401).json({
                success:false,
                message:"This is a protected route for instructor and you do not have access to this part of the webapp"
            })
        }
        next();
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success:false,
            messsage:"Internal server error",
            data:error.message,
        })
    }
}


exports.isAdmin=(req,res,next)=>{
    try {
        const role=req.user.accountType;
        if(role!=="Admin"){
            return res.status(401).json({
                success:false,
                message:"This is a protectd route for admin and you do not have an access of this part of the webapp",
            })
        }
        next();
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success:false,
            message:"Internal server error",
            data:error.message,
        })
    }
}


