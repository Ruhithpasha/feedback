import { ApiResponse } from "@/types/ApiResponse";
import { resend } from "@/lib/resend";
import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/dbConnect";
import { success } from "zod";
import UserModel from "@/models/User.models";
import { send } from "process";
export async function POST(request: Request) {
  await dbConnect();
  try {
    const { username, email, password } = await request.json();

    // check if the user already exists
    const existingUserVerifiedByUserName = await UserModel.findOne({
      username,
      isVerified: true,
    });

    if (existingUserVerifiedByUserName) {
      return Response.json(
        {
          success: false,
          message: "Username is already taken",
        },
        { status: 400 }
      );
    }

    const existingUserByEmail = await UserModel.findOne({ email });
// generate a 6 digit random number as a string
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    // set the code expiry time to 1 hour from now
    const codeexpiry = new Date();
    codeexpiry.setHours(codeexpiry.getHours() + 1);
    if (existingUserByEmail) {
        if (existingUserByEmail.isVerified){
            return Response.json({
                success: false,
                message: "User with this email already exists and is verified. Please log in."
            },{status: 400})

        }else{
            //if the user exists but is not verified then update the user details and send the verification email again
            const hashedPassword = await bcrypt.hash(password,10)
            existingUserByEmail.username = username;
            existingUserByEmail.password = hashedPassword;
            existingUserByEmail.verifyCode = code;
            existingUserByEmail.verifyCodeExpiry = codeexpiry; 
            await existingUserByEmail.save();
        }
    } else {
        //registering the user for the first time and hashing the password before saving it to the database
      const hashedPassword = await bcrypt.hash(password, 10);
      // create a new user
      const newUser = new UserModel({
        username,
        email,
        password: hashedPassword,
        verifyCode: code,
        verifyCodeExpiry: codeexpiry,
        isVerified: false,
        isAcceptingMessage: true,
        messages: [],
      });
      await newUser.save();
    }
    //sending the verification email to the user
    const emailResponse = await sendVerificationEmail(email, username, code);
// if email is not sent successfully then return the error message
    if(!emailResponse.success){
        return Response.json({
            success: false,
            message: emailResponse.message
        },{status:500})
    }
    // if email is sent successfully then return the success message
     return Response.json({
            success: true,
            message: "User registered successfully. Please check your email for the verification code."
        },{status:201})

  } catch (error) {
    console.error("Error in the sign-up route:", error);
    return Response.json(
      {
        success: false,
        message: "Error registering the user",
      },
      {
        status: 500,
      }
    );
  }
}
