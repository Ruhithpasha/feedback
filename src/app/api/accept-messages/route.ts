
// here we will be checking if the user is accepting messages or not and also we will be able to update the status of accepting messages and check if the user is authenticated or not

import UserModel from "@/models/User.models";

import dbConnect from "@/lib/dbConnect";
import { getServerSession, User } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/option";

// Accept messages only for authenticated users
// this below code is to check if the user is authenticated or not when they try to accept messages

export async function POST(request:Request){
    dbConnect();

    const session = await getServerSession(authOptions);
    const user :User = session?.user as User;

    if (!session || !session.user) {
        return Response.json({
            success: false,
            message: "Unauthorized"
        },{status: 401})
        
    }
    const userId = user._id;
    const {acceptMessages} = await request.json();

    try {
        const updatedUser = await UserModel.findByIdAndUpdate(userId, {isAcceptingMessages: acceptMessages},{new: true})

        if(!updatedUser){
            return Response.json({
                success: false,
                message: "User not found"
            },{status: 404})
        }else{
            return Response.json({
                success: true,
                message:" Message acceptance status updated successfully",
                data: updatedUser
            },{status: 200})
        }
    } catch (error) {
        console.log("Failed to update user status to update messages acceptance", error);
        return Response.json({
            success: false,
            message: "Internal server error unable to update message acceptance status"
        },{status: 500 })
        
    }
}
// Get message acceptance status for authenticated users
// this below code is to get if the user is accepting messages or not
export async function GET(request: Request){
    
    //. the below code asks you who you are before allowing you to see if you are accepting messages or not 
    await dbConnect();

    const session = await getServerSession(authOptions);
    const user : User = session?.user as User;

    if (!session || !session.user){
        return Response.json({
            successs: false,
            message: "Unauthorized"
        },{status: 400})
    }

    const userId = user._id;
     
try {
    const  foundUser = await UserModel.findById(userId)
    
        if (!foundUser) {
            return Response.json(({
                success: false,
                message: "User not found"
            }),{status: 404})
        }
        return Response.json({
            success: true,
            message: "User found Sucessfully",
            data: {
                isAcceptingMessages: foundUser.isAcceptingMessage
            }
        },{status: 200}) 
} catch (error) {
    console.log("Error fetching user message acceptance status", error);
    return Response.json({
        success: false,
        message: "Internal server error unable to fetch message acceptance status"
    },{status: 500})
}
}