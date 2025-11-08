// import { NextResponse } from "next/server";

// export async function POST() {
//   try {
//     const response = NextResponse.json(
//       { message: "Logged out successfully" }, 
//       { status: 200 }
//     );

//     response.cookies.delete("token");
//     response.cookies.set("token", "", { 
//       path: "/", 
//       expires: new Date(0),
//       maxAge: 0,
//       httpOnly: true,
//       secure: process.env.NODE_ENV === "production",
//       sameSite: "strict"
//     });

//     response.cookies.delete("__next_hmr_refresh_hash__");
    
//     console.log("🚪 Logged out successful");
//     return response;
    
//   } catch (error) {
//     console.error("🚨 Logout error:", error);
//     return NextResponse.json(
//       { error: "Logout failed" }, 
//       { status: 500 }
//     );
//   }
// }


import { NextResponse } from "next/server";

export async function POST() {
  const res = NextResponse.json({ message: "Logged out" });
  res.cookies.set("token", "", {
    httpOnly: true,
    expires: new Date(0),
    path: "/",
  });
  return res;
}
