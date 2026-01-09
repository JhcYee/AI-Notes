import { db } from "./db";
import { type User, type InsertUser, documents, type Document, type InsertDocument } from "@shared/schema";
import { eq } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getDocuments(): Promise<Document[]>;
  getDocument(id: number): Promise<Document | undefined>;
  createDocument(document: InsertDocument): Promise<Document>;
  updateDocument(id: number, document: Partial<InsertDocument>): Promise<Document | undefined>;
  deleteDocument(id: number): Promise<void>;
}

export const storage: IStorage = {
  async getUser(_id: string): Promise<User | undefined> {
    return undefined;
  },

  async getUserByUsername(_username: string): Promise<User | undefined> {
    return undefined;
  },

  async createUser(_insertUser: InsertUser): Promise<User> {
    throw new Error("Not implemented");
  },

  async getDocuments() {
    return db.select().from(documents);
  },

  async getDocument(id: number) {
    const [document] = await db.select().from(documents).where(eq(documents.id, id));
    return document;
  },

  async createDocument(document: InsertDocument) {
    const [newDocument] = await db.insert(documents).values(document).returning();
    return newDocument;
  },

  async updateDocument(id: number, document: Partial<InsertDocument>) {
    const [updated] = await db
      .update(documents)
      .set(document)
      .where(eq(documents.id, id))
      .returning();
    return updated;
  },

  async deleteDocument(id: number) {
    await db.delete(documents).where(eq(documents.id, id));
  },
};
