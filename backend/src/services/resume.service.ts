import { GoogleGenerativeAI } from "@google/generative-ai";
import { ResumeAnalysis } from "../types/api.types";
import pdf from 'pdf-parse';

export class ResumeService {
    private genAI: GoogleGenerativeAI;

    constructor(apiKey: string) {
        this.genAI = new GoogleGenerativeAI(apiKey);
    }

    async extractTextFromPDF(buffer: Buffer): Promise<string> {
        try {
            const data = await pdf(buffer);
            return data.text;
        } catch (error) {
            console.error('PDF parsing error:', error);
            throw new Error('Failed to extract text from PDF');
        }
    }

    async analyzeResume(resumeText: string): Promise<ResumeAnalysis> {
        try {
            const model = this.genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });

            const prompt = `
            Analyze this resume for ATS (Applicant Tracking System) compatibility and provide a comprehensive analysis including:
            
            1. ATS Score (0-100) based on:
               - Keyword optimization (30%)
               - Formatting and structure (25%)
               - Content relevance (20%)
               - Readability (15%)
               - Technical skills presentation (10%)
            
            2. Specific improvements (5-10 items)
            
            3. Missing keywords/skills (5-15 items)
            
            4. Formatting issues (3-8 items)
            
            5. A 2-3 sentence summary of the overall assessment
            
            6. Radar chart data for these categories:
               - Formatting
               - Keywords
               - Structure
               - Clarity
               - Relevance
               
            Return the response in JSON format exactly like this:
            {
                "success": true,
                "data": {
                    "atsScore": number,
                    "improvements": string[],
                    "missingKeywords": string[],
                    "formattingIssues": string[],
                    "summary": string,
                    "radarData": {
                        "formatting": number,
                        "keywords": number,
                        "structure": number,
                        "clarity": number,
                        "relevance": number
                    }
                }
            }
            
            Resume:
            ${resumeText.substring(0, 10000)} // Limiting to first 10k chars
            `;

            const result = await model.generateContent(prompt);
            const response = result.response.text();

            try {
                const jsonMatch = response.match(/\{[\s\S]*\}/);
                if (!jsonMatch) throw new Error('No JSON found in response');

                const parsedResponse = JSON.parse(jsonMatch[0]);

                // Ensure all required fields are present
                const defaultResponse = {
                    atsScore: 0,
                    improvements: [],
                    missingKeywords: [],
                    formattingIssues: [],
                    summary: 'No summary provided',
                    radarData: {
                        formatting: 0,
                        keywords: 0,
                        structure: 0,
                        clarity: 0,
                        relevance: 0
                    }
                };

                const analysis = {
                    ...defaultResponse,
                    ...parsedResponse.data,
                    radarData: {
                        ...defaultResponse.radarData,
                        ...(parsedResponse.data?.radarData || {})
                    }
                };

                // Normalize scores
                analysis.atsScore = Math.max(0, Math.min(100, analysis.atsScore));
                analysis.radarData.formatting = Math.max(0, Math.min(100, analysis.radarData.formatting));
                analysis.radarData.keywords = Math.max(0, Math.min(100, analysis.radarData.keywords));
                analysis.radarData.structure = Math.max(0, Math.min(100, analysis.radarData.structure));
                analysis.radarData.clarity = Math.max(0, Math.min(100, analysis.radarData.clarity));
                analysis.radarData.relevance = Math.max(0, Math.min(100, analysis.radarData.relevance));

                return analysis;
            } catch (parseError) {
                console.error('Failed to parse Gemini response:', parseError);
                throw new Error('Failed to parse analysis results');
            }
        } catch (error) {
            console.error('Gemini API Error:', error);
            throw new Error('Failed to analyze resume');
        }
    }
}

export const resumeService = new ResumeService(process.env.GEMINI_API_KEY || "");