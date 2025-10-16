import {z} from 'zod';

//this is the code verification schema

export const verifySchema = z.object({
    code: z.string().length(6,{message:"Verification code must be exactly 6 characters long"})
})