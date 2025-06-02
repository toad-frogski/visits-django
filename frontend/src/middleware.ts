import { NextRequest, NextResponse, MiddlewareConfig } from "next/server";

export async function middleware(request: NextRequest) {
  const accessToken = request.cookies.get("access");
  if (!accessToken) {
    return NextResponse.redirect(new URL("/login", request.nextUrl));
  }

  try {
    const response = await fetch(new URL("/api/auth/verify", request.nextUrl), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: accessToken }),
    });

    if (response.status === 200) {
      return NextResponse.next();
    }
  } catch (e) {
    console.error("Middleware auth check failed", e);
  }

  return NextResponse.redirect(new URL("/login", request.url));
}

export const config = {
  matcher: ["/((?!api|login|_next/static|_next/image|.*\\.png$).*)"],
} satisfies MiddlewareConfig;
