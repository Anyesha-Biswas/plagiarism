"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PlagiarismChecker from "@/components/PlagiarismChecker";
import DocumentUploader from "@/components/DocumentUploader";
import { Toaster } from "@/components/ui/toaster";

export default function Home() {
  const [activeTab, setActiveTab] = useState<string>("text");

  return (
    <main className="flex min-h-screen flex-col items-center p-4 md:p-8 lg:p-12">
      <Card className="w-full max-w-5xl shadow-lg">
        <CardHeader className="text-center bg-blue-50 rounded-t-lg">
          <CardTitle className="text-3xl font-bold text-blue-800">AI Plagiarism Detector</CardTitle>
          <CardDescription className="text-blue-600 text-lg">
            Detect plagiarism in text and documents using advanced AI technology
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="text">Text Analysis</TabsTrigger>
              <TabsTrigger value="document">Document Upload</TabsTrigger>
            </TabsList>

            <TabsContent value="text" className="space-y-4">
              <PlagiarismChecker />
            </TabsContent>

            <TabsContent value="document" className="space-y-4">
              <DocumentUploader />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      <footer className="mt-8 text-center text-sm text-gray-500">
        <p>Advanced AI Plagiarism Detection System &copy; {new Date().getFullYear()}</p>
      </footer>
      <Toaster />
    </main>
  );
}
