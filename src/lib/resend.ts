import {Resend } from 'resend'

export const resend = new Resend(process.env.RESEND_API_KEY);

// this syntax (new Resend) is used to create a new instance of the Resend class, which is then used to send emails through the Resend service.


