import { useState } from "react";
import { Link } from "wouter";
import { Brain, GraduationCap, Sparkles, ArrowLeft, ChevronDown, ChevronUp, Check, X, FileDown, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";

interface Question {
  id: number;
  type: "multiple_choice" | "short_answer" | "conceptual";
  difficulty: "easy" | "medium" | "hard";
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
  userAnswer?: string;
}

const sampleExam: Question[] = [
  {
    id: 1,
    type: "multiple_choice",
    difficulty: "easy",
    question: "Where do the light-dependent reactions of photosynthesis occur?",
    options: ["Stroma", "Thylakoid membranes", "Mitochondria", "Cell wall"],
    correctAnswer: "Thylakoid membranes",
    explanation: "The light-dependent reactions occur in the thylakoid membranes of the chloroplast, where chlorophyll and other photosynthetic pigments are located to capture light energy.",
  },
  {
    id: 2,
    type: "multiple_choice",
    difficulty: "medium",
    question: "What are the products of the light-dependent reactions that are used in the Calvin Cycle?",
    options: ["Glucose and O₂", "ATP and NADPH", "CO₂ and H₂O", "RuBP and G3P"],
    correctAnswer: "ATP and NADPH",
    explanation: "The light reactions produce ATP (adenosine triphosphate) and NADPH (an electron carrier), which provide the energy and reducing power needed for the Calvin Cycle to fix CO₂ into glucose.",
  },
  {
    id: 3,
    type: "short_answer",
    difficulty: "medium",
    question: "Explain the role of the enzyme RuBisCO in the Calvin Cycle.",
    correctAnswer: "RuBisCO catalyzes carbon fixation by attaching CO₂ to RuBP",
    explanation: "RuBisCO (Ribulose-1,5-bisphosphate carboxylase/oxygenase) is the enzyme that catalyzes the first step of carbon fixation in the Calvin Cycle. It attaches CO₂ to a 5-carbon molecule called RuBP, creating an unstable 6-carbon compound that immediately splits into two 3-carbon molecules (3-PGA).",
  },
  {
    id: 4,
    type: "conceptual",
    difficulty: "hard",
    question: "If a plant is moved from normal lighting conditions to a room with only green light, what would happen to its rate of photosynthesis? Explain your reasoning based on how chlorophyll absorbs light.",
    correctAnswer: "Photosynthesis would significantly decrease because chlorophyll reflects green light rather than absorbing it",
    explanation: "Chlorophyll appears green because it reflects green wavelengths of light while absorbing primarily red and blue light. In a room with only green light, very little light energy would be absorbed by the chlorophyll, drastically reducing the light reactions and overall photosynthesis rate. The plant would essentially be in darkness from a photosynthetic perspective.",
  },
  {
    id: 5,
    type: "multiple_choice",
    difficulty: "easy",
    question: "What is the primary function of the Calvin Cycle?",
    options: [
      "To split water molecules",
      "To produce oxygen",
      "To convert CO₂ into glucose",
      "To capture light energy"
    ],
    correctAnswer: "To convert CO₂ into glucose",
    explanation: "The Calvin Cycle (light-independent reactions) uses the ATP and NADPH produced by the light reactions to fix CO₂ and produce glucose. This is why it's also called the 'carbon fixation' pathway.",
  },
];

export default function Exam() {
  const [exam, setExam] = useState<Question[] | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showAnswers, setShowAnswers] = useState(false);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [expandedExplanations, setExpandedExplanations] = useState<number[]>([]);
  const [questionCount, setQuestionCount] = useState([5]);
  const [difficulty, setDifficulty] = useState("mixed");

  const handleGenerate = () => {
    setIsGenerating(true);
    setShowAnswers(false);
    setAnswers({});
    setExpandedExplanations([]);
    
    setTimeout(() => {
      setExam(sampleExam);
      setIsGenerating(false);
    }, 2000);
  };

  const handleAnswer = (questionId: number, answer: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  const toggleExplanation = (questionId: number) => {
    setExpandedExplanations((prev) =>
      prev.includes(questionId)
        ? prev.filter((id) => id !== questionId)
        : [...prev, questionId]
    );
  };

  const getScore = () => {
    if (!exam) return { correct: 0, total: 0 };
    let correct = 0;
    exam.forEach((q) => {
      if (q.type === "multiple_choice" && answers[q.id] === q.correctAnswer) {
        correct++;
      }
    });
    return { correct, total: exam.filter((q) => q.type === "multiple_choice").length };
  };

  const score = getScore();

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case "easy": return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
      case "medium": return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
      case "hard": return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      default: return "";
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "multiple_choice": return "Multiple Choice";
      case "short_answer": return "Short Answer";
      case "conceptual": return "Conceptual";
      default: return type;
    }
  };

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
              <span className="text-sm font-medium text-foreground cursor-pointer" data-testid="nav-exam">Exams</span>
            </Link>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="mb-8 animate-in">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2 mb-4" data-testid="button-back">
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Button>
          </Link>
          <h1 className="text-3xl lg:text-4xl font-bold mb-2">Practice Exam Generator</h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Generate custom practice exams based on your notes with multiple question types and difficulty levels.
          </p>
        </div>

        {!exam ? (
          <Card className="max-w-2xl mx-auto animate-in-delay-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5" />
                Configure Your Exam
              </CardTitle>
              <CardDescription>
                Customize the number of questions, difficulty, and question types
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label>Number of Questions: {questionCount[0]}</Label>
                <Slider
                  value={questionCount}
                  onValueChange={setQuestionCount}
                  min={3}
                  max={15}
                  step={1}
                  className="w-full"
                  data-testid="slider-question-count"
                />
              </div>

              <div className="space-y-3">
                <Label>Difficulty Level</Label>
                <Select value={difficulty} onValueChange={setDifficulty}>
                  <SelectTrigger data-testid="select-difficulty">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                    <SelectItem value="mixed">Mixed (Recommended)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label>Question Types Included</Label>
                <div className="flex gap-2 flex-wrap">
                  <Badge variant="secondary">Multiple Choice</Badge>
                  <Badge variant="secondary">Short Answer</Badge>
                  <Badge variant="secondary">Conceptual</Badge>
                </div>
              </div>

              <Separator />

              <Button
                className="w-full gap-2"
                size="lg"
                onClick={handleGenerate}
                disabled={isGenerating}
                data-testid="button-generate-exam"
              >
                {isGenerating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Generating Exam...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Generate Practice Exam
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between animate-in">
              <div className="flex items-center gap-4">
                <h2 className="text-xl font-bold">Practice Midterm</h2>
                <Badge variant="outline">{exam.length} Questions</Badge>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => setShowAnswers(!showAnswers)}
                  data-testid="button-toggle-answers"
                >
                  {showAnswers ? "Hide Answers" : "Show Answers"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => {
                    setExam(null);
                    setAnswers({});
                  }}
                  data-testid="button-new-exam"
                >
                  <RotateCcw className="w-4 h-4" />
                  New Exam
                </Button>
                <Button variant="outline" size="sm" className="gap-2" data-testid="button-download">
                  <FileDown className="w-4 h-4" />
                  Download PDF
                </Button>
              </div>
            </div>

            {showAnswers && (
              <Card className="bg-accent/10 border-accent/30 animate-in">
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Your Score (Multiple Choice)</p>
                      <p className="text-sm text-muted-foreground">Short answer and conceptual questions require manual grading</p>
                    </div>
                    <div className="text-3xl font-bold text-gradient">
                      {score.correct}/{score.total}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="space-y-4">
              {exam.map((question, index) => (
                <Card key={question.id} className="animate-in-delay-1" data-testid={`question-${question.id}`}>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline">{getTypeLabel(question.type)}</Badge>
                          <Badge className={getDifficultyColor(question.difficulty)}>
                            {question.difficulty}
                          </Badge>
                        </div>
                        <CardTitle className="text-lg font-medium leading-snug">
                          {index + 1}. {question.question}
                        </CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {question.type === "multiple_choice" && question.options && (
                      <RadioGroup
                        value={answers[question.id] || ""}
                        onValueChange={(value) => handleAnswer(question.id, value)}
                        className="space-y-2"
                      >
                        {question.options.map((option, i) => {
                          const isCorrect = showAnswers && option === question.correctAnswer;
                          const isWrong = showAnswers && answers[question.id] === option && option !== question.correctAnswer;
                          
                          return (
                            <div
                              key={i}
                              className={`flex items-center space-x-3 p-3 rounded-lg border transition-colors ${
                                isCorrect
                                  ? "bg-emerald-50 border-emerald-300 dark:bg-emerald-900/20 dark:border-emerald-700"
                                  : isWrong
                                  ? "bg-red-50 border-red-300 dark:bg-red-900/20 dark:border-red-700"
                                  : "hover:bg-muted/50"
                              }`}
                            >
                              <RadioGroupItem
                                value={option}
                                id={`q${question.id}-${i}`}
                                disabled={showAnswers}
                                data-testid={`option-${question.id}-${i}`}
                              />
                              <Label
                                htmlFor={`q${question.id}-${i}`}
                                className="flex-1 cursor-pointer"
                              >
                                {option}
                              </Label>
                              {isCorrect && <Check className="w-4 h-4 text-emerald-600" />}
                              {isWrong && <X className="w-4 h-4 text-red-600" />}
                            </div>
                          );
                        })}
                      </RadioGroup>
                    )}

                    {(question.type === "short_answer" || question.type === "conceptual") && (
                      <Textarea
                        placeholder="Type your answer here..."
                        value={answers[question.id] || ""}
                        onChange={(e) => handleAnswer(question.id, e.target.value)}
                        className="min-h-[100px]"
                        disabled={showAnswers}
                        data-testid={`answer-${question.id}`}
                      />
                    )}

                    {showAnswers && (
                      <Collapsible
                        open={expandedExplanations.includes(question.id)}
                        onOpenChange={() => toggleExplanation(question.id)}
                      >
                        <CollapsibleTrigger asChild>
                          <Button variant="ghost" size="sm" className="gap-2 w-full justify-start" data-testid={`toggle-explanation-${question.id}`}>
                            {expandedExplanations.includes(question.id) ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                            {question.type !== "multiple_choice" && "Suggested Answer & "}Explanation
                          </Button>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="mt-2">
                          <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                            {question.type !== "multiple_choice" && (
                              <div>
                                <p className="text-sm font-medium text-accent">Suggested Answer:</p>
                                <p className="text-sm">{question.correctAnswer}</p>
                              </div>
                            )}
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">Explanation:</p>
                              <p className="text-sm">{question.explanation}</p>
                            </div>
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
