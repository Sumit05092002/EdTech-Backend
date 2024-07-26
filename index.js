//importing the dbConnect function inorder to establish the connction between server and database
const dbConnect=require('./config/database');
// //importing the function to establish connection with the cloudinary
const cloudinary=require('./utils/imageUploader');

//instantiating the server
const express=require('express');
const app=express();

//importing dotenv package to load the configuration of environment file into process object 
require('dotenv').config();
const port=process.env.PORT;

//listening the server at 3000 port no
app.listen(port,()=>{
    console.log(`your server has started at port no ${port}`);
})

//creating a default route for testing the server
app.get("/",(req,res)=>{
    res.send("Hello! This is your StudyNotion server");
});

//integrating the body parser
app.use(express.json());

//integrating the cookie parser inorder to deal with the cookies

//invoking the dbConnect function inorder to establish the connection with database
dbConnect();

// //invoking the cloudinary function
cloudinary.cloudinaryConnect();
const fileupload=require('express-fileupload');
app.use(fileupload({
        useTempFiles : true,
        tempFileDir : '/tmp/'
    }));
    
    //importing the routes
    const route=require('./routes/EdTech');
    //Mounting the routes
    app.use('/api/v1',route);
    const cookieParser=require('cookie-parser');
    app.use(cookieParser);
