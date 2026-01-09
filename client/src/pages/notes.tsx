import { useState } from "react";
import { Link } from "wouter";
import { Brain, Upload, FileText, Sparkles, ArrowLeft, Copy, Check, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const sampleNotes = `# Photosynthesis

## Overview
- plants make food from sunlight
- happens in chloroplasts

## Light Reactions
- occurs in thylakoid
- water gets split
- makes ATP and NADPH (need to look up what these are)

## Calvin Cycle
- happens in stroma
- CO2 gets fixed somehow
- produces glucose

## Key Terms
- chlorophyll - green pigment
- (missing other terms)`;

const completedNotes = `# Photosynthesis

## Overview
- Plants make food (glucose) from sunlight through a process called photosynthesis
- Happens in chloroplasts, which are organelles found primarily in leaf cells
- **[AI Extended]** The overall equation is: 6CO₂ + 6H₂O + light energy → C₆H₁₂O₆ + 6O₂

## Light Reactions (Light-Dependent Reactions)
- Occurs in the thylakoid membranes of the chloroplast
- Water molecules are split through photolysis, releasing O₂ as a byproduct
- Makes ATP and NADPH:
  - **[AI Clarified]** ATP (Adenosine Triphosphate) - the primary energy currency of cells
  - **[AI Clarified]** NADPH - an electron carrier that stores high-energy electrons
- **[AI Extended]** Photosystems I and II work together to capture light energy and drive electron transport

## Calvin Cycle (Light-Independent Reactions)
- Happens in the stroma (fluid-filled space inside the chloroplast)
- CO₂ is "fixed" (attached) to a 5-carbon molecule called RuBP by the enzyme RuBisCO
- **[AI Extended]** The cycle involves three main stages:
  1. Carbon fixation - CO₂ attaches to RuBP
  2. Reduction - ATP and NADPH convert the molecules to G3P
  3. Regeneration - Some G3P is used to regenerate RuBP
- Produces glucose (and other organic compounds)

## Key Terms
- Chlorophyll - green pigment that absorbs light (primarily red and blue wavelengths)
- **[AI Added]** Photosystem - a cluster of pigments and proteins that capture light energy
- **[AI Added]** Stroma - the fluid-filled space inside the chloroplast
- **[AI Added]** Thylakoid - membrane-bound compartments where light reactions occur
- **[AI Added]** RuBisCO - the enzyme that catalyzes carbon fixation`;

export default function Notes() {
  const [inputNotes, setInputNotes] = useState("");
  const [outputNotes, setOutputNotes] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleComplete = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setOutputNotes(completedNotes);
      setIsProcessing(false);
    }, 2000);
  };

  const handleUseSample = () => {
    setInputNotes(sampleNotes);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(outputNotes);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
              <span className="text-sm font-medium text-foreground cursor-pointer" data-testid="nav-notes">Notes</span>
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

      <main className="container mx-auto px-6 py-8">
        <div className="mb-8 animate-in">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2 mb-4" data-testid="button-back">
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Button>
          </Link>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold mb-2">Note Completion</h1>
              <p className="text-lg text-muted-foreground max-w-2xl">
                Paste your incomplete notes and let AI fill in the gaps while preserving your structure.
              </p>
            </div>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" className="flex-shrink-0">
                  <Info className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>AI-extended content is clearly labeled with tags like [AI Extended] or [AI Added] so you know what's from your notes vs. the AI.</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card className="animate-in-delay-1">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Your Notes
                  </CardTitle>
                  <CardDescription>Paste or type your incomplete notes</CardDescription>
                </div>
                <Button variant="secondary" size="sm" onClick={handleUseSample} data-testid="button-use-sample">
                  Use Sample
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Tabs defaultValue="paste">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="paste" data-testid="tab-paste">Paste Text</TabsTrigger>
                  <TabsTrigger value="upload" data-testid="tab-upload">Upload File</TabsTrigger>
                </TabsList>
                <TabsContent value="paste" className="mt-4">
                  <Textarea
                    placeholder="Paste your notes here... Markdown formatting is supported."
                    className="min-h-[400px] font-mono text-sm resize-none"
                    value={inputNotes}
                    onChange={(e) => setInputNotes(e.target.value)}
                    data-testid="input-notes"
                  />
                </TabsContent>
                <TabsContent value="upload" className="mt-4">
                  <div className="border-2 border-dashed rounded-lg p-12 text-center hover:border-accent/50 transition-colors cursor-pointer" data-testid="dropzone-upload">
                    <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="font-medium mb-1">Drop your file here</p>
                    <p className="text-sm text-muted-foreground">Supports PDF, TXT, or Markdown files</p>
                  </div>
                </TabsContent>
              </Tabs>
              <Button 
                className="w-full gap-2" 
                size="lg"
                onClick={handleComplete}
                disabled={!inputNotes.trim() || isProcessing}
                data-testid="button-complete-notes"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Complete Notes
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card className="animate-in-delay-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-accent" />
                    Completed Notes
                  </CardTitle>
                  <CardDescription>AI-enhanced version of your notes</CardDescription>
                </div>
                {outputNotes && (
                  <Button variant="outline" size="sm" className="gap-2" onClick={handleCopy} data-testid="button-copy">
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copied ? "Copied!" : "Copy"}
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {outputNotes ? (
                <div className="space-y-4">
                  <div className="flex gap-2 flex-wrap">
                    <Badge variant="secondary" className="gap-1">
                      <span className="w-2 h-2 rounded-full bg-blue-500" />
                      AI Extended
                    </Badge>
                    <Badge variant="secondary" className="gap-1">
                      <span className="w-2 h-2 rounded-full bg-amber-500" />
                      AI Clarified
                    </Badge>
                    <Badge variant="secondary" className="gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      AI Added
                    </Badge>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-4 min-h-[400px] overflow-auto">
                    <pre className="font-mono text-sm whitespace-pre-wrap leading-relaxed" data-testid="text-completed-notes">
                      {outputNotes}
                    </pre>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8 border-2 border-dashed rounded-lg">
                  <FileText className="w-12 h-12 text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground font-medium">Your completed notes will appear here</p>
                  <p className="text-sm text-muted-foreground/70 mt-1">Paste your notes and click "Complete Notes" to get started</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
