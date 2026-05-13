import { NextRequest, NextResponse } from "next/server";
import { authenticateUser, generateToken } from "@/lib/services";

export async function POST(req: NextRequest) {
  try {
    const { login, password } = await req.json();

    if (!login || !password) {
      return NextResponse.json(
        { error: "Username/email dan password wajib diisi" },
        { status: 400 }
      );
    }

    const user = await authenticateUser(login, password);
    if (!user) {
      return NextResponse.json(
        { error: "Username/email atau password salah" },
        { status: 401 }
      );
    }

    const token = generateToken(user);

    const response = NextResponse.json({
      message: "Login berhasil",
      user: {
        id: user.id,
        username: user.username,
        display_name: user.display_name,
      },
    });

    response.cookies.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (error: unknown) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Gagal login" },
      { status: 500 }
    );
  }
}
