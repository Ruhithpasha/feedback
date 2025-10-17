


// this file is used to extend the default next-auth User type with custom properties
// by creating a declaration merging

// see by default next auth forces us to use the user type which is predefined in next-auth package but if we want to use the custome user properties we have to extend the user type like below

import 'next-auth'

declare module 'next-auth' {
    interface User {
        _id?: string
        isVerified?: boolean
        isAcceptingMessages?: boolean
        username?: string
        email?: string
    }
    interface Session {
        user: {
            _id?: string;
            isVerified?: boolean;
            isAcceptingMessages?: boolean;
            username?: string;
            email?: string;
        } & DefaultSession["user"]
    }
}


// this is an alternative way to chnage 

declare module 'next-auth/jwt' {
    interface JWT {
        _id?: string
        isVerified?: boolean
        isAcceptingMessages?: boolean
        username?: string
        email?: string
    }
}