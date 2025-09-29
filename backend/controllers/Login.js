const express=require('express');
const UserModel=require('../models/Users');
const bcrypt = require('bcrypt');
//Loging User with there credientials...

exports.LoginUser=async (req,res)=>{
    try{
        //getting login details 
        const Email=req.body.email;
        const Password=req.body.password;
        console.log(req.body);
        console.log(Email)
        const existingUser= await UserModel.findOne({email:Email});
        console.log(existingUser)
        if(!existingUser){
            console.log('user not found')
            return res.status(404).json({message:"user not found.."})
        }
        const isMatch = await bcrypt.compare(Password, existingUser.password);
        
        console.log(isMatch)
        if (isMatch){
            console.log('login successfull')
            return res.status(200).json({message:"Login successfully..."})
        }else{
            console.log('Password not matched')
            return res.status(400).json({message:"Invalid Credentials"})
        }
    }catch{
        console.log("Error registering user:");
        res.status(500).json({ msg: 'Server error' });
    }
}

    







