import { useState, useRef } from "react";
import { 
  FileText, 
  Image, 
  Paperclip, 
  Send, 
  ChevronRight, 
  ChevronDown, 
  Folder, 
  FolderOpen,
  File,
  Plus,
  MoreHorizontal,
  Sparkles,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface FileNode {
  id: string;
  name: string;
  type: "folder" | "file";
  fileType?: "pdf" | "image" | "text";
  children?: FileNode[];
}

const initialFiles: FileNode[] = [
  {
    id: "1",
    name: "Biology 101",
    type: "folder",
    children: [
      { id: "1-1", name: "Photosynthesis Notes.pdf", type: "file", fileType: "pdf" },
      { id: "1-2", name: "Cell Structure.pdf", type: "file", fileType: "pdf" },
      { id: "1-3", name: "Diagram.png", type: "file", fileType: "image" },
    ],
  },
  {
    id: "2",
    name: "Chemistry",
    type: "folder",
    children: [
      { id: "2-1", name: "Organic Chemistry.pdf", type: "file", fileType: "pdf" },
      { id: "2-2", name: "Periodic Table.png", type: "file", fileType: "image" },
    ],
  },
  {
    id: "3",
    name: "Math 201",
    type: "folder",
    children: [
      { id: "3-1", name: "Calculus Notes.txt", type: "file", fileType: "text" },
    ],
  },
];

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  attachments?: { name: string; type: string }[];
}

function FileTreeItem({ 
  node, 
  depth = 0,
  expandedFolders,
  toggleFolder,
  selectedFile,
  setSelectedFile
}: { 
  node: FileNode; 
  depth?: number;
  expandedFolders: string[];
  toggleFolder: (id: string) => void;
  selectedFile: string | null;
  setSelectedFile: (id: string) => void;
}) {
  const isExpanded = expandedFolders.includes(node.id);
  const isSelected = selectedFile === node.id;

  const getFileIcon = (fileType?: string) => {
    switch (fileType) {
      case "pdf":
        return <FileText className="w-4 h-4 text-red-500" />;
      case "image":
        return <Image className="w-4 h-4 text-blue-500" />;
      default:
        return <File className="w-4 h-4 text-muted-foreground" />;
    }
  };

  return (
    <div>
      <div
        className={`flex items-center gap-1 py-1.5 px-2 rounded-md cursor-pointer text-sm transition-colors ${
          isSelected 
            ? "bg-accent/20 text-foreground" 
            : "hover:bg-muted/50 text-muted-foreground hover:text-foreground"
        }`}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
        onClick={() => {
          if (node.type === "folder") {
            toggleFolder(node.id);
          } else {
            setSelectedFile(node.id);
          }
        }}
        data-testid={`file-${node.id}`}
      >
        {node.type === "folder" ? (
          <>
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 flex-shrink-0" />
            ) : (
              <ChevronRight className="w-4 h-4 flex-shrink-0" />
            )}
            {isExpanded ? (
              <FolderOpen className="w-4 h-4 text-amber-500 flex-shrink-0" />
            ) : (
              <Folder className="w-4 h-4 text-amber-500 flex-shrink-0" />
            )}
          </>
        ) : (
          <>
            <span className="w-4" />
            {getFileIcon(node.fileType)}
          </>
        )}
        <span className="truncate ml-1">{node.name}</span>
      </div>
      {node.type === "folder" && isExpanded && node.children && (
        <div>
          {node.children.map((child) => (
            <FileTreeItem
              key={child.id}
              node={child}
              depth={depth + 1}
              expandedFolders={expandedFolders}
              toggleFolder={toggleFolder}
              selectedFile={selectedFile}
              setSelectedFile={setSelectedFile}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [attachments, setAttachments] = useState<{ name: string; type: string }[]>([]);
  const [expandedFolders, setExpandedFolders] = useState<string[]>(["1"]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const toggleFolder = (id: string) => {
    setExpandedFolders((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  };

  const handleSend = () => {
    if (!input.trim() && attachments.length === 0) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      attachments: attachments.length > 0 ? [...attachments] : undefined,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setAttachments([]);
    setIsLoading(true);

    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I've received your notes. I can help you complete missing information, answer questions about the content, or generate practice exam questions. What would you like me to do?",
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1500);
  };

  const handleFileSelect = (type: "pdf" | "image") => {
    if (type === "pdf") {
      fileInputRef.current?.click();
    } else {
      imageInputRef.current?.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: string) => {
    const files = e.target.files;
    if (files) {
      const newAttachments = Array.from(files).map((file) => ({
        name: file.name,
        type,
      }));
      setAttachments((prev) => [...prev, ...newAttachments]);
    }
    e.target.value = "";
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="h-screen flex bg-background">
      <aside className="w-64 border-r bg-card/50 flex flex-col">
        <div className="p-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-serif font-bold">StudyMind</span>
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8" data-testid="button-new-folder">
                <Plus className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>New folder</TooltipContent>
          </Tooltip>
        </div>
        
        <div className="p-3 border-b">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Your Files</p>
        </div>
        
        <ScrollArea className="flex-1 p-2">
          {initialFiles.map((file) => (
            <FileTreeItem
              key={file.id}
              node={file}
              expandedFolders={expandedFolders}
              toggleFolder={toggleFolder}
              selectedFile={selectedFile}
              setSelectedFile={setSelectedFile}
            />
          ))}
        </ScrollArea>

        <div className="p-3 border-t">
          <Button variant="outline" className="w-full gap-2 text-sm" size="sm" data-testid="button-upload-files">
            <Plus className="w-4 h-4" />
            Upload Files
          </Button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col">
        <ScrollArea className="flex-1 p-6">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-xl mx-auto">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-6">
                <Sparkles className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-2xl font-bold mb-3">What can I help you study?</h1>
              <p className="text-muted-foreground mb-8">
                Upload your notes, PDFs, or images and I'll help complete missing information, answer questions, or generate practice exams.
              </p>
              <div className="grid grid-cols-2 gap-3 w-full max-w-md">
                <div 
                  className="p-4 rounded-xl border bg-card hover:bg-muted/50 cursor-pointer transition-colors text-left"
                  onClick={() => handleFileSelect("pdf")}
                  data-testid="quick-action-pdf"
                >
                  <FileText className="w-5 h-5 text-red-500 mb-2" />
                  <p className="font-medium text-sm">Upload PDF</p>
                  <p className="text-xs text-muted-foreground">Lecture notes, textbooks</p>
                </div>
                <div 
                  className="p-4 rounded-xl border bg-card hover:bg-muted/50 cursor-pointer transition-colors text-left"
                  onClick={() => handleFileSelect("image")}
                  data-testid="quick-action-image"
                >
                  <Image className="w-5 h-5 text-blue-500 mb-2" />
                  <p className="font-medium text-sm">Upload Image</p>
                  <p className="text-xs text-muted-foreground">Diagrams, handwritten notes</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto space-y-6">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-4 ${message.role === "user" ? "justify-end" : ""}`}
                  data-testid={`message-${message.role}-${message.id}`}
                >
                  {message.role === "assistant" && (
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <div className={`max-w-[80%] ${message.role === "user" ? "order-1" : ""}`}>
                    {message.attachments && message.attachments.length > 0 && (
                      <div className="flex gap-2 mb-2 flex-wrap justify-end">
                        {message.attachments.map((att, i) => (
                          <div key={i} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted text-sm">
                            {att.type === "pdf" ? (
                              <FileText className="w-4 h-4 text-red-500" />
                            ) : (
                              <Image className="w-4 h-4 text-blue-500" />
                            )}
                            <span className="truncate max-w-[150px]">{att.name}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    <div
                      className={`rounded-2xl px-4 py-3 ${
                        message.role === "user"
                          ? "bg-primary text-primary-foreground rounded-br-md"
                          : "bg-muted/50 rounded-tl-md"
                      }`}
                    >
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                    </div>
                  </div>
                  {message.role === "user" && (
                    <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0 order-2">
                      <span className="text-sm font-medium">You</span>
                    </div>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-muted/50 rounded-2xl rounded-tl-md px-4 py-3">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: "0ms" }} />
                      <div className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: "150ms" }} />
                      <div className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </ScrollArea>

        <div className="p-4 border-t bg-card/50">
          <div className="max-w-3xl mx-auto">
            {attachments.length > 0 && (
              <div className="flex gap-2 mb-3 flex-wrap">
                {attachments.map((att, i) => (
                  <div key={i} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted text-sm group">
                    {att.type === "pdf" ? (
                      <FileText className="w-4 h-4 text-red-500" />
                    ) : (
                      <Image className="w-4 h-4 text-blue-500" />
                    )}
                    <span className="truncate max-w-[150px]">{att.name}</span>
                    <button
                      onClick={() => removeAttachment(i)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      data-testid={`remove-attachment-${i}`}
                    >
                      <X className="w-3 h-3 text-muted-foreground hover:text-foreground" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            <div className="relative">
              <Textarea
                ref={textareaRef}
                placeholder="Ask about your notes, request completions, or generate practice questions..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="min-h-[52px] max-h-[200px] pr-24 resize-none rounded-xl border-2 focus:border-primary/50"
                rows={1}
                data-testid="input-message"
              />
              <div className="absolute right-2 bottom-2 flex items-center gap-1">
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept=".pdf"
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
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={() => handleFileSelect("pdf")}
                      data-testid="button-attach-pdf"
                    >
                      <FileText className="w-4 h-4 text-muted-foreground" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Attach PDF</TooltipContent>
                </Tooltip>
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={() => handleFileSelect("image")}
                      data-testid="button-attach-image"
                    >
                      <Image className="w-4 h-4 text-muted-foreground" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Attach Image</TooltipContent>
                </Tooltip>
                
                <Button 
                  size="icon" 
                  className="h-8 w-8"
                  onClick={handleSend}
                  disabled={(!input.trim() && attachments.length === 0) || isLoading}
                  data-testid="button-send"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            <p className="text-xs text-muted-foreground text-center mt-3">
              StudyMind uses your notes to provide accurate, grounded answers
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
