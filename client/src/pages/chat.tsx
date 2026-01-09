import { useState, useRef, useEffect } from "react";
import { Link } from "wouter";
import { Brain, Send, User, Bot, FileText, Quote, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  citations?: { section: string; text: string }[];
  lowConfidence?: boolean;
}

const sampleMessages: Message[] = [
  {
    id: "1",
    role: "user",
    content: "What is the Calvin Cycle and where does it occur?",
  },
  {
    id: "2",
    role: "assistant",
    content: "The Calvin Cycle (also called the Light-Independent Reactions) is the second stage of photosynthesis where CO₂ is converted into glucose.\n\n**Location:** It occurs in the stroma, which is the fluid-filled space inside the chloroplast.\n\n**Key Steps:**\n1. **Carbon Fixation** - CO₂ is attached to a 5-carbon molecule called RuBP by the enzyme RuBisCO\n2. **Reduction** - ATP and NADPH (produced in light reactions) convert the molecules to G3P\n3. **Regeneration** - Some G3P is used to regenerate RuBP to continue the cycle\n\nThe cycle produces glucose and other organic compounds that the plant uses for energy and growth.",
    citations: [
      { section: "Calvin Cycle", text: "Happens in the stroma...CO₂ gets fixed somehow...produces glucose" },
      { section: "Light Reactions", text: "Makes ATP and NADPH" },
    ],
  },
];

const suggestedQuestions = [
  "What's the difference between light and dark reactions?",
  "How does chlorophyll absorb light?",
  "What role does water play in photosynthesis?",
  "Explain the electron transport chain",
];

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>(sampleMessages);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasNotes, setHasNotes] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

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

    setTimeout(() => {
      const isLowConfidence = input.toLowerCase().includes("mitochondria");
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: isLowConfidence
          ? "I don't have enough information in your notes to answer this question confidently. Your notes focus on photosynthesis, which occurs in chloroplasts. Mitochondria are separate organelles responsible for cellular respiration. Would you like to add notes about cellular respiration to get better answers on this topic?"
          : "Based on your notes, photosynthesis is the process by which plants convert light energy into chemical energy (glucose). It occurs in the chloroplasts and involves two main stages:\n\n1. **Light Reactions** - Occur in the thylakoid membranes, split water, and produce ATP and NADPH\n2. **Calvin Cycle** - Occurs in the stroma, fixes CO₂, and produces glucose\n\nThe overall equation is: 6CO₂ + 6H₂O + light energy → C₆H₁₂O₆ + 6O₂",
        citations: isLowConfidence
          ? undefined
          : [
              { section: "Overview", text: "Plants make food from sunlight...happens in chloroplasts" },
              { section: "Light Reactions", text: "Occurs in thylakoid...makes ATP and NADPH" },
            ],
        lowConfidence: isLowConfidence,
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1500);
  };

  const handleSuggestion = (question: string) => {
    setInput(question);
  };

  return (
    <div className="min-h-screen noise flex flex-col">
      <header className="border-b bg-card/50 glass sticky top-0 z-50">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer" data-testid="link-home">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <span className="font-serif font-bold text-xl">StudyMind</span>
            </div>
          </Link>
          <nav className="flex items-center gap-6">
            <Link href="/notes">
              <span className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer" data-testid="nav-notes">Notes</span>
            </Link>
            <Link href="/chat">
              <span className="text-sm font-medium text-foreground cursor-pointer" data-testid="nav-chat">Chat</span>
            </Link>
            <Link href="/exam">
              <span className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer" data-testid="nav-exam">Exams</span>
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-6 py-6 flex gap-6 max-h-[calc(100vh-4rem)]">
        <div className="flex-1 flex flex-col animate-in">
          <Card className="flex-1 flex flex-col overflow-hidden">
            <CardHeader className="border-b flex-shrink-0">
              <CardTitle className="text-xl">Ask About Your Notes</CardTitle>
              <CardDescription>
                Get answers grounded in your study materials with source citations
              </CardDescription>
            </CardHeader>
            <ScrollArea className="flex-1 p-4" ref={scrollRef}>
              <div className="space-y-6">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${message.role === "user" ? "justify-end" : ""}`}
                    data-testid={`message-${message.role}-${message.id}`}
                  >
                    {message.role === "assistant" && (
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] ${
                        message.role === "user"
                          ? "bg-primary text-primary-foreground rounded-2xl rounded-br-md px-4 py-3"
                          : "space-y-3"
                      }`}
                    >
                      {message.lowConfidence && (
                        <div className="flex items-center gap-2 text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-3 py-2 rounded-lg text-sm mb-2">
                          <AlertCircle className="w-4 h-4 flex-shrink-0" />
                          <span>Low confidence - outside your notes</span>
                        </div>
                      )}
                      <div className={message.role === "assistant" ? "bg-muted/50 rounded-2xl rounded-tl-md px-4 py-3" : ""}>
                        <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</p>
                      </div>
                      {message.citations && message.citations.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                            <Quote className="w-3 h-3" />
                            Sources from your notes:
                          </p>
                          {message.citations.map((citation, i) => (
                            <div
                              key={i}
                              className="text-xs bg-accent/10 border border-accent/20 rounded-lg px-3 py-2"
                            >
                              <span className="font-medium text-accent">{citation.section}:</span>{" "}
                              <span className="text-muted-foreground italic">"{citation.text}"</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    {message.role === "user" && (
                      <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                        <User className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                ))}
                {isLoading && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div className="bg-muted/50 rounded-2xl rounded-tl-md px-4 py-3">
                      <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
            <div className="border-t p-4 flex-shrink-0">
              <div className="flex gap-2 mb-3 flex-wrap">
                {suggestedQuestions.map((q, i) => (
                  <Badge
                    key={i}
                    variant="secondary"
                    className="cursor-pointer hover:bg-accent/20 transition-colors"
                    onClick={() => handleSuggestion(q)}
                    data-testid={`suggestion-${i}`}
                  >
                    {q}
                  </Badge>
                ))}
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex gap-2"
              >
                <Input
                  placeholder="Ask a question about your notes..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={isLoading}
                  className="flex-1"
                  data-testid="input-chat"
                />
                <Button type="submit" disabled={!input.trim() || isLoading} data-testid="button-send">
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </div>
          </Card>
        </div>

        <aside className="w-80 flex-shrink-0 hidden lg:block animate-in-delay-1">
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Your Notes
              </CardTitle>
              <CardDescription>Currently loaded materials</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {hasNotes ? (
                <>
                  <div className="p-3 rounded-lg bg-muted/50 border" data-testid="note-item-1">
                    <p className="font-medium text-sm">Photosynthesis Notes</p>
                    <p className="text-xs text-muted-foreground mt-1">4 sections • ~500 words</p>
                  </div>
                  <Link href="/notes">
                    <Button variant="outline" className="w-full" size="sm" data-testid="button-add-notes">
                      Add More Notes
                    </Button>
                  </Link>
                </>
              ) : (
                <div className="text-center py-6">
                  <FileText className="w-10 h-10 text-muted-foreground/50 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground mb-3">No notes loaded yet</p>
                  <Link href="/notes">
                    <Button size="sm" data-testid="button-upload-notes">Upload Notes</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </aside>
      </main>
    </div>
  );
}
