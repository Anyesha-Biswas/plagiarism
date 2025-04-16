"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { analyzePlagiarism } from "@/utils/textProcessing";

interface DocumentResult {
  fileName: string;
  content: string;
  plagiarismScore: number;
  matchedSources: { id: number; score: number; text: string }[];
}

export default function DocumentUploader() {
  const { toast } = useToast();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [documentResults, setDocumentResults] = useState<DocumentResult[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileContent, setFileContent] = useState<string>("");

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    // Only accept text files for now
    if (!file.type.includes('text') && !file.name.endsWith('.txt')) {
      toast({
        title: "Unsupported File",
        description: "Please upload a text file (.txt). PDF support coming soon.",
        variant: "destructive",
      });
      return;
    }

    setSelectedFile(file);

    // Read the file content
    const reader = new FileReader();
    reader.onload = () => {
      const text = reader.result as string;
      setFileContent(text);
    };
    reader.readAsText(file);
  }, [toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'text/plain': ['.txt'] },
    maxFiles: 1
  });

  const handleAnalyzePlagiarism = async () => {
    if (!selectedFile || !fileContent) {
      toast({
        title: "No File Selected",
        description: "Please upload a document to analyze for plagiarism.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    setProgress(0);

    // Simulate processing time with incremental progress
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + 5;
        if (newProgress >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return newProgress;
      });
    }, 150);

    // Simulate analysis with timeout
    setTimeout(() => {
      try {
        const analysisResult = analyzePlagiarism(fileContent);

        const newResult: DocumentResult = {
          fileName: selectedFile.name,
          content: fileContent,
          plagiarismScore: analysisResult.plagiarismScore,
          matchedSources: analysisResult.matchedSources,
        };

        setDocumentResults([newResult, ...documentResults]);
        clearInterval(progressInterval);
        setProgress(100);

        toast({
          title: "Analysis Complete",
          description: `Plagiarism score: ${analysisResult.plagiarismScore}%`,
        });
      } catch (error) {
        console.error("Error analyzing document:", error);
        toast({
          title: "Analysis Error",
          description: "An error occurred while analyzing the document.",
          variant: "destructive",
        });
      } finally {
        setIsAnalyzing(false);
        setProgress(100);
      }
    }, 3000);
  };

  const resetAnalysis = () => {
    setSelectedFile(null);
    setFileContent("");
  };

  return (
    <div className="space-y-6">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
        }`}
      >
        <input {...getInputProps()} />
        <div className="space-y-2 py-4">
          {selectedFile ? (
            <div className="text-center">
              <p className="text-lg font-medium text-blue-600">{selectedFile.name}</p>
              <p className="text-sm text-gray-500">{(selectedFile.size / 1024).toFixed(2)} KB</p>
            </div>
          ) : (
            <>
              <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <p className="text-lg font-medium">
                Drop your document here, or <span className="text-blue-600">browse</span>
              </p>
              <p className="text-sm text-gray-500">
                Supports .txt files (max 10MB)
              </p>
            </>
          )}
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          onClick={handleAnalyzePlagiarism}
          disabled={isAnalyzing || !selectedFile}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {isAnalyzing ? "Analyzing..." : "Check for Plagiarism"}
        </Button>
        <Button
          variant="outline"
          onClick={resetAnalysis}
          disabled={isAnalyzing || !selectedFile}
        >
          Reset
        </Button>
      </div>

      {isAnalyzing && (
        <div className="space-y-2 py-4">
          <p className="text-sm text-blue-600">Analyzing document for plagiarism...</p>
          <Progress value={progress} className="h-2" />
        </div>
      )}

      {documentResults.length > 0 && (
        <div className="space-y-4 mt-6">
          <h3 className="font-semibold text-lg">Document Analysis Results</h3>

          {documentResults.map((result, index) => (
            <Card key={`${result.fileName}-${index}`} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="bg-gray-50 p-4 flex justify-between items-center">
                  <div>
                    <h4 className="font-medium">{result.fileName}</h4>
                    <p className="text-sm text-gray-500">
                      {result.content.length} characters, {result.content.split(/\s+/).length} words
                    </p>
                  </div>
                  <Alert className="w-auto p-2 m-0 inline-flex items-center h-10">
                    <AlertTitle className="m-0 mr-2">Plagiarism Score:</AlertTitle>
                    <AlertDescription className="m-0 font-bold">
                      {result.plagiarismScore}%
                    </AlertDescription>
                  </Alert>
                </div>

                <Separator />

                <div className="p-4">
                  <h5 className="font-medium mb-2">Potential Sources:</h5>
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
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
