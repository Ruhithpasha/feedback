import {z} from 'zod';

export const messageSchema = z.object({
    content: z.string().min(1,{message:"Message content cannot be empty"}).max(1000,{message:"Message content must be at most 1000 characters long"}),
    
})