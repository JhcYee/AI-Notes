import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  FileText, 
  Image, 
  Send, 
  ChevronRight, 
  ChevronDown, 
  Folder, 
  FolderOpen,
  File,
  Plus,
  Sparkles,
  X,
  GripVertical,
  MessageCircle,
  Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  fetchDocuments, 
  createDocument, 
  deleteDocument,
  sendMessageStream,
  type Document
} from "@/lib/api";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  attachments?: { name: string; type: string }[];
}

function FileTreeItem({ 
  doc,
  selectedFile,
  setSelectedFile,
  onDelete
}: { 
  doc: Document;
  selectedFile: number | null;
  setSelectedFile: (id: number) => void;
  onDelete: (id: number) => void;
}) {
  const isSelected = selectedFile === doc.id;

  const getFileIcon = (type: string) => {
    if (type.includes("pdf")) return <FileText className="w-4 h-4 text-red-500" />;
    if (type.includes("image")) return <Image className="w-4 h-4 text-blue-500" />;
    return <File className="w-4 h-4 text-muted-foreground" />;
  };

  return (
    <div
      className={`flex items-center gap-2 py-1.5 px-2 rounded-md cursor-pointer text-sm transition-colors group ${
        isSelected 
          ? "bg-accent/20 text-foreground" 
          : "hover:bg-muted/50 text-muted-foreground hover:text-foreground"
      }`}
      onClick={() => setSelectedFile(doc.id)}
      data-testid={`file-${doc.id}`}
    >
      {getFileIcon(doc.type)}
      <span className="truncate flex-1">{doc.name}</span>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete(doc.id);
        }}
        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-destructive/20 rounded transition-opacity"
        data-testid={`delete-file-${doc.id}`}
      >
        <Trash2 className="w-3 h-3 text-destructive" />
      </button>
    </div>
  );
}

export default function Home() {
  const queryClient = useQueryClient();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [selectedFile, setSelectedFile] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [chatWidth, setChatWidth] = useState(380);
  const [isResizing, setIsResizing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const chatResizeRef = useRef<HTMLDivElement>(null);

  const { data: documents = [] } = useQuery({
    queryKey: ["/api/documents"],
    queryFn: fetchDocuments,
  });

  const createDocMutation = useMutation({
    mutationFn: createDocument,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
    },
  });

  const deleteDocMutation = useMutation({
    mutationFn: deleteDocument,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      if (selectedFile) setSelectedFile(null);
    },
  });

  const selectedDocument = documents.find(d => d.id === selectedFile);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      const newWidth = window.innerWidth - e.clientX;
      setChatWidth(Math.max(280, Math.min(600, newWidth)));
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing]);

  const handleSend = () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: "",
    };
    setMessages((prev) => [...prev, assistantMessage]);

    sendMessageStream(
      input,
      documents,
      (content) => {
        setMessages((prev) => {
          const updated = [...prev];
          const lastIndex = updated.length - 1;
          updated[lastIndex] = {
            ...updated[lastIndex],
            content: updated[lastIndex].content + content,
          };
          return updated;
        });
      },
      () => {
        setIsLoading(false);
      },
      (error) => {
        setMessages((prev) => {
          const updated = [...prev];
          const lastIndex = updated.length - 1;
          updated[lastIndex] = {
            ...updated[lastIndex],
            content: `Error: ${error}`,
          };
          return updated;
        });
        setIsLoading(false);
      }
    );
  };

  const handleFileSelect = (type: "pdf" | "image") => {
    if (type === "pdf") {
      fileInputRef.current?.click();
    } else {
      imageInputRef.current?.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, type: string) => {
    const files = e.target.files;
    if (!files) return;

    for (const file of Array.from(files)) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const content = event.target?.result as string;
        await createDocMutation.mutateAsync({
          name: file.name,
          type: type === "pdf" ? "application/pdf" : file.type,
          content: content,
          parentId: null,
        });
      };
      
      if (type === "image" || file.type.startsWith("image/")) {
        reader.readAsDataURL(file);
      } else {
        reader.readAsText(file);
      }
    }
    e.target.value = "";
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="h-screen flex bg-background">
      <aside className="w-64 border-r bg-card/50 flex flex-col flex-shrink-0">
        <div className="p-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-serif font-bold">StudyMind</span>
          </div>
        </div>
        
        <div className="p-3 border-b">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Your Files</p>
        </div>
        
        <ScrollArea className="flex-1 p-2">
          {documents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No files yet</p>
              <p className="text-xs">Upload PDFs or images to get started</p>
            </div>
          ) : (
            documents.map((doc) => (
              <FileTreeItem
                key={doc.id}
                doc={doc}
                selectedFile={selectedFile}
                setSelectedFile={setSelectedFile}
                onDelete={(id) => deleteDocMutation.mutate(id)}
              />
            ))
          )}
        </ScrollArea>

        <div className="p-3 border-t space-y-2">
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept=".pdf,.txt,.md"
            multiple
            onChange={(e) => handleFileChange(e, "pdf")}
          />
          <input
            type="file"
            ref={imageInputRef}
            className="hidden"
            accept="image/*"
            multiple
            onChange={(e) => handleFileChange(e, "image")}
          />
          <Button 
            variant="outline" 
            className="w-full gap-2 text-sm" 
            size="sm"
            onClick={() => handleFileSelect("pdf")}
            data-testid="button-upload-pdf"
          >
            <FileText className="w-4 h-4" />
            Upload PDF/Text
          </Button>
          <Button 
            variant="outline" 
            className="w-full gap-2 text-sm" 
            size="sm"
            onClick={() => handleFileSelect("image")}
            data-testid="button-upload-image"
          >
            <Image className="w-4 h-4" />
            Upload Image
          </Button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        {selectedDocument ? (
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="border-b p-4 flex items-center justify-between bg-card/30">
              <div className="flex items-center gap-3">
                {selectedDocument.type.includes("image") ? (
                  <Image className="w-5 h-5 text-blue-500" />
                ) : (
                  <FileText className="w-5 h-5 text-red-500" />
                )}
                <h2 className="font-medium">{selectedDocument.name}</h2>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedFile(null)}
                data-testid="button-close-viewer"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <ScrollArea className="flex-1 p-6">
              {selectedDocument.type.includes("image") || selectedDocument.content.startsWith("data:image") ? (
                <div className="flex items-center justify-center h-full">
                  <img 
                    src={selectedDocument.content} 
                    alt={selectedDocument.name}
                    className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
                    data-testid="image-viewer"
                  />
                </div>
              ) : (
                <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed bg-muted/30 p-4 rounded-lg" data-testid="text-viewer">
                  {selectedDocument.content}
                </pre>
              )}
            </ScrollArea>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center mb-6">
              <FileText className="w-10 h-10 text-primary/40" />
            </div>
            <h2 className="text-xl font-bold mb-2">Select a file to view</h2>
            <p className="text-muted-foreground max-w-md">
              Upload PDFs, text files, or images using the sidebar, then click on a file to view its contents here.
            </p>
          </div>
        )}
      </main>

      <div
        ref={chatResizeRef}
        className="w-1 cursor-col-resize bg-border hover:bg-accent/50 transition-colors flex items-center justify-center"
        onMouseDown={() => setIsResizing(true)}
      >
        <GripVertical className="w-3 h-3 text-muted-foreground" />
      </div>

      <aside 
        className="border-l bg-card/30 flex flex-col flex-shrink-0"
        style={{ width: `${chatWidth}px` }}
      >
        <div className="p-3 border-b flex items-center gap-2">
          <MessageCircle className="w-4 h-4 text-primary" />
          <span className="font-medium text-sm">AI Assistant</span>
        </div>

        <ScrollArea className="flex-1 p-3">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-8">
              <Sparkles className="w-8 h-8 text-primary/40 mb-3" />
              <p className="text-sm font-medium">Ask me anything</p>
              <p className="text-xs text-muted-foreground mt-1">
                I can help complete notes, answer questions, or generate practice exams
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-2 ${message.role === "user" ? "justify-end" : ""}`}
                  data-testid={`message-${message.role}-${message.id}`}
                >
                  {message.role === "assistant" && (
                    <div className="w-6 h-6 rounded-md bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-3 h-3 text-white" />
                    </div>
                  )}
                  <div
                    className={`max-w-[85%] rounded-xl px-3 py-2 text-sm ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground rounded-br-sm"
                        : "bg-muted/50 rounded-tl-sm"
                    }`}
                  >
                    <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                  </div>
                </div>
              ))}
              {isLoading && messages[messages.length - 1]?.content === "" && (
                <div className="flex gap-2">
                  <div className="w-6 h-6 rounded-md bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-3 h-3 text-white" />
                  </div>
                  <div className="bg-muted/50 rounded-xl rounded-tl-sm px-3 py-2">
                    <div className="flex gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: "0ms" }} />
                      <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: "150ms" }} />
                      <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </ScrollArea>

        <div className="p-3 border-t">
          <div className="relative">
            <Textarea
              ref={textareaRef}
              placeholder="Ask about your notes..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="min-h-[40px] max-h-[120px] pr-10 resize-none rounded-lg text-sm"
              rows={1}
              data-testid="input-message"
            />
            <Button 
              size="icon" 
              className="absolute right-1 bottom-1 h-7 w-7"
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              data-testid="button-send"
            >
              <Send className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </aside>
    </div>
  );
}
