"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  FileInput,
  FileText,
  AlertCircle,
  Loader2,
  Sparkles,
  ClipboardList,
  SearchCheck,
  FileSearch,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";

interface AnalysisResult {
  atsScore: number;
  improvements: string[];
  missingKeywords: string[];
  formattingIssues: string[];
  summary: string;
  radarData: {
    formatting: number;
    keywords: number;
    structure: number;
    clarity: number;
    relevance: number;
  };
}

export default function AtsScanner() {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setAnalysis(null);

    if (e.target.files && e.target.files[0]) {
      // Validate file type
      const validTypes = ["application/pdf"];
      if (!validTypes.includes(e.target.files[0].type)) {
        setError("Please upload a PDF file");
        return;
      }

      // Validate file size (5MB)
      if (e.target.files[0].size > 5 * 1024 * 1024) {
        setError("File size exceeds 5MB limit");
        return;
      }

      setFile(e.target.files[0]);
    }
  };

  const BASE_URL = `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api`;

  const handleSubmit = async () => {
    if (!file) return;

    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("resume", file);

      const response = await fetch(BASE_URL + "/resume/analyze", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(response.statusText || "Failed to analyze resume");
      }

      const data = await response.json();

      if (data.success && data.data) {
        setAnalysis(data.data);
        toast.success("Analysis Complete");
      } else {
        throw new Error(data.message || "Invalid response from server");
      }
    } catch (err) {
      console.error("Analysis error:", err);
      setError(err instanceof Error ? err.message : "Failed to analyze resume");
      toast.error("Analysis Failed");
    } finally {
      setIsLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreFeedback = (score: number) => {
    if (score >= 80) return "Excellent ATS compatibility";
    if (score >= 60) return "Good, but could be improved";
    if (score >= 40) return "Needs significant improvement";
    return "Poor ATS compatibility";
  };

  const getRadarData = () => {
    if (!analysis) return [];

    return [
      { subject: "Formatting", A: analysis.radarData.formatting },
      { subject: "Keywords", A: analysis.radarData.keywords },
      { subject: "Structure", A: analysis.radarData.structure },
      { subject: "Clarity", A: analysis.radarData.clarity },
      { subject: "Relevance", A: analysis.radarData.relevance },
    ];
  };

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-2xl">
            <FileSearch className="h-6 w-6 text-blue-600" />
            <span>Resume ATS Scanner</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4">
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:hover:bg-gray-700">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <FileInput className="w-8 h-8 mb-3 text-gray-400" />
                  <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                    <span className="font-semibold">Click to upload</span> or
                    drag and drop
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    PDF only (MAX. 5MB)
                  </p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept=".pdf"
                  onChange={handleFileChange}
                />
              </label>
            </div>

            {error && (
              <div className="p-3 bg-red-50 rounded-lg flex items-center text-red-600 dark:bg-red-900/20 dark:text-red-400">
                <AlertCircle className="h-5 w-5 mr-2" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            {file && (
              <div className="flex items-center justify-between p-3 bg-gray-100 rounded-lg dark:bg-gray-800">
                <div className="flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                  <span className="text-sm font-medium">{file.name}</span>
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </span>
              </div>
            )}

            <Button
              onClick={handleSubmit}
              disabled={!file || isLoading}
              className="w-full bg-blue-600 cursor-pointer hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Check ATS Score
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {isLoading && (
        <div className="flex justify-center py-8">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <p className="text-gray-600 dark:text-gray-400">
              Analyzing your resume with AI...
            </p>
          </div>
        </div>
      )}

      {analysis && (
        <>
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <ClipboardList className="h-5 w-5 text-blue-600" />
                <span>ATS Score Summary</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Overall Compatibility Score
                    </span>
                    <div className="flex items-end space-x-2">
                      <span
                        className={`text-4xl font-bold ${getScoreColor(
                          analysis.atsScore
                        )}`}
                      >
                        {analysis.atsScore}
                      </span>
                      <span className="text-lg text-gray-500">/ 100</span>
                    </div>
                    <p className="text-sm mt-1 text-gray-600 dark:text-gray-400">
                      {getScoreFeedback(analysis.atsScore)}
                    </p>
                  </div>

                  <div className="w-full md:w-1/2">
                    <Progress value={analysis.atsScore} className="h-3" />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Poor</span>
                      <span>Fair</span>
                      <span>Good</span>
                      <span>Excellent</span>
                    </div>
                  </div>
                </div>

                {analysis.summary && (
                  <div className="p-4 bg-blue-50 rounded-lg dark:bg-blue-900/20">
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      {analysis.summary}
                    </p>
                  </div>
                )}

                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart
                      cx="50%"
                      cy="50%"
                      outerRadius="80%"
                      data={getRadarData()}
                    >
                      <PolarGrid />
                      <PolarAngleAxis dataKey="subject" />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} />
                      <Radar
                        name="ATS Factors"
                        dataKey="A"
                        stroke="#3b82f6"
                        fill="#3b82f6"
                        fillOpacity={0.6}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <SearchCheck className="h-5 w-5 text-blue-600" />
                  <span>Optimization Suggestions</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-medium mb-3 text-gray-800 dark:text-gray-200">
                    Recommended Improvements
                  </h3>
                  <ul className="space-y-3">
                    {analysis.improvements.map((suggestion, i) => (
                      <li key={i} className="flex items-start space-x-3">
                        <div className="flex-shrink-0 mt-0.5">
                          <div className="flex items-center justify-center h-5 w-5 rounded-full bg-blue-100 text-blue-600">
                            {i + 1}
                          </div>
                        </div>
                        <span className="text-sm">{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="font-medium mb-3 text-gray-800 dark:text-gray-200">
                    Formatting Issues
                  </h3>
                  <ul className="space-y-2">
                    {analysis.formattingIssues.map((issue, i) => (
                      <li key={i} className="flex items-start space-x-2">
                        <span className="text-red-500">•</span>
                        <span className="text-sm">{issue}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileSearch className="h-5 w-5 text-blue-600" />
                  <span>Keyword Analysis</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-medium mb-3 text-gray-800 dark:text-gray-200">
                    Potential Missing Keywords
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {analysis.missingKeywords.map((keyword, i) => (
                      <span
                        key={i}
                        className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm flex items-center dark:bg-red-900/20 dark:text-red-400"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-2 dark:text-gray-400">
                    Consider adding these relevant keywords to improve your
                    resume&apos;s visibility
                  </p>
                </div>

                <div>
                  <h3 className="font-medium mb-3 text-gray-800 dark:text-gray-200">
                    Resume Optimization Tips
                  </h3>
                  <ul className="space-y-3 text-sm">
                    <li className="flex items-start space-x-2">
                      <span className="text-green-500">✓</span>
                      <span>Use bullet points for achievements</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-green-500">✓</span>
                      <span>Quantify results with numbers and metrics</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-green-500">✓</span>
                      <span>Keep consistent formatting throughout</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-green-500">✓</span>
                      <span>Use standard section headings</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-green-500">✓</span>
                      <span>Avoid graphics and complex layouts</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
