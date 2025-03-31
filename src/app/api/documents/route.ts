import { NextResponse } from "next/server";
import { processDocument } from "@/lib/rag-utils";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Read the file content
    const text = await file.text();

    // Process the document and store it in the vector database
    await processDocument(text);

    return NextResponse.json({ message: "Document processed successfully" });
  } catch (error) {
    console.error("Error processing document:", error);
    return NextResponse.json(
      { error: "Failed to process document" },
      { status: 500 }
    );
  }
} 