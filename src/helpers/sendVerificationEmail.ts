import { resend } from "@/lib/resend";
import VerificationEmail from "../../emails/VerificationEmail";

import { ApiResponse } from "@/types/ApiResponse";


export async function sendVerificationEmail(
    email: string,
    username: string,
    verifyCode: string,
//here promise is used to define the return type of the function
): Promise<ApiResponse> {
    try {

        await resend.emails.send({
            from: 'onboarding@resend.dev',
            to: email,
            subject: 'Feedback - Verify your email',
            react: VerificationEmail({ username, otp: verifyCode }),
        });
        return {
            success: true,
            message: "Verification email sent successfully"
        };
        
    } catch (emailerror) {
        console.log("Error sending verification email:", emailerror);

        return {
            success: false,
            message: "Failed to send verification email"
        };
        message: "Failed to send verification email"
    }

}
    