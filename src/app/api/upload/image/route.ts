import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import sharp from "sharp";

// Image constraints - very minimal to save storage costs
const MAX_INPUT_SIZE = 5 * 1024 * 1024; // 5MB max input (will be compressed)
const TARGET_DIMENSION = 80; // 80x80px output (small logo)
const TARGET_QUALITY = 70; // JPEG quality
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export async function POST(request: NextRequest) {
  try {
    // Check if Vercel Blob is configured
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return NextResponse.json(
        { error: "Image storage is not configured. Please add BLOB_READ_WRITE_TOKEN to environment variables." },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "Image file is required" },
        { status: 400 }
      );
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: `Invalid file type. Allowed types: ${ALLOWED_TYPES.join(", ")}` },
        { status: 400 }
      );
    }

    // Check input file size (before compression)
    if (file.size > MAX_INPUT_SIZE) {
      return NextResponse.json(
        { error: `File too large. Maximum upload size is ${MAX_INPUT_SIZE / 1024 / 1024}MB` },
        { status: 400 }
      );
    }

    // Read the image
    const arrayBuffer = await file.arrayBuffer();
    const inputBuffer = Buffer.from(arrayBuffer);

    // Process and compress the image using sharp
    // - Resize to 80x80px max (maintaining aspect ratio, cover mode for square logos)
    // - Convert to WebP for best compression
    // - Apply quality compression
    const processedBuffer = await sharp(inputBuffer)
      .resize(TARGET_DIMENSION, TARGET_DIMENSION, {
        fit: "cover", // Crop to fill the square
        position: "center",
      })
      .webp({
        quality: TARGET_QUALITY,
        effort: 6, // Higher compression effort
      })
      .toBuffer();

    // Get processed image info
    const metadata = await sharp(processedBuffer).metadata();

    // Generate unique filename
    const filename = `logo-${Date.now()}-${Math.random().toString(36).substring(7)}.webp`;

    // Upload to Vercel Blob
    const blob = await put(filename, processedBuffer, {
      access: "public",
      contentType: "image/webp",
    });

    return NextResponse.json({
      success: true,
      data: {
        url: blob.url,
        filename: filename,
        originalSize: file.size,
        compressedSize: processedBuffer.length,
        compressionRatio: Math.round((1 - processedBuffer.length / file.size) * 100),
        dimensions: {
          width: metadata.width,
          height: metadata.height,
        },
      },
    });
  } catch (error) {
    console.error("Image upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload image", details: String(error) },
      { status: 500 }
    );
  }
}
