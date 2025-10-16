import mongoose from "mongoose";
// to maintain connection status and this is optional (it does not gurantee that connection is always maintained -- if it is maintained the return type should be number)
type ConnectionObject = {
    isConnected?: number; // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
}
// main code starts here to connect to database
const connection: ConnectionObject ={}

async function dbConnect(): Promise<void>{
    if (connection.isConnected){
        console.log("Already connected to database");
        return;
    }
    try{
       const db = await mongoose.connect(process.env.MONGODB_URI || "");

       //this is to see if the db is in ready state i mean connected state
       connection.isConnected = db.connections[0].readyState;
       console.log(db.connection)
       console.log(db)
       console.log(connection.isConnected)
       console.log("Connected to database");


    }catch(error){
        console.log("Error connecting to database",error);
        throw error;
        // process.exit(1);
    }

}


export default dbConnect;