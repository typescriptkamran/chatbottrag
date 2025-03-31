import { NextRequest, NextResponse } from "next/server";
import * as cheerio from "cheerio";
import { PDFDocument } from "pdf-lib";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const url = formData.get("url") as string;

    let extractedText = "";

    if (file) {
      // Handle PDF file
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pages = pdfDoc.getPages();
      
      for (const page of pages) {
        const { width, height } = page.getSize();
        // Note: pdf-lib doesn't have direct text extraction
        // We'll need to implement a more sophisticated PDF text extraction
        extractedText += `[Page ${page.getPageNumber()}]\n`;
      }
    } else if (url) {
      // Handle website URL
      const response = await fetch(url);
      const html = await response.text();
      const $ = cheerio.load(html);
      
      // Remove script and style elements
      $("script").remove();
      $("style").remove();
      
      // Get text content
      extractedText = $("body").text().trim();
    } else {
      return NextResponse.json(
        { error: "No file or URL provided" },
        { status: 400 }
      );
    }

    // Clean up the extracted text
    extractedText = extractedText
      .replace(/\s+/g, " ")
      .replace(/\n+/g, "\n")
      .trim();

    return NextResponse.json({ text: extractedText });
  } catch (error) {
    console.error("Error extracting text:", error);
    return NextResponse.json(
      { error: "Failed to extract text" },
      { status: 500 }
    );
  }
} 