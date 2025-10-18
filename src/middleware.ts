import { NextRequest, NextResponse } from "next/server";
export {default} from "next-auth/middleware"
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
    

    const token =  await getToken({req: request })
    const url = request.nextUrl

    // If user is authenticated and tries to access auth pages, redirect to dashboard
    if (token && ( 
        url.pathname === '/sign-in' ||
        url.pathname === '/sign-up' ||
        url.pathname === '/' ||
        url.pathname === '/verify'

    )){
        return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // If user is NOT authenticated and tries to access protected routes, redirect to sign-in
    if (!token && url.pathname.startsWith('/dashboard')) {
        return NextResponse.redirect(new URL('/sign-in', request.url))
    }

    // Allow the request to proceed
    return NextResponse.next()
}

export const config = {

    matcher: ['/sign-in',
        '/sign-up',
        '/',
        '/dashboard/:path*',
        '/verify/:path*'
    ]
}