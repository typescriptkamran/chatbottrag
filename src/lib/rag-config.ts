export const RAG_CONFIG = {
  // ChromaDB settings
  chroma: {
    collectionName: "documents",
    embeddingModel: "all-MiniLM-L6-v2", // Using a free model from Hugging Face
  },

  // Ollama settings
  ollama: {
    model: "llama2", // Using the free Llama 2 model
    temperature: 0.7,
    maxTokens: 500,
  },

  // Document processing settings
  document: {
    chunkSize: 1000,
    chunkOverlap: 200,
  },

  // API endpoints
  api: {
    ollama: "http://localhost:11434/api/generate",
    huggingface: "https://api-inference.huggingface.co/models/sentence-transformers/all-MiniLM-L6-v2",
  },
}; 