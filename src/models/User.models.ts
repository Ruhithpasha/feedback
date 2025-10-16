// this is the first file to be created because other files are dependent on this file
// this file contains the user schema and model
// this file also contains the message schema and model
// because messages are embedded in user schema

import mongoose, {Schema, Document }from  "mongoose";

// Document is introudced to maintain type safety and it is used only in typescript

//message schema
export interface Message extends Document{
    content: string;
    createdAt: Date;
}

const MessageSchema: Schema<Message> = new Schema({
    content: {
        type: String,
        required: true,
        trim: true
    },
    createdAt:{
        type:Date,
        required:true,
        default: Date.now
    },

})

// user Schema
export interface User extends Document{
    username: string;
    email:string;
    password:string;
    verifyCode:string;
    verifyCodeExpiry:Date;
    isVerified:boolean;
    isAcceptingMessage:boolean;
    messages:Message[];  //to store messages in user schema
}

// the user schema is defined here itself instead of defining it in a separate file in schemas folder because it is not used anywhere else
const UserSchema: Schema<User> = new Schema({

    username:{
        type:String,
        required:[true,"Username is required"],
        unique:true,
        trim:true,
    },
    email:{
        type:String,
        required:[true,"Email is required"],
        unique:true,
        trim:true,
        match:[/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,"Please fill a valid email address"] 
    },
    password:{
        type:String,
        required:[true,"Password is required "],
        // unique:true,
        trim:true 
    },
    verifyCode:{
        type:String,
        required:[true,"Verify code is required"],
        trim:true 
    },
    verifyCodeExpiry:{
        type:Date,
        required:[true,"Verify code expiry is required"],
    },
    isVerified:{
        type:Boolean,
        // required:true,
        default:false
    },
    isAcceptingMessage:{
        type:Boolean,
        // required:true,
        default:true
    },
    messages:[MessageSchema]  //embedding message schema in user schema
})
// This line is wriiten this way to avoid "OverwriteModelError: Cannot overwrite `User` model once compiled." error
// which occurs during hot reloading in development mode
// mongoose.models is an object that contains all the models that have been registered with mongoose
// mongoose.model is a function that registers a model with mongoose
// if the model is already registered, it returns the existing model
// if the model is not registered, it creates a new model and registers it
// This way, we avoid overwriting the model if it already exists
const UserModel = (mongoose.models.User as mongoose.Model<User>) || mongoose.model<User>("User", UserSchema);

export default UserModel;
