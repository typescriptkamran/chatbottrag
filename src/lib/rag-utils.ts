import { carRentalData, companyInfo } from "@/data/car-rental-qa";
import { queryVectorStore, addDocument, initializeVectorStore } from "./vector-store";

export { queryVectorStore, addDocument, initializeVectorStore };

export const RAG_CONFIG = {
  chunkSize: 500,
  chunkOverlap: 50,
  maxTokens: 1000,
  temperature: 0.7,
  topP: 0.9,
  topK: 50,
};

// Generate a deterministic mock embedding
function generateMockEmbedding(text: string): number[] {
  const embedding: number[] = [];
  for (let i = 0; i < 384; i++) {
    const charCode = text.charCodeAt(i % text.length);
    const value = (charCode % 100) / 100; // Normalize to [0, 1]
    embedding.push(value);
  }
  return embedding;
}

export async function generateEmbeddings(text: string): Promise<number[]> {
  return generateMockEmbedding(text);
}

export async function generateResponse(
  query: string,
  context: string
): Promise<string> {
  // Handle greetings
  const greetingPatterns = ["hi", "hello", "hey", "good morning", "good afternoon", "good evening"];
  const isGreeting = greetingPatterns.some(pattern => 
    query.toLowerCase().trim().startsWith(pattern)
  );

  if (isGreeting) {
    return "Hello! I'm your car rental assistant. How can I help you today?";
  }

  try {
    // Query the vector store for relevant context
    const relevantContexts = await queryVectorStore(query);
    
    // Clean up the query for better matching
    const cleanQuery = query.toLowerCase().trim();
    
    // If we have a high-confidence match from Q&A data
    if (relevantContexts.length > 0 && relevantContexts[0].type === 'qa' && relevantContexts[0].score > 0.8) {
      return relevantContexts[0].text;
    }

    // If we have a company info match
    if (relevantContexts.length > 0 && relevantContexts[0].type === 'company_info') {
      return relevantContexts[0].text;
    }

    // If we have document matches
    if (relevantContexts.length > 0 && relevantContexts[0].type === 'document') {
      // Clean up the text response
      const text = relevantContexts[0].text
        .replace(/[0-9]{6,}/g, '') // Remove long number sequences
        .replace(/^\s+|\s+$/g, '') // Trim whitespace
        .replace(/\s+/g, ' ') // Normalize spaces
        .replace(/[^\x20-\x7E]/g, '') // Remove non-printable characters
        .replace(/[^\w\s.,!?-]/g, ''); // Keep only basic punctuation and alphanumeric
      
      if (text.length > 0) {
        return text;
      }
    }

    // If no relevant matches found, provide a more helpful response
    const queryLower = query.toLowerCase();
    
    // Check for specific topics in the query
    if (queryLower.includes("price") || queryLower.includes("cost") || queryLower.includes("rate")) {
      return "Our rental rates vary depending on the vehicle type and rental duration. Economy cars start from $30/day, mid-size sedans from $45/day, and SUVs from $60/day. For specific pricing, please contact us at 1-800-RENT-CAR.";
    }
    
    if (queryLower.includes("location") || queryLower.includes("where")) {
      return "We have multiple locations across the country. Our main office is at 123 Rental Street, Car City, ST 12345. We also offer airport pickup and drop-off services at most major airports.";
    }
    
    if (queryLower.includes("insurance") || queryLower.includes("coverage")) {
      return "We offer several insurance options including Collision Damage Waiver (CDW), Personal Accident Insurance (PAI), and Supplemental Liability Insurance (SLI). Our staff can explain the details of each option.";
    }

    // Default response for unknown queries
    return "I apologize, but I couldn't find specific information about your query. Could you please rephrase your question or contact our support team at 1-800-RENT-CAR for assistance?";
  } catch (error) {
    console.error('Error generating response:', error);
    return "I apologize, but I'm having trouble processing your request. Please try again or contact our support team at 1-800-RENT-CAR.";
  }
}

export async function processDocument(text: string): Promise<void> {
  try {
    const chunks = splitIntoChunks(text);
    for (const chunk of chunks) {
      await addDocument(chunk, {
        type: 'document',
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error("Error processing document:", error);
    throw error;
  }
}

function splitIntoChunks(text: string): string[] {
  const chunks: string[] = [];
  const words = text.split(" ");
  let currentChunk: string[] = [];
  let currentSize = 0;

  for (const word of words) {
    if (currentSize + word.length > RAG_CONFIG.chunkSize) {
      chunks.push(currentChunk.join(" "));
      currentChunk = [];
      currentSize = 0;
    }
    currentChunk.push(word);
    currentSize += word.length;
  }

  if (currentChunk.length > 0) {
    chunks.push(currentChunk.join(" "));
  }

  return chunks;
} 