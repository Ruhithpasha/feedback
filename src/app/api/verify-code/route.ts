import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/User.models";
import {z} from "zod/mini";
import { verifySchema } from "@/schemas/verifySchema";


const verifyCodeRequestSchema = z.object({
    code: verifySchema
})

export async function POST(request: Request){
    await dbConnect();
    try {
        
        const {username, code} = await request.json();
        const decodedUsername = decodeURIComponent(username);
        const user = await UserModel.findOne({username: decodedUsername})

        if(!user){
            return Response.json({
                success: false,
                message: " User not found"
            },{status: 404})
        }

      const iscodeValid = user.verifyCode == code;
      const isCodeNotExpired = new Date(user.verifyCodeExpiry) > new Date();
      
       if (iscodeValid && isCodeNotExpired){
        user.isVerified = true;
        await user.save();
        
        return Response.json({
            success: true,
            message: "User verified successfully"
        },{status: 200})
       }else if (!iscodeValid){
        return Response.json({
            success: false,
            message: "Invalid Verification code"
        },{status: 400})
       }else if (!isCodeNotExpired){
        return Response.json({
            success: false,
            message: "Verification code has expired"
        },{status: 400})
       }
    } catch (error) {
        console.log("Error verifying code", error);
        return Response.json({
            success: false,
            message: "Internal server error not able to verify code"
        },{status: 500})
        
    }
}