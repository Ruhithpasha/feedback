import {
    Head,
    Html,
    Font,
    Preview,
    Heading,
    Body,
    Row,
    Section,
    Text,
    Container

} from '@react-email/components'
// this is the verification email template
//here interface is used to define the props that the component will receive from its parent component
// the parednt component is the function that sends the verification email which is sendVerificationEmail function in sendVerificationEmail.ts file in helpers folder
// props are used to pass data from one component to another component
// here we are passing username and otp as props to the VerificationEmail component
interface VerificationEmailProps{
    username: string;
    otp: string;

}

export default function VerificationEmail({username,otp}:VerificationEmailProps){
    return (
        <Html lang='en' dir='ltr'>
            <Head>
                <title>Verify your email</title>
            </Head>
            <Body>
                <Container>
                    <Heading>Hello {username}, thanks for registering</Heading>
                    <Text>Your OTP is: {otp}</Text>
                    <Text>This OTP is valid for 10 minutes. Please do not share it with anyone.</Text>
                    <Text>Thanks,<br/>The Feedback Team</Text>
                </Container>
            </Body>
        </Html>
    )
}