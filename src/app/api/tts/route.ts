import { NextRequest, NextResponse } from "next/server";

// Valid language codes for Google Translate TTS
const VALID_VOICES = new Set([
  "id", "en", "es", "fr", "de", "it", "pt", "ru", "ja", "ko", "zh-CN", "zh-TW",
  "ms", "jv", "su", // Malay, Javanese, Sundanese (available in dashboard)
  "male-id", "male-en", "male-es", "male-fr", "male-de", "male-pt"
]);

// Retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY = 500; // ms
const FETCH_TIMEOUT = 10000; // 10 seconds

async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeoutMs = FETCH_TIMEOUT
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeoutId);
  }
}

async function fetchTTSWithRetry(
  url: string,
  voice: string
): Promise<Response> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const response = await fetchWithTimeout(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
        referrerPolicy: "no-referrer",
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      // Validate response is actually audio
      const contentType = response.headers.get("content-type") || "";
      if (!contentType.includes("audio") && !contentType.includes("application/octet-stream")) {
        throw new Error(`Invalid content-type: ${contentType}`);
      }

      const arrayBuffer = await response.arrayBuffer();

      // Validate response has content
      if (arrayBuffer.byteLength === 0) {
        throw new Error("Empty audio response");
      }

      return new NextResponse(arrayBuffer, {
        headers: {
          "Content-Type": "audio/mpeg",
          "Cache-Control": "public, max-age=86400",
          "Content-Length": arrayBuffer.byteLength.toString(),
        },
      });
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Don't retry on certain errors
      if (lastError.message.includes("Empty audio") || lastError.message.includes("Invalid content-type")) {
        throw lastError;
      }

      if (attempt < MAX_RETRIES - 1) {
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * (attempt + 1)));
      }
    }
  }

  throw lastError || new Error("Failed to fetch TTS after retries");
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const text = searchParams.get("text")?.trim();
  const voice = (searchParams.get("voice") || "id").toLowerCase();

  // Validate inputs
  if (!text || text.length === 0) {
    return new NextResponse(JSON.stringify({ error: "Text is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!VALID_VOICES.has(voice)) {
    return new NextResponse(JSON.stringify({ error: "Invalid voice" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    // Strip "male-" prefix for Google API (it only supports language codes)
    const googleVoice = voice.replace(/^male-/, "");
    const safeText = text.substring(0, 500); // Increased limit

    const url = `https://translate.googleapis.com/translate_tts?client=gtx&ie=UTF-8&tl=${googleVoice}&q=${encodeURIComponent(safeText)}`;

    return await fetchTTSWithRetry(url, voice);
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Unknown error";
    console.error("TTS Proxy Error:", errorMsg);

    return new NextResponse(
      JSON.stringify({ error: "Failed to generate speech" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
