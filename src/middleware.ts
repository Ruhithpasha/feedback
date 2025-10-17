import { NextRequest, NextResponse } from "next/server";
import path from "path";
// import type { NextRequest } from "next/server";
export {default} from "next-auth/middleware"
import { getToken } from "next-auth/jwt";
import { request } from "https";

export async function middleware(request: NextRequest) {
    

    const token =  await getToken({req: request })
    const url = request.nextUrl

    if (token && ( 
        url.pathname == '/sign-in' ||
        url.pathname == '/signup' ||
        url.pathname == '/' ||
        url.pathname == '/verify'

    )){
        return NextResponse.redirect(new URL('/dashboard ', request.url))
    }

    return NextResponse.redirect(new URL('/home', request.url))
}

export const config = {

    matcher: ['/sign-in',
        '/sign-up',
        '/',
        '/dashboard/:path*',
        '/verify/:path*'
    ]
}