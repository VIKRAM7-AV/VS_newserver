import User from "../Models/userModel.js";
import bcrypt from "bcryptjs";
import generateToken from "../utils/generateToken.js";

export const signup=async (req,res)=>{
    try {
        const {username,password,phone,code}=req.body;
        if(!username || !password || !phone || !code){
            return res.status(400).json({message:"Please fill all the fields"})
        }
        const user=await User.findOne({username});
        if(user){
            return res.status(400).json({message:"User already exists"})
        }

        // const emailRegex= /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        // if(!emailRegex.test(email)) {
        //     return res.status(400).json({ error: "Invalid email format" });
        // }
        // const existingemail=await User.findOne({email});
        // if(existingemail){
        //     return res.status(400).json({message:"Email already exists"})
        // }
        const SecretCode=process.env.SIGNUP_CODE;
        if(code !== SecretCode){
            return res.status(400).json({message:"Invalid code"})
        }

        if(password.length < 6) {
            return res.status(400).json({message:"Password must be at least 6 characters long"})
        }

        if(phone.length !== 10) {
            return res.status(400).json({message:"Phone number must be 10 digits long"})
        }

        const existingPhone=await User.findOne({phone});
        if(existingPhone){
            return res.status(400).json({message:"Phone number already exists"})
        }      

        const salt=await bcrypt.genSalt(12);
        const hashedPassword=await bcrypt.hash(password,salt);

        const newUser= new User({
            username,
            password:hashedPassword,
            phone,
            code
        });

        generateToken(newUser._id,res);
        await newUser.save();

        res.status(200).json({message:"User created successfully"})

    } catch (error) {
        console.log("Error in signup controller",error);
        res.status(500).json({message:"Internal Server Error"})
    }
}

export const login=async(req,res)=>{
    try {
        const {username,password}=req.body;
        if(!username || !password){
            return res.status(400).json({message:"Please fill all the fields"})
        }

        const user=await User.findOne({username});
        if(!user){
            return res.status(400).json({message:"User not found"})
        }

        const isMatched=await bcrypt.compare(password,user.password);
        if(!isMatched){
            return res.status(400).json({message:"password is incorrect"})
        }

        generateToken(user._id,res);
        res.status(200).json(({message:"Login successfully"}));
        
    } catch (error) {
        console.log("Error in login controller",error);
        res.status(500).json({message:"Internal Server Error"})
    }
}

export const logout=async(req,res)=>{
    try {
        res.cookie("token","",{maxAge:0});
        res.status(200).json({message:"Logout successfully"})        
    } catch (error) {
        console.log("Error in logout controller",error);
        res.status(500).json({message:"Internal Server Error"})
    }
}

export const getme=async(req,res)=>{
    try {
        const user=await User.findOne({_id:req.user._id}).select("-password");
        if(!user){
            return res.status(400).json({message:"User not found"})
        }
        res.status(200).json({user});
        
    } catch (error) {
        console.log("Error in getme controller",error);
        res.status(500).json({message:"Internal Server Error"})
    }
}