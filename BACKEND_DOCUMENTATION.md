# Backend Documentation - Feedback Application

## Table of Contents
1. [Overview](#overview)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Database Models](#database-models)
5. [API Routes](#api-routes)
6. [Authentication & Middleware](#authentication--middleware)
7. [Validation Schemas](#validation-schemas)
8. [Helper Functions](#helper-functions)
9. [Environment Variables](#environment-variables)
10. [Security Features](#security-features)
11. [Error Handling](#error-handling)
12. [AI Integration](#ai-integration)
13. [Setup Instructions](#setup-instructions)
14. [API Testing Examples](#api-testing-examples)
15. [Troubleshooting](#troubleshooting)
16. [Best Practices](#best-practices)
17. [Future Enhancements](#future-enhancements)

---

## Overview

This is a Next.js-based feedback application backend that allows users to register, authenticate, receive anonymous messages, and get AI-generated conversation starters. The application uses MongoDB for data persistence, NextAuth.js for authentication, and Google Gemini AI for intelligent features.

### Key Features
- User registration with email verification (OTP)
- Session-based authentication using NextAuth.js
- Anonymous message receiving system
- AI-powered conversation starter suggestions
- Email notifications using Resend
- Route protection with middleware
- Runtime validation with Zod

---

## Tech Stack

### Core Framework
- **Next.js 15.5.3**: React framework with App Router
- **TypeScript 5**: Type-safe JavaScript
- **React 19**: UI library

### Database & ORM
- **MongoDB**: NoSQL document database
- **Mongoose 8.19.1**: MongoDB object modeling

### Authentication
- **NextAuth.js 4.24.11**: Authentication for Next.js
- **bcryptjs**: Password hashing

### AI Integration
- **Google Gemini AI**: gemini-1.5-flash model
- **Vercel AI SDK**: @ai-sdk/google for AI integration

### Validation
- **Zod 4.1.12**: TypeScript-first schema validation

### Email Service
- **Resend**: Email delivery service
- **React Email**: Email template components

### Development
- **ESLint**: Code linting
- **Tailwind CSS**: Utility-first CSS framework

---

## Project Structure

```
feedback/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   └── [...nextauth]/
│   │   │   │       └── options.ts
│   │   │   ├── sign-up/
│   │   │   │   └── route.ts
│   │   │   ├── get-messages/
│   │   │   │   └── route.ts
│   │   │   └── suggest-messages/
│   │   │       └── route.ts
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   ├── helpers/
│   │   └── sendVerificationEmail.ts
│   ├── lib/
│   │   ├── dbConnect.ts
│   │   └── resend.ts
│   ├── models/
│   │   └── User.models.ts
│   ├── schemas/
│   │   ├── acceptMessageSchema.ts
│   │   ├── messageSchema.ts
│   │   ├── signInSchema.ts
│   │   ├── signUpSchema.ts
│   │   └── verifySchema.ts
│   └── types/
│       └── ApiResponse.ts
├── emails/
│   └── VerificationEmail.tsx
├── package.json
├── tsconfig.json
├── next.config.ts
└── .env.local
```

---

## Database Models

### User Model (`src/models/User.models.ts`)

```typescript
interface Message {
  content: string;        // 1-1000 characters
  createdAt: Date;
}

interface User {
  username: string;       // Unique, trimmed, required
  email: string;          // Unique, lowercase, required, validated
  password: string;       // Hashed with bcrypt (10 rounds)
  verifyCode: string;     // 6-digit OTP
  verifyCodeExpiry: Date; // OTP expiration timestamp
  isVerified: boolean;    // Email verification status
  isAcceptingMessage: boolean; // Toggle for receiving messages
  messages: Message[];    // Embedded message array
}
```

**Key Features:**
- Email validation using regex pattern
- Password hashing before save (bcrypt middleware)
- Embedded message documents
- Timestamps for messages

---

## API Routes

### 1. User Registration (`POST /api/sign-up`)

**Purpose:** Register new users with email verification

**Request Body:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Validation Rules:**
- Username: 3-20 chars, alphanumeric with underscores, no special chars
- Email: Valid email format
- Password: Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char

**Response (Success - 201):**
```json
{
  "success": true,
  "message": "User registered successfully. Please verify your email"
}
```

**Response (Error - 400/500):**
```json
{
  "success": false,
  "message": "Error description"
}
```

**Flow:**
1. Validate input using Zod schema
2. Check if username exists (verified)
3. Handle existing unverified users
4. Hash password (bcrypt, 10 rounds)
5. Generate 6-digit OTP (1 hour expiry)
6. Save user to database
7. Send verification email via Resend
8. Return success response

---

### 2. Get Messages (`GET /api/get-messages`)

**Purpose:** Retrieve all messages for authenticated user

**Authentication:** Required (NextAuth session)

**Response (Success - 200):**
```json
{
  "success": true,
  "messages": [
    {
      "content": "Great feedback!",
      "createdAt": "2025-10-28T10:30:00Z"
    },
    {
      "content": "Keep up the good work!",
      "createdAt": "2025-10-27T15:20:00Z"
    }
  ]
}
```

**Response (Error - 401/500):**
```json
{
  "success": false,
  "message": "Error description"
}
```

**MongoDB Aggregation Pipeline:**
```javascript
[
  { $match: { _id: userId } },
  { $unwind: '$messages' },
  { $sort: { 'messages.createdAt': -1 } },
  { $group: { _id: '$_id', messages: { $push: '$messages' } } }
]
```

**Flow:**
1. Check authentication session
2. Find user by ID
3. Check if user accepts messages
4. Aggregate and sort messages (newest first)
5. Return message array

---

### 3. AI Conversation Starters (`POST /api/suggest-messages`)

**Purpose:** Generate AI-powered conversation starter questions

**Authentication:** Not required (public endpoint)

**AI Model:** Google Gemini 1.5 Flash

**Response:** Streaming text response

**Configuration:**
```typescript
{
  model: 'gemini-1.5-flash',
  temperature: 0.7,
  maxTokens: 400
}
```

**Prompt:**
```
Create a list of three open-ended and engaging questions formatted as a single string. Each question should be separated by '||'. These questions are for an anonymous social messaging platform, like Qooh.me, and should be suitable for a diverse audience. Avoid personal or sensitive topics, focusing instead on universal themes that encourage friendly interaction. For example, your output should be structured like this: 'What's a hobby you've recently started?||If you could have dinner with any historical figure, who would it be?||What's a simple thing that makes you happy?'. Ensure the questions are intriguing, foster curiosity, and contribute to a positive and welcoming conversational environment.
```

**Example Response:**
```
What's your favorite way to unwind after a long day?||If you could learn any skill instantly, what would it be?||What's a book or movie that changed your perspective?
```

**Flow:**
1. Initialize Google Generative AI client
2. Stream text generation with prompt
3. Return streaming response to client
4. Handle errors gracefully

---

### 4. Authentication Routes (`/api/auth/[...nextauth]`)

**Provider:** NextAuth.js with Credentials provider

**Endpoints:**
- `POST /api/auth/signin` - Sign in
- `POST /api/auth/signout` - Sign out
- `GET /api/auth/session` - Get session

**Configuration:**
- Session strategy: JWT
- Custom pages: /sign-in
- Callbacks: jwt, session

---

## Authentication & Middleware

### Middleware (`src/middleware.ts`)

**Purpose:** Protect routes and handle authentication redirects

**Protected Routes:**
- `/sign-in`
- `/sign-up`
- `/`
- `/dashboard/:path*`
- `/verify/:path*`

**Logic:**
1. Get session token from request
2. Parse URL to extract pathname
3. **If authenticated:**
   - Redirect from `/sign-in` or `/sign-up` to `/dashboard`
   - Allow access to dashboard and verify routes
4. **If NOT authenticated:**
   - Redirect dashboard access to `/sign-in`
   - Allow access to sign-in, sign-up, home
5. **Default:** Allow request to proceed

**Key Code:**
```typescript
export { default } from "next-auth/middleware";

export const config = {
  matcher: ['/sign-in', '/sign-up', '/', '/dashboard/:path*', '/verify/:path*']
};
```

---

## Validation Schemas

### 1. Sign Up Schema (`signUpSchema.ts`)
```typescript
{
  username: z.string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must not exceed 20 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Username must not contain special characters"),
  
  email: z.string().email({ message: "Invalid email address" }),
  
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character")
}
```

### 2. Sign In Schema (`signInSchema.ts`)
```typescript
{
  identifier: z.string(), // Email or username
  password: z.string()
}
```

### 3. Verify Schema (`verifySchema.ts`)
```typescript
{
  code: z.string().length(6, "Verification code must be 6 digits")
}
```

### 4. Message Schema (`messageSchema.ts`)
```typescript
{
  content: z.string()
    .min(1, "Content must be at least 1 character")
    .max(1000, "Content must not exceed 1000 characters")
}
```

### 5. Accept Message Schema (`acceptMessageSchema.ts`)
```typescript
{
  acceptMessages: z.boolean()
}
```

---

## Helper Functions

### 1. Send Verification Email (`src/helpers/sendVerificationEmail.ts`)

**Purpose:** Send OTP verification emails using Resend

**Parameters:**
- `email: string` - Recipient email
- `username: string` - User's username
- `verifyCode: string` - 6-digit OTP

**Return Type:** `Promise<ApiResponse>`

**Email Template:** React Email component (`VerificationEmail.tsx`)

**Example Usage:**
```typescript
const response = await sendVerificationEmail(
  "user@example.com",
  "johndoe",
  "123456"
);
```

---

### 2. Database Connection (`src/lib/dbConnect.ts`)

**Purpose:** Establish and cache MongoDB connection

**Connection Caching:** Uses global variable to prevent multiple connections

**Error Handling:** Throws error if connection fails

**Usage:**
```typescript
import dbConnect from '@/lib/dbConnect';

await dbConnect();
```

---

## Environment Variables

Create a `.env.local` file in the root directory:

```env
# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname

# NextAuth
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000

# Resend Email
RESEND_API_KEY=re_xxxxxxxxxxxxx

# Google Gemini AI
GOOGLE_GENERATIVE_AI_API_KEY=AIzaSyXXXXXXXXXXXXXXXX
```

---

## Security Features

### 1. Password Security
- **Hashing:** bcrypt with 10 salt rounds
- **Strength Requirements:** Min 8 chars, uppercase, lowercase, number, special char
- **Storage:** Never stored in plain text

### 2. Email Verification
- **OTP Generation:** 6-digit random code
- **Expiration:** 1 hour validity
- **Verification Required:** Users must verify before full access

### 3. Session Management
- **Strategy:** JWT tokens
- **Secure:** HTTPOnly cookies
- **Expiration:** Configurable session timeout

### 4. Route Protection
- **Middleware:** Automatic authentication checks
- **Authorization:** Session-based access control
- **Redirects:** Automatic routing based on auth status

### 5. Input Validation
- **Runtime Validation:** Zod schemas on all inputs
- **Type Safety:** TypeScript compile-time checks
- **Sanitization:** Mongoose schema validation

---

## Error Handling

### Standard Error Response Format
```typescript
interface ApiResponse {
  success: boolean;
  message: string;
  isAcceptingMessages?: boolean;
  messages?: Array<Message>;
}
```

### HTTP Status Codes Used
- `200` - Success (GET)
- `201` - Created (POST)
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (authentication required)
- `500` - Internal Server Error

### Error Handling Pattern
```typescript
try {
  // Main logic
} catch (error) {
  console.error("Error description:", error);
  return Response.json(
    { success: false, message: "Error message" },
    { status: 500 }
  );
}
```

---

## AI Integration

### Google Gemini Configuration

**Model:** gemini-1.5-flash

**Features:**
- Streaming responses
- Temperature control (0.7 for creativity)
- Max tokens: 400
- Context-aware prompts

**Implementation:**
```typescript
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { streamText } from 'ai';

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY
});

const result = streamText({
  model: google('gemini-1.5-flash'),
  prompt: '...',
  temperature: 0.7,
  maxTokens: 400,
});

return result.toTextStreamResponse();
```

**Prompt Engineering:**
- Clear instructions for output format
- Separator specification (`||`)
- Tone and content guidelines
- Example output provided
- Safety and appropriateness constraints

---

## Setup Instructions

### 1. Clone Repository
```bash
git clone https://github.com/Ruhithpasha/feedback.git
cd feedback
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create `.env.local` and add all required variables (see Environment Variables section)

### 4. Set Up MongoDB
- Create MongoDB Atlas account
- Create cluster and database
- Get connection string
- Add to `MONGODB_URI` in `.env.local`

### 5. Set Up Resend
- Sign up at resend.com
- Verify domain
- Get API key
- Add to `RESEND_API_KEY` in `.env.local`

### 6. Set Up Google Gemini
- Go to Google AI Studio (ai.google.dev)
- Create API key
- Add to `GOOGLE_GENERATIVE_AI_API_KEY` in `.env.local`

### 7. Generate NextAuth Secret
```bash
openssl rand -base64 32
```
Add output to `NEXTAUTH_SECRET` in `.env.local`

### 8. Run Development Server
```bash
npm run dev
```

### 9. Access Application
Open [http://localhost:3000](http://localhost:3000)

---

## API Testing Examples

### 1. Register User
```bash
curl -X POST http://localhost:3000/api/sign-up \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johndoe",
    "email": "john@example.com",
    "password": "SecurePass123!"
  }'
```

### 2. Sign In
```bash
curl -X POST http://localhost:3000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "john@example.com",
    "password": "SecurePass123!"
  }'
```

### 3. Get Messages (with auth)
```bash
curl -X GET http://localhost:3000/api/get-messages \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN"
```

### 4. Get AI Suggestions
```bash
curl -X POST http://localhost:3000/api/suggest-messages \
  -H "Content-Type: application/json"
```

---

## Troubleshooting

### Common Issues

#### 1. Module Format Mismatch
**Error:** "Specified module format (CommonJs) is not matching"

**Solution:** Ensure `package.json` has:
```json
{
  "type": "module"
}
```

#### 2. MongoDB Connection Failed
**Error:** "MongooseServerSelectionError"

**Solutions:**
- Check `MONGODB_URI` is correct
- Verify IP whitelist in MongoDB Atlas
- Check network connectivity
- Ensure database user has correct permissions

#### 3. Email Not Sending
**Error:** "Failed to send verification email"

**Solutions:**
- Verify `RESEND_API_KEY` is correct
- Check domain verification in Resend
- Ensure email template is valid
- Check Resend dashboard for errors

#### 4. NextAuth Session Issues
**Error:** "No session found"

**Solutions:**
- Check `NEXTAUTH_SECRET` is set
- Verify `NEXTAUTH_URL` matches your domain
- Clear browser cookies
- Restart development server

#### 5. AI Suggestions Not Working
**Error:** "Failed to generate suggestions"

**Solutions:**
- Verify `GOOGLE_GENERATIVE_AI_API_KEY` is correct
- Check API key permissions in Google AI Studio
- Ensure billing is enabled (if required)
- Check rate limits

#### 6. Middleware Redirect Loop
**Solution:** Ensure middleware logic properly handles both authenticated and unauthenticated states with conditional redirects

---

## Best Practices

### 1. Security
- ✅ Never commit `.env.local` to version control
- ✅ Use environment variables for all secrets
- ✅ Validate all user inputs with Zod
- ✅ Hash passwords with bcrypt (never plain text)
- ✅ Implement rate limiting on API routes (future enhancement)

### 2. Database
- ✅ Use connection caching to prevent multiple connections
- ✅ Index frequently queried fields (username, email)
- ✅ Use aggregation pipelines for complex queries
- ✅ Implement proper error handling

### 3. API Design
- ✅ Use consistent response formats
- ✅ Return appropriate HTTP status codes
- ✅ Implement proper error messages
- ✅ Document all endpoints
- ✅ Version APIs for future changes

### 4. Code Quality
- ✅ Use TypeScript for type safety
- ✅ Follow ESLint rules
- ✅ Write descriptive variable names
- ✅ Add comments for complex logic
- ✅ Keep functions focused and small

### 5. Testing
- ⚠️ Add unit tests for helper functions
- ⚠️ Add integration tests for API routes
- ⚠️ Test authentication flows
- ⚠️ Test error scenarios

---

## Future Enhancements

### Planned Features
1. **Email Verification Route:** `POST /api/verify-email`
2. **Send Message Route:** `POST /api/send-message`
3. **Delete Message Route:** `DELETE /api/delete-message/:id`
4. **Toggle Accept Messages:** `PUT /api/toggle-messages`
5. **Rate Limiting:** Implement rate limiting on all API routes
6. **Webhook Support:** Handle Resend webhooks for email status
7. **Message Reporting:** Add abuse reporting system
8. **User Profiles:** Public profile pages with share links
9. **Analytics Dashboard:** Message statistics and insights
10. **Real-time Notifications:** WebSocket for live message updates

### Code Improvements
1. Remove unused imports in `sign-up/route.ts`
2. Fix password `unique: true` in User model (should be removed)
3. Remove unreachable code in `sendVerificationEmail.ts`
4. Remove unreachable `process.exit(1)` in `dbConnect.ts`
5. Add comprehensive error logging
6. Implement request/response logging middleware

### Performance Optimizations
1. Implement Redis caching for sessions
2. Add database query caching
3. Optimize aggregation pipelines
4. Implement pagination for messages
5. Add CDN for static assets

---

## Contributing

### Development Workflow
1. Create feature branch from `main`
2. Make changes following code style
3. Test thoroughly
4. Submit pull request with description
5. Wait for review and approval

### Code Style
- Follow existing patterns
- Use TypeScript types
- Add JSDoc comments for public functions
- Follow ESLint rules
- Use meaningful commit messages

---

## License

This project is private and not licensed for public use.

---

## Contact & Support

For questions or issues, contact the development team or create an issue in the repository.

---

**Last Updated:** October 28, 2025  
**Version:** 1.0.0  
**Maintainer:** Ruhith Pasha
