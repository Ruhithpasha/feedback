
import {Message} from "@/models/User.models";
//interface is used to define the structure of an object
// here we are defining the structure of the ApiResponse object that will be returned by the API
// it will have three properties success, message and isAcceptingMessages
export interface ApiResponse{
    success: boolean;
    message: string;
    isAcceptingMessages?: boolean;
    messages?: Array<Message>;
}