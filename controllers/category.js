const Category=require('../models/Category');
exports.createcategory=async(req,res)=>{
    try {
        //Fetching the data from the body of the request
        const {name,description}=req.body;

        console.log(name);
        console.log(description);
        //Validation1
        if(!name||!description){
           return res.status(400).json({
                success:false,
                message:"All fields are required",
            })
        }

        //Validation2
        const category=await Category.findOne({name});
        console.log(category);
        if(category){
            return res.status(401).json({
                success:false,
                message:"category already exist",
            })
        }

        //Creating the entry of the category in the database
        const response=await Category.create({name,description});
        res.status(200).json({
            success:true,
            message:"category created successfully",
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

exports.getcategory=async(req,res)=>{
    try {
        //Fetching all the Category from the database
        const response=await Category.find({});

        //Sending the successfull response
        res.status(200).json({
            success:true,
            message:"category fetched successfully",
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

exports.getCategoryPageDetails=async(req,res)=>{
    try {
        const {categoryId}=req.body;
        console.log(categoryId);
        if(!categoryId){
            return res.status(400).json({
                success:false,
                message:"All fields are required"
            })
        }

        const categoryDetails=await Category.find({categoryId});
        if(!categoryDetails){
            return res.status(400).json({
                success:false,
                message:"Invalid category Id"
            })
        }

        const result=await Category.findById(categoryId).populate("course").exec();
        // const recommended=await Category.findById({_id: {$ne:categoryId}}).populate("course").exec();
        if(!result){
            return res.status(404).json({
                success:false,
                message:"No course found for the given category",
            })
        }

        res.status(200).json({
            success:true,
            message:"Courses fetched successfully",
            data:{
                result,
                // recommended
            },
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success:false,
            message:"Error in fetching the courses",
            data:error.message,
        })
    }
}