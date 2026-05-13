import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { v4 as uuidv4 } from "uuid";
import { addTestNotification } from "@/lib/testQueue";

/**
 * POST /api/overlay/test
 * Inserts a fake test donation so the overlay picks it up on next poll.
 * Requires authentication (dashboard session).
 */
export async function POST() {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const id = `TEST-${uuidv4()}`;
    const orderId = `TEST-ORDER-${Date.now()}`;
    const testNames = [
      "Test",
    ];
    const testMessages = [
      // "Ini contoh pesan notifikasi untuk testing",
      // 10 kata
      // "Belajar dengan tekun adalah kunci utama untuk meraih masa depan",
      // 15 kata
      // "Hembusan angin malam yang sejuk membawa aroma melati yang mekar di halaman depan rumah kakek",
      // 20 kata
      // "Matahari terbenam di ufuk barat menyebarkan warna jingga yang sangat indah ke seluruh penjuru langit yang mulai menggelap dengan perlahan"
      // 30 kata
      "Petualangan besar seringkali dimulai dari sebuah langkah kecil yang penuh keberanian untuk menghadapi segala tantangan dan rintangan yang mungkin muncul di tengah perjalanan panjang menuju puncak kesuksesan yang sangat dinantikan",
    ];

    const randomName = testNames[Math.floor(Math.random() * testNames.length)];
    const randomMessage = testMessages[Math.floor(Math.random() * testMessages.length)];
    const amounts = [2727, 272727, 272727272];
    const randomAmount = amounts[Math.floor(Math.random() * amounts.length)];

    // Push to in-memory queue instead of database!
    addTestNotification(user.id, {
      id,
      donor_name: randomName,
      amount: randomAmount,
      message: randomMessage,
      paid_at: new Date().toISOString(),
      isTest: true,
    });

    return NextResponse.json({
      message: "Test notification sent!",
      donation: {
        id,
        donor_name: randomName,
        amount: randomAmount,
        message: randomMessage,
      },
    });
  } catch (error: unknown) {
    console.error("Test overlay error:", error);
    return NextResponse.json({ error: "Gagal mengirim test" }, { status: 500 });
  }
}
