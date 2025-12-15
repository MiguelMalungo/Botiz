import { NextRequest, NextResponse } from "next/server";

// Simple HTML to text extraction
function htmlToText(html: string): string {
  // Remove script and style tags and their content
  let text = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "");
  text = text.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "");

  // Remove HTML tags
  text = text.replace(/<[^>]+>/g, " ");

  // Decode HTML entities
  text = text.replace(/&nbsp;/g, " ");
  text = text.replace(/&amp;/g, "&");
  text = text.replace(/&lt;/g, "<");
  text = text.replace(/&gt;/g, ">");
  text = text.replace(/&quot;/g, '"');
  text = text.replace(/&#39;/g, "'");

  // Clean up whitespace
  text = text.replace(/\s+/g, " ").trim();

  // Limit content length to avoid huge prompts
  if (text.length > 15000) {
    text = text.substring(0, 15000) + "...";
  }

  return text;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url) {
      return NextResponse.json(
        { error: "URL is required" },
        { status: 400 }
      );
    }

    // Validate URL
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url);
      if (!["http:", "https:"].includes(parsedUrl.protocol)) {
        throw new Error("Invalid protocol");
      }
    } catch {
      return NextResponse.json(
        { error: "Invalid URL format" },
        { status: 400 }
      );
    }

    // Fetch the website content
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; BotizBot/1.0)",
        Accept: "text/html,application/xhtml+xml",
      },
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch website: HTTP ${response.status}` },
        { status: 400 }
      );
    }

    const html = await response.text();
    const content = htmlToText(html);

    if (!content || content.length < 50) {
      return NextResponse.json(
        { error: "Could not extract meaningful content from the website" },
        { status: 400 }
      );
    }

    // Extract title from HTML if available
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : parsedUrl.hostname;

    return NextResponse.json({
      success: true,
      data: {
        name: title,
        url: url,
        content: content,
        contentLength: content.length,
      },
    });
  } catch (error) {
    console.error("Website fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch website content", details: String(error) },
      { status: 500 }
    );
  }
}
