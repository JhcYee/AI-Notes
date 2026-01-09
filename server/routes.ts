import type { Express, Server } from "express";
import type { Request, Response } from "express";
import { storage } from "./storage";
import { insertDocumentSchema } from "@shared/schema";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

export async function registerRoutes(
  httpServer: Server,
  app: Express,
): Promise<Server> {
  // Get all documents
  app.get("/api/documents", async (_req: Request, res: Response) => {
    try {
      const documents = await storage.getDocuments();
      res.json(documents);
    } catch (error) {
      console.error("Error fetching documents:", error);
      res.status(500).json({ error: "Failed to fetch documents" });
    }
  });

  // Create document
  app.post("/api/documents", async (req: Request, res: Response) => {
    try {
      const validatedData = insertDocumentSchema.parse(req.body);
      const document = await storage.createDocument(validatedData);
      res.status(201).json(document);
    } catch (error) {
      console.error("Error creating document:", error);
      res.status(400).json({ error: "Invalid document data" });
    }
  });

  // Delete document
  app.delete("/api/documents/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteDocument(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting document:", error);
      res.status(500).json({ error: "Failed to delete document" });
    }
  });

  // Update document
  app.patch("/api/documents/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const document = await storage.updateDocument(id, req.body);
      if (!document) {
        return res.status(404).json({ error: "Document not found" });
      }
      res.json(document);
    } catch (error) {
      console.error("Error updating document:", error);
      res.status(500).json({ error: "Failed to update document" });
    }
  });

  // Serve document content (for PDFs and other binary files)
  app.get("/api/documents/:id/content", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const document = await storage.getDocument(id);
      if (!document) {
        return res.status(404).json({ error: "Document not found" });
      }

      // Check if content is a data URL
      if (document.content.startsWith("data:")) {
        const matches = document.content.match(/^data:([^;]+);base64,(.+)$/);
        if (matches) {
          const mimeType = matches[1];
          const base64Data = matches[2];
          const buffer = Buffer.from(base64Data, "base64");
          
          res.setHeader("Content-Type", mimeType);
          res.setHeader("Content-Disposition", `inline; filename="${document.name}"`);
          res.send(buffer);
          return;
        }
      }

      // Plain text content
      res.setHeader("Content-Type", document.type || "text/plain");
      res.send(document.content);
    } catch (error) {
      console.error("Error serving document content:", error);
      res.status(500).json({ error: "Failed to serve document" });
    }
  });

  // AI-powered message processing with streaming
  app.post("/api/process-message", async (req: Request, res: Response) => {
    try {
      const { message, documents } = req.body;

      if (!message) {
        return res.status(400).json({ error: "Message is required" });
      }

      // Build context from documents if provided
      let context = "";
      if (documents && documents.length > 0) {
        context = documents.map((doc: any) => `${doc.name}:\n${doc.content}`).join("\n\n");
      }

      const systemPrompt = `You are StudyMind AI, an intelligent study assistant that helps students with their notes. You can:
1. Complete incomplete notes by filling in missing definitions and explanations
2. Answer questions about study materials using RAG (Retrieval-Augmented Generation)
3. Generate practice exam questions

Always be accurate, clear, and helpful. When using information from notes, cite the source. If you don't have enough information, say so.`;

      const userPrompt = context
        ? `Here are the student's notes for context:\n\n${context}\n\nStudent's request: ${message}`
        : `Student's request: ${message}`;

      // Set up SSE
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");

      // Stream response from OpenAI
      const stream = await openai.chat.completions.create({
        model: "gpt-5.1",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        stream: true,
        max_completion_tokens: 4096,
      });

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || "";
        if (content) {
          res.write(`data: ${JSON.stringify({ content })}\n\n`);
        }
      }

      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      res.end();
    } catch (error) {
      console.error("Error processing message:", error);
      if (res.headersSent) {
        res.write(`data: ${JSON.stringify({ error: "Failed to process message" })}\n\n`);
        res.end();
      } else {
        res.status(500).json({ error: "Failed to process message" });
      }
    }
  });

  return httpServer;
}
