export interface Document {
  id: number;
  name: string;
  type: string;
  content: string;
  parentId: number | null;
  createdAt: string;
}

export async function fetchDocuments(): Promise<Document[]> {
  const response = await fetch("/api/documents");
  if (!response.ok) throw new Error("Failed to fetch documents");
  return response.json();
}

export async function createDocument(document: Omit<Document, "id" | "createdAt">): Promise<Document> {
  const response = await fetch("/api/documents", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(document),
  });
  if (!response.ok) throw new Error("Failed to create document");
  return response.json();
}

export async function deleteDocument(id: number): Promise<void> {
  const response = await fetch(`/api/documents/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("Failed to delete document");
}

export async function sendMessageStream(
  message: string,
  documents: Document[],
  onChunk: (content: string) => void,
  onDone: () => void,
  onError: (error: string) => void
): Promise<void> {
  try {
    const response = await fetch("/api/process-message", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, documents }),
    });

    if (!response.ok) {
      throw new Error("Failed to send message");
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) {
      throw new Error("No response body");
    }

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split("\n");

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const data = JSON.parse(line.slice(6));
          if (data.content) {
            onChunk(data.content);
          } else if (data.done) {
            onDone();
          } else if (data.error) {
            onError(data.error);
          }
        }
      }
    }
  } catch (error) {
    onError(error instanceof Error ? error.message : "Failed to send message");
  }
}
