import UserModel from "@/models/User.models";

import dbConnect from "@/lib/dbConnect";
import { getServerSession, User } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/option";
import mongoose from "mongoose";



// here we are implementing the aggregation pipelines to get messages for authenticated users
export async function GET(request: Request){
    await dbConnect();
    const session = await getServerSession(authOptions)
    const user = session?.user as User;

    if (!session || !session.user){
        return Response.json({
            success: false,
            message: "Unauthorized"
        },{status: 401})
    } 
        //Implementing aggregation pipeline to get messages for authenticated users

        const userId = new mongoose.Types.ObjectId(user._id);

    try{
        const user = await UserModel.aggregate([
            {$match:{_id: userId}},
            {$unwind: "$messages"},
            {$sort: {"messages.createdAt": -1}},
            {$group: {
                _id: "$_id",
                messages: {$push: "$messages"}
            }}
        ])

        if(!user || user.length === 0){
            return Response.json({
                success: false,
                message: "No messages found for this user"
            },{status: 404})
        }else{
            return Response.json({
                success: true,
                messages: user[0].messages
            },{status: 200})
        }


    }catch(error){
        return Response.json({
            success: false,
            message: "Internal server error unable to get messages"
        },{status: 500})

        }
    }
     

