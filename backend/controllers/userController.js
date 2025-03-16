const User=require('../models/userModel.js');
const bcrypt=require('bcrypt');
const jwt=require('jsonwebtoken');
const getDataUri=require('../utils/datauri.js');
const cloudinary=require("../utils/cloudinary.js");



const register=async(req,res)=>{
   try {
    const {fullname,email,phoneNumber,password,role}=req.body;

const file=req.file;
const fileUri=getDataUri(file);
const cloudResponse=await cloudinary.uploader.upload(fileUri.content);



    if(!fullname || !email || !phoneNumber || !password || !role){
        return res.status(400).json({
            success:false,
            message:"All fields are required to be Filled"
        });
    }

    
    const user=await User.findOne({email});

    if(user){
        return res.status(400).json({
            success:false,
            message:"User already exists"
        });
    }

    const hashedPassword=await bcrypt.hash(password,10);

    await User.create({
        fullname,
        email,
        phoneNumber,
        password:hashedPassword,
        role,
        profile:{
            profilePhoto:cloudResponse.secure_url,
        }
        
       
    });

   return  res.status(201).json({
        success:true,
        message:"Account created successfully"
    })
   } catch (error) {
    console.log(error);
    
   }
}


const login=async (req,res)=>{
    try {
        const {email,password,role}=req.body;

        if(!email || !password ||!role){
            return res.status(400).json({
                success:false,
                message:"All fielda are required to be Filled"
            });

        }
        let user=await User.findOne({email});

        if(!user){
            return res.status(400).json({
                success:false,
                message:"Incorrect email or password"
            });
        }

        const isCorrectPassword=await bcrypt.compare(password,user.password);

        if(!isCorrectPassword){
            return res.status(400).json({
                success:false,
                message:"Incorrect email or password"
            });
        }

        
if(role !==user.role){
    return res.status(400).json({
        success:false,
        message:"your role is incorect.."
    });
}

const tokenData={
    userId:user._id
}
const token=await jwt.sign(tokenData, process.env.SECRET_KEY,{expiresIn:'1d'});

user={
    _id:user._id,
    fullname:user.fullname,
    email:user.email,
    phoneNumber:user.phoneNumber,
    role:user.role,
    profile:user.profile
    
}

return res.status(200).cookie("token", token, {maxAge:1*24*60*60*1000, httpsOnly:true, sameSite:'strict'}).json({
    success:true,
    message:`Welcome back ${user.fullname}`,
    user
})

    } catch (error) {
        console.log(error);
    }
}

const logout=async (req,res)=>{
    try {
        return res.status(200).cookie("token","",{maxAge:0}).json({
            success:true,
            message:"Logged out successfully"
        })
    } catch (error) {
        console.log(error);
    }
}


const updateProfile=async (req,res)=>{
    try {
        
const {fullname, email,phoneNumber,bio,skills}=req.body;

const file=req.file;
const fileUri=getDataUri(file);
const cloudResponse=await cloudinary.uploader.upload(fileUri.content);


if(!fullname || !email || !phoneNumber || !bio || !skills){
    return res.status(400).json({
        success:false,
        message:"All fielda are required to be Filled"
    });

}
let skillsArray;
if(skills){
    skillsArray=skills.split(',');

}
const userId=req.id;

let user=await User.findById(userId);

if(!user){
    return res.status(400).json({
        success:false,
        message:"User not Found"
    });
}

if(fullname) user.fullname=fullname
if(email) user.email=email
if(phoneNumber) user.phoneNumber=phoneNumber

if(bio) user.profile.bio=bio
if(skills) user.profile.skills=skillsArray

if(cloudResponse){
    user.profile.resume=cloudResponse.secure_url
    user.profile.resumeOriginalName=file.originalname
}

await user.save();

user={
    _id:user._id,
    fullname:user.fullname,
    email:user.email,
    phoneNumber:user.phoneNumber,
    role:user.role,
    profile:user.profile
}

return res.status(200).json({
    success:true,
    message:"Profile updated successfully",
    user
})


    } catch (error) {
        console.log(error);
        
    }
}



module.exports={
    register:register,
    login:login,
    logout:logout,
    updateProfile:updateProfile
}