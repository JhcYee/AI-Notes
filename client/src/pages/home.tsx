import { Link } from "wouter";
import { FileText, MessageCircleQuestion, GraduationCap, Sparkles, BookOpen, Brain, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
  {
    icon: FileText,
    title: "Note Completion",
    description: "Upload your incomplete notes and let AI fill in missing definitions, clarify concepts, and expand on vague points while preserving your structure.",
    href: "/notes",
    color: "from-blue-500 to-indigo-600",
  },
  {
    icon: MessageCircleQuestion,
    title: "Ask Questions",
    description: "Chat with your notes using RAG-powered AI. Get accurate answers with citations directly from your study materials.",
    href: "/chat",
    color: "from-amber-500 to-orange-600",
  },
  {
    icon: GraduationCap,
    title: "Practice Exams",
    description: "Generate custom midterm exams with multiple choice, short answer, and conceptual questions—complete with answer keys.",
    href: "/exam",
    color: "from-emerald-500 to-teal-600",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen noise">
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
              <span className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer" data-testid="nav-chat">Chat</span>
            </Link>
            <Link href="/exam">
              <span className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer" data-testid="nav-exam">Exams</span>
            </Link>
          </nav>
        </div>
      </header>

      <main>
        <section className="py-24 lg:py-32">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto text-center animate-in">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-8">
                <Sparkles className="w-4 h-4 text-accent" />
                <span className="text-sm font-medium text-accent">AI-Powered Study Assistant</span>
              </div>
              <h1 className="text-5xl lg:text-7xl font-bold tracking-tight mb-6 leading-[1.1]">
                Transform Your Notes Into
                <span className="block text-gradient">Knowledge</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
                Stop spending hours filling gaps in your notes. Let AI complete your notes, answer your questions, and generate practice exams—all grounded in your own study materials.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/notes">
                  <Button size="lg" className="gap-2 px-8" data-testid="button-get-started">
                    <BookOpen className="w-5 h-5" />
                    Get Started
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <Link href="/chat">
                  <Button size="lg" variant="outline" className="gap-2 px-8" data-testid="button-try-chat">
                    <MessageCircleQuestion className="w-5 h-5" />
                    Try Chat
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16 animate-in-delay-1">
              <h2 className="text-3xl lg:text-4xl font-bold mb-4">Three Powerful Tools</h2>
              <p className="text-lg text-muted-foreground max-w-xl mx-auto">
                Everything you need to study smarter, not harder.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {features.map((feature, index) => (
                <Link key={feature.title} href={feature.href}>
                  <Card 
                    className={`h-full cursor-pointer hover-lift border-2 border-transparent hover:border-accent/30 transition-all duration-300 animate-in-delay-${index + 1}`}
                    data-testid={`card-feature-${feature.title.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    <CardHeader>
                      <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 shadow-lg`}>
                        <feature.icon className="w-7 h-7 text-white" />
                      </div>
                      <CardTitle className="text-xl">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-base leading-relaxed">
                        {feature.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="py-24">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto">
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div className="animate-in-delay-2">
                  <h2 className="text-3xl lg:text-4xl font-bold mb-6">
                    Grounded in <span className="text-gradient">Your Materials</span>
                  </h2>
                  <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                    Unlike generic AI chatbots, StudyMind uses Retrieval-Augmented Generation (RAG) to ensure every answer is grounded in your actual notes. You get accurate, relevant responses with citations to source sections.
                  </p>
                  <ul className="space-y-4">
                    {[
                      "Fills missing definitions and explanations",
                      "Preserves your original note structure",
                      "Labels AI-extended content clearly",
                      "Admits when it doesn't know something",
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Sparkles className="w-3.5 h-3.5 text-accent" />
                        </div>
                        <span className="text-muted-foreground">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="relative animate-in-delay-3">
                  <div className="aspect-square rounded-2xl bg-gradient-to-br from-primary/10 via-accent/10 to-primary/5 border-2 border-dashed border-primary/20 flex items-center justify-center">
                    <div className="text-center p-8">
                      <Brain className="w-20 h-20 text-primary/40 mx-auto mb-4" />
                      <p className="text-muted-foreground font-medium">Your Knowledge Hub</p>
                    </div>
                  </div>
                  <div className="absolute -top-4 -right-4 w-24 h-24 rounded-xl bg-accent/20 blur-2xl" />
                  <div className="absolute -bottom-4 -left-4 w-32 h-32 rounded-xl bg-primary/20 blur-2xl" />
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-12 bg-card/50">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-primary" />
              <span className="font-serif font-bold">StudyMind AI</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Helping students study smarter, one note at a time.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
