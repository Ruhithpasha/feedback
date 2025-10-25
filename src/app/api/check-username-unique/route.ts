import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/User.models";
import { z } from "zod/mini";
import { usernameValidation } from "@/schemas/signUpSchema";


const UsernameRequestSchema = z.object({
    username: usernameValidation
})

export async function Get(request: Request){

    // if(request.method !== "GET"){
    //     return Response.json({
    //         success: false,
    //         message: "Method not allowed use only GET method"
    //     },{status: 405})

    // }.  no need to write this it is done automatically by next js api route handling system

    await dbConnect();
    try {

        const {searchParams} = new URL (request.url)
        const queryparams = searchParams.get('username')
// here the queryparams is used to store the username from the request
        const result = UsernameRequestSchema.safeParse({username: queryparams})
        console.log("Parsed Result:", result);
// validating the username using zod schema by safely parsing it through the UsernameRequestSchema where usenameValidation is defined
        if(!result.success){
            return Response.json({
                success:false,
                message: "Invalid Username format"
            },{status: 400})
            
        }
        
        const {username} = result.data;

       const existingUsername = await UserModel.findOne({username: username, isVerified: true})
       if(!existingUsername){
        return Response.json({
            success: true,
            message: "username is available"
        },{status: 200})

       } 
       return Response.json({
        success: false,
        message: "Username is already taken"
       },{status: 400})

        } catch (error) {
        console.log("Error checking Username uniqueness", error);
        return Response.json({
            success: false,
            message: "internal server error"
        },{status: 500})
    }
}