import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

export const POST = async (req) => {
    var token;
    try {
        const { email, password } = await req.json();
        const response = await prisma.user.findUnique({
            where: { email: email },
        });
        if (!response) {
            return NextResponse.json({ error: "Invalid Email" }, { status: 200 });
        }
        const isMatch = bcrypt.compareSync(password, response.password);
        if (!isMatch) {
            return NextResponse.json({ error: "Invalid Password" }, { status: 200 });
        }
        token = jwt.sign(email, process.env.JWT_SECRET);
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
    return NextResponse.json({ msg: "Success", token }, { status: 200 });
};
