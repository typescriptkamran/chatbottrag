import { NextResponse } from "next/server";
import { queryVectorStore, generateResponse, initializeVectorStore } from "@/lib/rag-utils";

// Initialize vector store on first request
let isInitialized = false;

export async function POST(request: Request) {
  try {
    // Initialize vector store if not already done
    if (!isInitialized) {
      try {
        await initializeVectorStore();
        isInitialized = true;
        console.log("Vector store initialized successfully");
      } catch (initError) {
        console.error("Failed to initialize vector store:", initError);
        return NextResponse.json(
          { error: "Failed to initialize the chat system" },
          { status: 500 }
        );
      }
    }

    const { message } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // Query the vector store for relevant context
    const relevantContexts = await queryVectorStore(message);
    
    // Generate response using the context
    const response = await generateResponse(message, relevantContexts[0]?.text || '');

    return NextResponse.json({ response });
  } catch (error) {
    console.error("Chat error:", error);
    return NextResponse.json(
      { error: "Failed to process message. Please try again." },
      { status: 500 }
    );
  }
} 