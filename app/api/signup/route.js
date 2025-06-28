import prisma from "@/lib/prisma";
import { NextResponse } from 'next/server';
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

export const POST = async(req)=>{
    var token;
    try{
        const {email,password} = await req.json();
        const userexist = await prisma.user.findUnique({
            where: { email: email },
        });
        if(userexist){
            return NextResponse.json({error: "Email Already Exists"},{status: 200});
        }
        const hashedNewPassword = await bcrypt.hash(password, 10); 
        await prisma.user.create({
            data: {
                email: email,
                password: hashedNewPassword
            }
        });
        token = jwt.sign(email,process.env.JWT_SECRET);
    }
    catch(error){
        console.log(error);
        return NextResponse.json({error: "Internal Server Error"},{status: 500});
    }
    return NextResponse.json({msg:"Signup Successful",token},{status: 200});
}