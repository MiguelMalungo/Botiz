import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "PDF file is required" },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.includes("pdf") && !file.name.toLowerCase().endsWith(".pdf")) {
      return NextResponse.json(
        { error: "File must be a PDF" },
        { status: 400 }
      );
    }

    // Max 10MB
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "PDF file must be less than 10MB" },
        { status: 400 }
      );
    }

    // Read file content
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Extract text from PDF using a simple approach
    // We'll look for text streams in the PDF
    let text = "";

    try {
      // Convert buffer to string and extract readable text
      const pdfString = buffer.toString("latin1");

      // Look for text between stream and endstream markers
      const streamRegex = /stream\r?\n([\s\S]*?)\r?\nendstream/g;
      let match;

      while ((match = streamRegex.exec(pdfString)) !== null) {
        const streamContent = match[1];
        // Try to extract readable ASCII text
        const readableText = streamContent.replace(/[^\x20-\x7E\r\n]/g, " ");
        if (readableText.trim().length > 10) {
          text += readableText + " ";
        }
      }

      // Also try to extract text objects (Tj and TJ operators)
      const textObjRegex = /\(([^)]+)\)\s*Tj/g;
      while ((match = textObjRegex.exec(pdfString)) !== null) {
        text += match[1] + " ";
      }

      // Clean up the text
      text = text.replace(/\s+/g, " ").trim();

      // If we couldn't extract much text, try a different approach
      if (text.length < 100) {
        // Look for any readable strings in the PDF
        const strings: string[] = [];
        let currentString = "";

        for (let i = 0; i < buffer.length; i++) {
          const byte = buffer[i];
          if (byte >= 32 && byte <= 126) {
            currentString += String.fromCharCode(byte);
          } else if (currentString.length > 10) {
            // Only keep strings longer than 10 chars
            strings.push(currentString);
            currentString = "";
          } else {
            currentString = "";
          }
        }

        if (currentString.length > 10) {
          strings.push(currentString);
        }

        // Filter out common PDF keywords and join
        const filteredStrings = strings.filter(
          (s) =>
            !s.match(/^(obj|endobj|stream|endstream|xref|trailer|startxref|\d+\s+\d+\s+R|\/\w+)$/i) &&
            s.length > 10 &&
            !/^[\d\s.]+$/.test(s) // Not just numbers
        );

        text = filteredStrings.join(" ");
      }
    } catch (parseError) {
      console.error("PDF parsing error:", parseError);
    }

    // Limit content length
    if (text.length > 30000) {
      text = text.substring(0, 30000) + "...";
    }

    if (!text || text.length < 20) {
      return NextResponse.json(
        {
          error: "Could not extract text from PDF. The PDF might be scanned/image-based or encrypted.",
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        name: file.name.replace(/\.pdf$/i, ""),
        content: text,
        contentLength: text.length,
      },
    });
  } catch (error) {
    console.error("PDF upload error:", error);
    return NextResponse.json(
      { error: "Failed to process PDF", details: String(error) },
      { status: 500 }
    );
  }
}
