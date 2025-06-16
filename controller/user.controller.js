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
            "shhhhh",{
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
        res.status(400).json({
            message:"User not login",
            error,
            success:false,
        })
    }
};

export {registeredUser,verifyUser,login};