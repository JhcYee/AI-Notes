import { useState, useRef, useEffect, DragEvent } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  FileText, 
  Image, 
  Send, 
  ChevronRight, 
  ChevronDown, 
  ChevronLeft,
  Folder, 
  FolderOpen,
  FolderPlus,
  File,
  Plus,
  Sparkles,
  X,
  GripVertical,
  MessageCircle,
  Trash2,
  PanelLeftClose,
  PanelLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { 
  fetchDocuments, 
  createDocument, 
  deleteDocument,
  updateDocument,
  sendMessageStream,
  type Document
} from "@/lib/api";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface FileTreeProps {
  documents: Document[];
  parentId: number | null;
  depth?: number;
  selectedFile: number | null;
  setSelectedFile: (id: number | null) => void;
  onDelete: (id: number) => void;
  onDrop: (draggedId: number, targetFolderId: number | null) => void;
  expandedFolders: number[];
  toggleFolder: (id: number) => void;
  draggedId: number | null;
  setDraggedId: (id: number | null) => void;
  dragOverId: number | null;
  setDragOverId: (id: number | null) => void;
}

function FileTree({
  documents,
  parentId,
  depth = 0,
  selectedFile,
  setSelectedFile,
  onDelete,
  onDrop,
  expandedFolders,
  toggleFolder,
  draggedId,
  setDraggedId,
  dragOverId,
  setDragOverId,
}: FileTreeProps) {
  const items = documents.filter(d => d.parentId === parentId);

  const folders = items.filter(d => d.type === "folder");
  const files = items.filter(d => d.type !== "folder");

  return (
    <div>
      {folders.map((folder) => {
        const isExpanded = expandedFolders.includes(folder.id);
        const isSelected = selectedFile === folder.id;
        const isDragOver = dragOverId === folder.id;
        const hasChildren = documents.some(d => d.parentId === folder.id);

        return (
          <div key={folder.id}>
            <div
              className={`flex items-center gap-1 py-1.5 px-2 rounded-md cursor-pointer text-sm transition-colors group ${
                isSelected 
                  ? "bg-accent/20 text-foreground" 
                  : isDragOver
                  ? "bg-accent/30 border border-accent"
                  : "hover:bg-muted/50 text-muted-foreground hover:text-foreground"
              }`}
              style={{ paddingLeft: `${depth * 12 + 8}px` }}
              onClick={() => toggleFolder(folder.id)}
              onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (draggedId !== folder.id) {
                  setDragOverId(folder.id);
                }
              }}
              onDragLeave={() => setDragOverId(null)}
              onDrop={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setDragOverId(null);
                if (draggedId && draggedId !== folder.id) {
                  onDrop(draggedId, folder.id);
                }
              }}
              data-testid={`folder-${folder.id}`}
            >
              {hasChildren ? (
                isExpanded ? (
                  <ChevronDown className="w-4 h-4 flex-shrink-0" />
                ) : (
                  <ChevronRight className="w-4 h-4 flex-shrink-0" />
                )
              ) : (
                <span className="w-4" />
              )}
              {isExpanded ? (
                <FolderOpen className="w-4 h-4 text-amber-500 flex-shrink-0" />
              ) : (
                <Folder className="w-4 h-4 text-amber-500 flex-shrink-0" />
              )}
              <span className="truncate flex-1 ml-1">{folder.name}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(folder.id);
                }}
                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-destructive/20 rounded transition-opacity"
                data-testid={`delete-folder-${folder.id}`}
              >
                <Trash2 className="w-3 h-3 text-destructive" />
              </button>
            </div>
            {isExpanded && (
              <FileTree
                documents={documents}
                parentId={folder.id}
                depth={depth + 1}
                selectedFile={selectedFile}
                setSelectedFile={setSelectedFile}
                onDelete={onDelete}
                onDrop={onDrop}
                expandedFolders={expandedFolders}
                toggleFolder={toggleFolder}
                draggedId={draggedId}
                setDraggedId={setDraggedId}
                dragOverId={dragOverId}
                setDragOverId={setDragOverId}
              />
            )}
          </div>
        );
      })}
      {files.map((doc) => {
        const isSelected = selectedFile === doc.id;
        const isDragging = draggedId === doc.id;

        const getFileIcon = (type: string) => {
          if (type.includes("pdf") || type.includes("text")) return <FileText className="w-4 h-4 text-red-500" />;
          if (type.includes("image")) return <Image className="w-4 h-4 text-blue-500" />;
          return <File className="w-4 h-4 text-muted-foreground" />;
        };

        return (
          <div
            key={doc.id}
            className={`flex items-center gap-2 py-1.5 px-2 rounded-md cursor-pointer text-sm transition-all group ${
              isSelected 
                ? "bg-accent/20 text-foreground" 
                : "hover:bg-muted/50 text-muted-foreground hover:text-foreground"
            } ${isDragging ? "opacity-50" : ""}`}
            style={{ paddingLeft: `${depth * 12 + 24}px` }}
            onClick={() => setSelectedFile(doc.id)}
            draggable
            onDragStart={(e) => {
              e.stopPropagation();
              setDraggedId(doc.id);
            }}
            onDragEnd={() => {
              setDraggedId(null);
              setDragOverId(null);
            }}
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
      })}
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
  const [expandedFolders, setExpandedFolders] = useState<number[]>([]);
  const [draggedId, setDraggedId] = useState<number | null>(null);
  const [dragOverId, setDragOverId] = useState<number | null>(null);
  const [showFolderDialog, setShowFolderDialog] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  const pdfBlobUrlRef = useRef<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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

  const updateDocMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Document> }) => updateDocument(id, data),
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

  const toggleFolder = (id: number) => {
    setExpandedFolders((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  };

  const handleDrop = (draggedId: number, targetFolderId: number | null) => {
    updateDocMutation.mutate({ id: draggedId, data: { parentId: targetFolderId } });
    if (targetFolderId && !expandedFolders.includes(targetFolderId)) {
      setExpandedFolders((prev) => [...prev, targetFolderId]);
    }
  };

  const handleCreateFolder = () => {
    if (!newFolderName.trim()) return;
    createDocMutation.mutate({
      name: newFolderName,
      type: "folder",
      content: "",
      parentId: null,
    });
    setNewFolderName("");
    setShowFolderDialog(false);
  };

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

  // Convert PDF data URL to blob URL for iframe display
  useEffect(() => {
    // Clean up previous blob URL if it exists
    if (pdfBlobUrlRef.current) {
      URL.revokeObjectURL(pdfBlobUrlRef.current);
      pdfBlobUrlRef.current = null;
      setPdfBlobUrl(null);
    }

    if (!selectedDocument) {
      return;
    }

    const isPdf = selectedDocument.type.includes("pdf") || selectedDocument.content.startsWith("data:application/pdf");
    
    if (isPdf && selectedDocument.content.startsWith("data:")) {
      // Convert data URL to blob
      try {
        // Extract base64 data
        const base64Data = selectedDocument.content.split(",")[1];
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: "application/pdf" });
        const blobUrl = URL.createObjectURL(blob);
        pdfBlobUrlRef.current = blobUrl;
        setPdfBlobUrl(blobUrl);
      } catch (error) {
        console.error("Error creating blob URL for PDF:", error);
        pdfBlobUrlRef.current = null;
        setPdfBlobUrl(null);
      }
    }

    // Cleanup function - revoke blob URL when component unmounts or document changes
    return () => {
      if (pdfBlobUrlRef.current) {
        URL.revokeObjectURL(pdfBlobUrlRef.current);
        pdfBlobUrlRef.current = null;
      }
    };
  }, [selectedDocument?.id, selectedDocument?.content]);

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
      documents.filter(d => d.type !== "folder"),
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
        
        // Determine file type more accurately
        let detectedType = file.type;
        if (!detectedType) {
          if (file.name.endsWith(".pdf")) {
            detectedType = "application/pdf";
          } else if (file.name.endsWith(".txt") || file.name.endsWith(".md")) {
            detectedType = "text/plain";
          } else if (type === "pdf" || file.name.endsWith(".pdf")) {
            detectedType = "application/pdf";
          } else {
            detectedType = "text/plain";
          }
        }
        
        await createDocMutation.mutateAsync({
          name: file.name,
          type: detectedType,
          content: content,
          parentId: null,
        });
      };
      
      const isTextFile = file.type.startsWith("text/") || 
        file.name.endsWith(".txt") || 
        file.name.endsWith(".md");
      
      if (isTextFile) {
        reader.readAsText(file);
      } else {
        reader.readAsDataURL(file);
      }
    }
    e.target.value = "";
  };

  const handleRootDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragOverId(null);
    if (draggedId) {
      handleDrop(draggedId, null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="h-screen flex bg-background">
      <aside className={`border-r bg-card/50 flex flex-col flex-shrink-0 transition-all duration-300 ${sidebarCollapsed ? "w-14" : "w-64"}`}>
        <div className="p-3 border-b flex items-center justify-between">
          {!sidebarCollapsed && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="font-serif font-bold">StudyMind</span>
            </div>
          )}
          <div className={`flex items-center gap-1 ${sidebarCollapsed ? "w-full justify-center" : ""}`}>
            {!sidebarCollapsed && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8"
                    onClick={() => setShowFolderDialog(true)}
                    data-testid="button-new-folder"
                  >
                    <FolderPlus className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Create folder</TooltipContent>
              </Tooltip>
            )}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8"
                  onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                  data-testid="button-toggle-sidebar"
                >
                  {sidebarCollapsed ? <PanelLeft className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">{sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}</TooltipContent>
            </Tooltip>
          </div>
        </div>
        
        {!sidebarCollapsed && (
          <>
            <div className="p-3 border-b">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Your Files</p>
              <p className="text-xs text-muted-foreground mt-1">Drag files to organize</p>
            </div>
            
            <ScrollArea 
              className="flex-1 p-2"
              onDragOver={(e) => {
                e.preventDefault();
                if (draggedId) setDragOverId(-1);
              }}
              onDragLeave={() => setDragOverId(null)}
              onDrop={handleRootDrop}
            >
              {documents.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No files yet</p>
                  <p className="text-xs">Upload PDFs or images to get started</p>
                </div>
              ) : (
                <FileTree
                  documents={documents}
                  parentId={null}
                  selectedFile={selectedFile}
                  setSelectedFile={setSelectedFile}
                  onDelete={(id) => deleteDocMutation.mutate(id)}
                  onDrop={handleDrop}
                  expandedFolders={expandedFolders}
                  toggleFolder={toggleFolder}
                  draggedId={draggedId}
                  setDraggedId={setDraggedId}
                  dragOverId={dragOverId}
                  setDragOverId={setDragOverId}
                />
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
          </>
        )}
        
        {sidebarCollapsed && (
          <div className="flex-1 flex flex-col items-center py-4 gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-10 w-10"
                  onClick={() => setShowFolderDialog(true)}
                  data-testid="button-new-folder-collapsed"
                >
                  <FolderPlus className="w-5 h-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Create folder</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-10 w-10"
                  onClick={() => handleFileSelect("pdf")}
                  data-testid="button-upload-pdf-collapsed"
                >
                  <FileText className="w-5 h-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Upload PDF/Text</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-10 w-10"
                  onClick={() => handleFileSelect("image")}
                  data-testid="button-upload-image-collapsed"
                >
                  <Image className="w-5 h-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Upload Image</TooltipContent>
            </Tooltip>
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
          </div>
        )}
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        {selectedDocument && selectedDocument.type !== "folder" ? (
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="border-b p-4 flex items-center justify-between bg-card/30">
              <div className="flex items-center gap-3">
                {selectedDocument.type.includes("image") ? (
                  <Image className="w-5 h-5 text-blue-500" />
                ) : selectedDocument.type.includes("pdf") ? (
                  <FileText className="w-5 h-5 text-red-500" />
                ) : (
                  <FileText className="w-5 h-5 text-muted-foreground" />
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
            {selectedDocument.type.includes("pdf") || selectedDocument.content.startsWith("data:application/pdf") ? (
              pdfBlobUrl ? (
                <iframe
                  src={pdfBlobUrl}
                  className="flex-1 w-full border-0"
                  title={selectedDocument.name}
                  data-testid="pdf-viewer"
                />
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <p>Loading PDF...</p>
                  </div>
                </div>
              )
            ) : (
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
            )}
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

      <Dialog open={showFolderDialog} onOpenChange={setShowFolderDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Folder</DialogTitle>
          </DialogHeader>
          <Input
            placeholder="Folder name"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleCreateFolder();
            }}
            data-testid="input-folder-name"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFolderDialog(false)}>Cancel</Button>
            <Button onClick={handleCreateFolder} data-testid="button-create-folder">Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
