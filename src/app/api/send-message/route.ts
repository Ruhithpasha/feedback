import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/User.models";
import { Message } from "@/models/User.models";

export async function POST(request: Request){
    await dbConnect();

    const {username , content} = await request.json();
    try {
        const user = await UserModel.findOne({username})
        if (!user) {
            return Response.json({
                success: false,
                message: "User not found"
            },{status: 404})
        }

        // Check if user is accepting messages
        if (!user.isAcceptingMessage){
            return Response.json({
                success: false,
                message: "User is not accepting messages"
            },{status: 403})
        }

        const newMessage = {content, createdAt: new Date()}

        //Here we push the new message to the user's messages array
        //here you may get the error like the content and createdAt are not assignable to type Message this refers to the schema defined in User.models.ts that can be fixed by type assertion which means we are telling typescript that we are sure that the object conforms to the Message type like the content and the createdAt are taken from the Message schema only
        user.messages.push(newMessage as Message)
        user.save()
        
        return Response.json({
            success: true,
            message: "Message sent successfully"
        },{status: 200})
    } catch (error) {
        return Response.json({
            success: false,
            message: "Internal server error unable to send message"
        },{status: 500})
    }
}