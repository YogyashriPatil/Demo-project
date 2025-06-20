import User from "../model/User.model.js"
import crypto from "crypto"
import nodemailer from "nodemailer"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
const registeredUser= async(req,res) => { 
    //get data
    // validate
    // check if user already exists
    // create a user in database
    // create a verification token
    // save token in database
    // send token as email in user
    // send success status to user
    // console.log(req);
    const { name,email,password} = req.body || {}
    if(!name || !email || !password){
        return res.status(400).json({
            message:"All fields are required",
        })
    }
    try {
        const existinguser= await User.findOne({email})
        if(existinguser){
            return res.status(400).json({
                message:"User already exist"
            })
        }

        const user=await User.create({
            name,email,password
        })
        console.log(user);

        if(!user){
            return res.status(400).json({
                message:"User already exist"
            })
        }
        //generate a token using crypto module 
        //also generate another by logic
        const token=crypto.randomBytes(32).toString("hex")
        console.log(token);

        //save in the database 
        user.verificationToken=token
        //await because db in another continent
        await user.save()

        console.log(user);
        //send email

        const transporter=nodemailer.createTransport({
            host:process.env.MAILTRAP_HOST,
            port: process.env.MAILTRAP_PORT,
            secure:false, //trur for port 465, flase to other ports
            auth:{
                user:process.env.MAILTRAP_USERNAME,
                pass:process.env.MAILTRAP_PASSWORD,
            },
        });

        const mailOption={
            from: process.env.MAILTRAP_SENDERMAIL,
            to: user.email,
            subject:"Verify your email", //subject line
            text:`please click on the following link : 
            ${process.env.BASE_URL}api/v1/users/verify/${token}`,
        };

        const checkMail=await transporter.sendMail(mailOption)
        if(!checkMail){
            return res.status(400).json({
                message:"User already exist"
            })
        }
        res.status(201).json({
            message:"User registered successfully",
            success:true
        })
    } catch (error) {
        res.status(400).json({
            message:"User not registered ",
            error,
            success:false,
        })
    }
    // console.log(email);
    res.send("Register")
    
};

const verifyUser= async(req,res) => {
    // get token from url
    // validate token

    // find user based on the token
    // if not
    // set iserfied token true
    // remove verification token
    // save 
    // return response

    const {token}=req.params;
    console.log(token);
    if(!token){
        return res.status(400).json({
            message:"Invallid token"
        })
    }
    const user=await User.findOne({verificationToken:token})
    if(!user){
        return res.status(400).json({
            message:"Invallid token"
        })
    }   
    user.isVerified=true
    user.verificationToken=undefined
    await user.save()
    return res.status(200).json({
        message:"Verify user"
    })
    res.send("Succes")
};

const login =async(req,res) => {
    const {email,password}=req.body

    if(!email || !password){
        return res.status(400).json({
            message:"All fields are required"
        })
    }

    try {
        const user = await User.findOne({email})
        if(!user)
        {
            return res.status(400).json({
                message:"Invalid email or password",
            })
        }

        const isMatch=await bcrypt.compare(password, user.password)
        console.log(isMatch);

        if(!isMatch){
            return res.status(400).json({
                message:"Invalid email or password",
            });
        }

        if(!user.isVerified)
        {
            return res.status(400).json({
                message:"user not verified please verified it",
            });
        }

        const token = jwt.sign({id:user._id,role:user.role},
            process.env.JWT_SECRETE,{
                expiresIn:'2 days'
            }
        );
        //also give start time, expire time

        const cookieOption={
            httpOnly:true,
            secure:true,
            maxAge:24*60*600*1000
        }

        res.cookie("token",token,cookieOption)
        
        res.status(200).json({
            success:true,
            message:"Login successful",
            token,
            user:{
                is:user._id,
                name:user.name,
                role:user.role,
            }
        })

    } catch(error) {
        console.log(error);
        res.status(400).json({
            message:"User not login",
            error,
            success:false,
        })
    }
};

const getMe= async(req,res) => {
    try {

        const user = await User.findById(req.user.id).select('-password')

        if (!user){
            return res.status(400).json({
                success:false,
                message:"User not found",
            });
        }

        res.status(200).json({
            success:true,
            user,
        });
        // console.log("getme reqest reached");
        // const data=req.user
        // console.log(data);
    } catch (error) {
        console.log(error);
    }
}

const logoutUser= async(req,res) => {
    try {
        res.cookie('token','',{
            // expires: new Date(0)
        })
        res.status(200).json({
            success:true,
            message:"logged out successfully"
        });
    } catch (error) {
        
    }
}

const forgotPassword= async(req,res) => {
   
        //get email =req.body
        // find user based on email
        // reset token + reset expiry => date.now()+10*60*1000 => user.save()
        // send mail => design url

        const {email}=req.body
        
        try {
            const user= User.findOne({email})
            if(!user){
                return res.status(400).json({
                    message:"User not found"
                })
            }

            const token=crypto.randomBytes(32).toString("hex")
            console.log(token);
            
            const resetPasswordExpire = Date.now()+ 10*60*1000

            user.resetPasswordExpires = resetPasswordExpire

            await user.save()
            const transporter=nodemailer.createTransport({
                host:process.env.MAILTRAP_HOST,
                port: process.env.MAILTRAP_PORT,
                secure:false, //trur for port 465, flase to other ports
                auth:{
                    user:process.env.MAILTRAP_USERNAME,
                    pass:process.env.MAILTRAP_PASSWORD,
                },
            });

            const mailOption={
                from: process.env.MAILTRAP_SENDERMAIL,
                to: user.email,
                subject:"reset your password", //subject line
                text:`please click on the following link to reset the password: 
                ${process.env.BASE_URL}api/v1/users/resetpassword/${token}`,
            };

            const checkMail=await transporter.sendMail(mailOption)
            if(!checkMail){
                return res.status(400).json({
                    message:"User already exist"
                })
            }
        } catch (error) {
            console.error("Error in forgotPassword:", error);
        return res.status(500).json({ message: "Internal Server Error" });
        }
}

const resetPassword = async(req,res) => {
    try {
        // collect token from params
        // password from re.body
        // findone
        const {token} =req.params
        const {password} =req.body

        try {
            User.findOne({
                resetPasswordToken:token,
                resetPasswordExpires: { $gt: Date.now() }
            })
            //set password in user
            // resetToken, resetExpiry => reset
            //save

        } catch (error) {
            
        }

    } catch (error) {
        
    }
}

export {registeredUser,verifyUser,login, getMe, logoutUser, forgotPassword, resetPassword };