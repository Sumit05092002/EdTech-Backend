const cloudinary=require('cloudinary').v2;

require('dotenv').config();

exports.cloudinaryConnect=()=>{
    try {
        cloudinary.config({
            cloud_name:process.env.CLOUD_NAME,
            api_key:process.env.API_KEY,
            api_secret:process.env.API_SECRET
        })
    } catch (error) {
        console.log(error);
    }
}


exports.resourceUploader=async(image,folder,quality)=>{
    const options={folder:folder,resource_type:"auto",chunk_size:6000000}
    if(quality){
        options.quality=quality;
    }
    const res= await cloudinary.uploader.upload(image.tempFilePath,options);
    console.log(res);
    return res;
}