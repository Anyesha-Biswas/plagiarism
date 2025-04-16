"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { analyzePlagiarism } from "@/utils/textProcessing";
import { HighlightedText } from "@/components/HighlightedText";

interface AnalysisResult {
  plagiarismScore: number;
  highlightedText: string;
  matchedSources: { id: number; score: number; text: string }[];
}

export default function PlagiarismChecker() {
  const { toast } = useToast();
  const [text, setText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const handleAnalyzePlagiarism = () => {
    if (!text.trim()) {
      toast({
        title: "Empty Text",
        description: "Please enter some text to analyze for plagiarism.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);

    // Simulate processing time
    setTimeout(() => {
      try {
        const analysisResult = analyzePlagiarism(text);
        setResult(analysisResult);
      } catch (error) {
        console.error("Error analyzing text:", error);
        toast({
          title: "Analysis Error",
          description: "An error occurred while analyzing the text.",
          variant: "destructive",
        });
      } finally {
        setIsAnalyzing(false);
      }
    }, 1500);
  };

  const resetAnalysis = () => {
    setText("");
    setResult(null);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <label htmlFor="text-input" className="text-sm font-medium">
          Enter or paste text to analyze for plagiarism
        </label>
        <Textarea
          id="text-input"
          placeholder="Enter the text you want to check for plagiarism..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="min-h-[200px] text-base"
          disabled={isAnalyzing}
        />
      </div>

      <div className="flex gap-2">
        <Button
          onClick={handleAnalyzePlagiarism}
          disabled={isAnalyzing || !text.trim()}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {isAnalyzing ? "Analyzing..." : "Check for Plagiarism"}
        </Button>
        <Button
          variant="outline"
          onClick={resetAnalysis}
          disabled={isAnalyzing || (!text && !result)}
        >
          Reset
        </Button>
      </div>

      {isAnalyzing && (
        <div className="space-y-2 py-4">
          <p className="text-sm text-blue-600">Analyzing text for plagiarism...</p>
          <Progress value={45} className="h-2" />
        </div>
      )}

      {result && (
        <div className="space-y-4 mt-6">
          <Alert variant={result.plagiarismScore > 30 ? "destructive" : "default"}>
            <AlertTitle>Plagiarism Detection Result</AlertTitle>
            <AlertDescription>
              <span className="font-bold">{result.plagiarismScore}%</span> of this text appears to be plagiarized
            </AlertDescription>
          </Alert>

          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-2">Highlighted Text</h3>
              <HighlightedText text={result.highlightedText} />
            </CardContent>
          </Card>

          {result.matchedSources.length > 0 && (
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-2">Potential Sources</h3>
                <ul className="space-y-2">
                  {result.matchedSources.map((source) => (
                    <li key={source.id} className="p-2 bg-gray-50 rounded text-sm">
                      <div className="flex justify-between mb-1">
                        <span className="font-medium">Source #{source.id + 1}</span>
                        <span className="text-blue-600 font-bold">{Math.round(source.score * 100)}% match</span>
                      </div>
                      <p className="text-gray-700">{source.text}</p>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
