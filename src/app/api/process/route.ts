import { NextRequest, NextResponse } from "next/server";
import { processDocument } from "@/lib/rag-utils";

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();

    if (!text) {
      return NextResponse.json(
        { error: "No text provided" },
        { status: 400 }
      );
    }

    // Process the text with RAG
    await processDocument(text);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error processing text:", error);
    return NextResponse.json(
      { error: "Failed to process text" },
      { status: 500 }
    );
  }
} 