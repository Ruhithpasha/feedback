import {z} from 'zod';

// identifier = email or username you can do signIn using email or username

export const signInSchema = z.object({

    identifier: z.string().min(3,{message:"Identifier must be at least 3 characters long"}).max(100,{message:"Identifier must be at most 100 characters long"}),
    password: z.string().min(6,{message:"Password must be at least 6 characters long"}).max(100,{message:"Password must be at most 100 characters long"})

})