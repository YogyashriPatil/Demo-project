import User from "../model/User.model.js"
import crypto from "crypto"
import nodemailer from "nodemailer"
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
            ${process.env.BASE_URL}/api/v1/users/verify/${token}`,
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
    
};
export {registeredUser};