import { NextRequest, NextResponse } from "next/server";
import { createUser, generateToken } from "@/lib/services";

export async function POST(req: NextRequest) {
  try {
    const { username, email, password, displayName } = await req.json();

    if (!username || !email || !password || !displayName) {
      return NextResponse.json(
        { error: "Semua field wajib diisi" },
        { status: 400 }
      );
    }

    if (username.length < 3 || username.length > 30) {
      return NextResponse.json(
        { error: "Username harus 3-30 karakter" },
        { status: 400 }
      );
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return NextResponse.json(
        { error: "Username hanya boleh huruf, angka, dan underscore" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password minimal 6 karakter" },
        { status: 400 }
      );
    }

    const user = await createUser(username, email, password, displayName);
    const token = generateToken(user);

    const response = NextResponse.json({
      message: "Registrasi berhasil",
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
    const err = error as Error & { code?: string };
    if (err.code === "ER_DUP_ENTRY") {
      return NextResponse.json(
        { error: "Username atau email sudah terdaftar" },
        { status: 409 }
      );
    }
    console.error("Register error:", err);
    return NextResponse.json(
      { error: "Gagal registrasi" },
      { status: 500 }
    );
  }
}
