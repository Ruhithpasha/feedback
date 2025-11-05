
"use client"
 
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import * as z from "zod"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useDebounceValue, useDebounceCallback } from 'usehooks-ts'
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { signInSchema } from "@/schemas/signInSchema"
import { signUpSchema } from "@/schemas/signUpSchema"
import axios, {AxiosError} from "axios"
import { ApiResponse } from "@/types/ApiResponse"
import { set } from "mongoose"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"



export default function SignUpPage() {

const [username, setUsername] = useState('');
// below code is to get the message from the backend regarding username availability
const [usernameMessage, setUsernameMessage]= useState('');
// to show loading state while checking username availability
const [isCheckingUsername, setIsCheckingUsername] = useState(false);

//below code is to check if the form is submitting or not

const [isSubmitting, setIsSubmitting] = useState(false);
// debounce the username input to avoid making too many requests to the backend this is used to check the username entered in the field after 500 milisecs of iactivity instead of checking for every letter entered which increases server load
const debounced = useDebounceCallback((value: string) => {
  setUsername(value);
}, 500);


//Implementation of zod
// we are implementing zod here to validate the form data according to the schema defined in signUpSchema 
//Using router here to redirect the user after successful sign up
const router = useRouter();

// useForm hook from react-hook-form to manage form state and validation
//the typeof signupschema ensures the form data follows only the signUpSchema
// zodResolver is used to integrate zod validation with react-hook-form which checks the username , email and password are according to the schema defined in signupSchema and make it empty string by default
const form  = useForm <z.infer<typeof signUpSchema>>({
  resolver: zodResolver(signUpSchema),
  defaultValues:{
    username: '',
    email: '',
    password: ''
  }
})
// useEffect hook to check username uniqueness whenever the debounced username changes
useEffect(() => {
  const checkUsernameUniqueess = async () =>{
    if (username){
      setIsCheckingUsername(true);
      setUsernameMessage('');
      


      // here we are connecting frontend with the backend to check if the username is unique or not. 

      // this is how we always make api calls from frontend to backend in nextjs 15 which results in connection with frontend and backend
      try {
        const response = await axios.get(`/api/check-username-unique?username=${username}`)
        setUsernameMessage(response.data.message)

      } catch (error) {
        console.log('Error checking username uniqueness', error)

        const axiosError = error as AxiosError<ApiResponse>
        setUsernameMessage(axiosError.response?.data.message?? 'Error checking username')
      } finally{
        setIsCheckingUsername(false)
      }
    }
  }
  checkUsernameUniqueess()
}
, [username ])
//Here we are implementing the form submission handler to submit the form data to the backend api route for sign up
//And also we are inferring the type of data from the signUpSchema defined in zod schema where inferring refers to extracting the type information from the schema so that we can use it for type checking in typescript
const onSubmit = async (data: z.infer<typeof signUpSchema>) =>{
 setIsSubmitting(true);
 
 console.log('Form Data Submitted:', data);
 console.log('Username:', data.username);
 console.log('Email:', data.email);
 console.log('Password:', data.password);

 try {
  
  const response = await axios.post('/api/sign-up', data)
  toast.success('Sign up Successfull',{
    description: response.data.message
  })
  //after the successful signup redirecting to the verify page with the username as a parameter
  router.replace(`/verify/${data.username}` )
  setIsSubmitting(false)

 } catch (error) {
    console.error("Error during signup ", error)
    
    const axiosError = error as AxiosError<ApiResponse>
    let errorMessage = axiosError.response?.data.message;
    toast.error('Sign up failed', {
      description: axiosError.response?.data.message || 'An error occurred during sign up'
    })
    setIsSubmitting(false)

 } 
}
 

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">Join Mystery Message</h1>
          <p className="mb-4">Sign Up and start your anonymous journey</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            
            {/* Username Field */}
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter your username" 
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        debounced(e.target.value);
                      }}
                    />
                  </FormControl>
                  {isCheckingUsername &&  <Spinner className="mt-2 h-4 w-4 animate-spin" /> }
                  <p className= {`text-[15px] ${usernameMessage === "username is available" ? 'text-green-500' : 'text-red-500'}`}>{usernameMessage}</p>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Email Field */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input 
                      type="email"
                      placeholder="Enter your email" 
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Password Field */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input 
                      type="password"
                      placeholder="Enter your password" 
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Submit Button */}
            <Button 
              type="submit" 
              disabled={isSubmitting || isCheckingUsername}
              className="w-full"
            >
              {isSubmitting ? (
                <> 
                  <Spinner className="mr-2 h-4 w-4 animate-spin" />
                  Signing up...
                </>
              ) : (
                'Sign Up'
              )}
            </Button>

          </form>
        </Form>

        <div className="text-center mt-4">
          <p>
            Already have an account?{' '}
            <Link href="/sign-in" className="text-blue-600 hover:text-blue-800">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
      
     

  )
}




// todo 
// 1. implement the form submission handler to submit the form data to the backend api route for sign up
// 2. show loading state while checking username availability
// 3. show error messages from zod validation below each input field
// 4. disable submit button if form is invalid or username is not unique or while submitting the form
// 5. redirect to dashboard page after successful sign up
// 6. show toast notifications for success and error messages