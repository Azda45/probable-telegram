import { NextResponse, NextRequest } from "next/server";
import { getAuthUser } from "@/be/auth";
import pool from "@/be/db";
import { v4 as uuidv4 } from "uuid";
import { getDonationStats } from "@/be/services";

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const [rows] = await pool.execute(
      "SELECT id, amount, status, bank_name, bank_account, created_at FROM withdrawals WHERE user_id = ? ORDER BY created_at DESC",
      [user.id]
    );

    return NextResponse.json({ withdrawals: rows });
  } catch (error: any) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    if (!user.bank_name || !user.bank_account) {
      return NextResponse.json({ error: "Anda harus mengatur Nama Bank dan Nomor Rekening di Settings terlebih dahulu." }, { status: 400 });
    }

    const stats = await getDonationStats(user.id);
    const balance = stats.balance;

    if (balance <= 0) {
      return NextResponse.json({ error: "Saldo tidak mencukupi untuk ditarik." }, { status: 400 });
    }

    // Buat withdrawal
    const id = uuidv4();
    await pool.execute(
      "INSERT INTO withdrawals (id, user_id, amount, bank_name, bank_account) VALUES (?, ?, ?, ?, ?)",
      [id, user.id, balance, user.bank_name, user.bank_account]
    );

    return NextResponse.json({ success: true, id });
  } catch (error: any) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
