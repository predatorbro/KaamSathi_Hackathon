"use client";

import { forwardRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { ResumeData } from "./BuilderForm.tsx";

interface ResumePreviewProps {
  resumeData: ResumeData;
  style?: "modern" | "classic" | "minimal";
}

const ResumePreview = forwardRef<HTMLDivElement, ResumePreviewProps>(
  ({ resumeData, style = "modern" }, ref) => {
    const formatDate = (dateString: string) => {
      if (!dateString) return "Present";
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      });
    };

    const renderClassicDesign = () => (
      <div
        ref={ref}
        className="bg-white border border-gray-200 rounded-lg md:p-6 min-h-[800px]"
        style={{
          fontFamily: "'Times New Roman', serif",
          fontSize: "11pt",
          lineHeight: 1.3,
        }}
      >
        <div className="space-y-4">
          {/* Header */}
          <div className="text-center mb-4">
            <h1 className="text-xl font-bold uppercase tracking-wider">
              {resumeData.personalInfo.fullName || "YOUR NAME"}
            </h1>
            {resumeData.personalInfo.title && (
              <p className="text-sm italic mt-1">
                {resumeData.personalInfo.title}
              </p>
            )}
            <div className="flex flex-wrap justify-center gap-x-4 mt-1 text-xs">
              {resumeData.personalInfo.email && (
                <span>{resumeData.personalInfo.email}</span>
              )}
              {resumeData.personalInfo.phone && (
                <span>{resumeData.personalInfo.phone}</span>
              )}
              {resumeData.personalInfo.location && (
                <span>{resumeData.personalInfo.location}</span>
              )}
              {resumeData.personalInfo.linkedin && (
                <span>LinkedIn: {resumeData.personalInfo.linkedin}</span>
              )}
              {resumeData.personalInfo.website && (
                <span>Portfolio: {resumeData.personalInfo.website}</span>
              )}
            </div>
          </div>

          {/* Summary */}
          {resumeData.summary && (
            <div className="mb-4">
              <h2 className="text-sm font-bold uppercase border-b border-black mb-1">
                Professional Summary
              </h2>
              <p className="text-xs">{resumeData.summary}</p>
            </div>
          )}

          {/* Experience */}
          {resumeData.experience.length > 0 && (
            <div className="mb-4">
              <h2 className="text-sm font-bold uppercase border-b border-black mb-2">
                Professional Experience
              </h2>
              <div className="space-y-3">
                {resumeData.experience.map((exp) => (
                  <div key={exp.id} className="break-inside-avoid">
                    <div className="flex justify-between items-baseline">
                      <h3 className="text-sm font-bold">
                        {exp.company}
                        {exp.location && `, ${exp.location}`}
                      </h3>
                      <span className="text-xs">
                        {formatDate(exp.startDate)} -{" "}
                        {exp.current ? "Present" : formatDate(exp.endDate)}
                      </span>
                    </div>
                    <p className="text-xs italic mb-1">{exp.title}</p>
                    {exp.description && (
                      <ul className="list-disc pl-5 text-xs space-y-1">
                        {exp.description
                          .split("\n")
                          .filter((line) => line.trim())
                          .map((line, i) => (
                            <li key={i}>{line.replace(/^•\s*/, "")}</li>
                          ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Education */}
          {resumeData.education.length > 0 && (
            <div className="mb-4">
              <h2 className="text-sm font-bold uppercase border-b border-black mb-2">
                Education
              </h2>
              <div className="space-y-2">
                {resumeData.education.map((edu) => (
                  <div key={edu.id} className="break-inside-avoid">
                    <div className="flex justify-between items-baseline">
                      <h3 className="text-sm font-bold">
                        {edu.institution}
                        {edu.location && `, ${edu.location}`}
                      </h3>
                      <span className="text-xs">
                        {edu.graduationDate
                          ? formatDate(edu.graduationDate)
                          : ""}
                      </span>
                    </div>
                    <p className="text-xs italic">{edu.degree}</p>
                    {edu.gpa && <p className="text-xs">GPA: {edu.gpa}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Skills */}
          {resumeData.skills.length > 0 && (
            <div className="mb-4">
              <h2 className="text-sm font-bold uppercase border-b border-black mb-1">
                Technical Skills
              </h2>
              <p className="text-xs">{resumeData.skills.join(", ")}</p>
            </div>
          )}

          {/* Certifications */}
          {resumeData.certifications.length > 0 && (
            <div className="mb-4">
              <h2 className="text-sm font-bold uppercase border-b border-black mb-1">
                Certifications
              </h2>
              <ul className="list-disc pl-5 text-xs space-y-1">
                {resumeData.certifications.map((cert, i) => (
                  <li key={i}>{cert}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Languages */}
          {resumeData.languages.length > 0 && (
            <div>
              <h2 className="text-sm font-bold uppercase border-b border-black mb-1">
                Languages
              </h2>
              <p className="text-xs">{resumeData.languages.join(", ")}</p>
            </div>
          )}
        </div>
      </div>
    );

    const renderModernDesign = () => (
      <div
        ref={ref}
        className="bg-white border border-gray-200 rounded-lg md:p-6 min-h-[800px]"
        style={{
          fontFamily: "'Helvetica Neue', Arial, sans-serif",
          fontSize: "10pt",
          lineHeight: 1.4,
        }}
      >
        <div className="flex">
          {/* Sidebar - Takes up 30% width */}
          <div className="w-[30%] bg-gray-50 p-4">
            {/* Name and Title */}
            <div className="mb-4">
              <h1 className="text-lg font-bold uppercase">
                {resumeData.personalInfo.fullName || "YOUR NAME"}
              </h1>
              {resumeData.personalInfo.title && (
                <p className="text-xs text-gray-600 mt-1">
                  {resumeData.personalInfo.title}
                </p>
              )}
            </div>

            {/* Contact Info */}
            <div className="mb-4">
              <h2 className="text-xs font-bold uppercase mb-2 border-b border-gray-300 pb-1">
                Contact
              </h2>
              <div className="space-y-1 text-xs">
                {resumeData.personalInfo.email && (
                  <div className="flex items-center">
                    <span>{resumeData.personalInfo.email}</span>
                  </div>
                )}
                {resumeData.personalInfo.phone && (
                  <div className="flex items-center">
                    <span>{resumeData.personalInfo.phone}</span>
                  </div>
                )}
                {resumeData.personalInfo.location && (
                  <div className="flex items-center">
                    <span>{resumeData.personalInfo.location}</span>
                  </div>
                )}
                {resumeData.personalInfo.linkedin && (
                  <div className="flex items-center">
                    <span>
                      LinkedIn:{" "}
                      {resumeData.personalInfo.linkedin.split("/").pop()}
                    </span>
                  </div>
                )}
                {resumeData.personalInfo.website && (
                  <div className="flex items-center">
                    <span>
                      Portfolio:{" "}
                      {resumeData.personalInfo.website.replace(
                        /^https?:\/\//,
                        ""
                      )}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Skills */}
            {resumeData.skills.length > 0 && (
              <div className="mb-4">
                <h2 className="text-xs font-bold uppercase mb-2 border-b border-gray-300 pb-1">
                  Skills
                </h2>
                <ul className="list-disc pl-4 text-xs space-y-1">
                  {resumeData.skills.map((skill, i) => (
                    <li key={i}>{skill}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Languages */}
            {resumeData.languages.length > 0 && (
              <div className="mb-4">
                <h2 className="text-xs font-bold uppercase mb-2 border-b border-gray-300 pb-1">
                  Languages
                </h2>
                <ul className="list-disc pl-4 text-xs space-y-1">
                  {resumeData.languages.map((lang, i) => (
                    <li key={i}>{lang}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Certifications */}
            {resumeData.certifications.length > 0 && (
              <div>
                <h2 className="text-xs font-bold uppercase mb-2 border-b border-gray-300 pb-1">
                  Certifications
                </h2>
                <ul className="list-disc pl-4 text-xs space-y-1">
                  {resumeData.certifications.map((cert, i) => (
                    <li key={i}>{cert}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Main Content - Takes up 70% width */}
          <div className="w-[70%] p-4">
            {/* Summary */}
            {resumeData.summary && (
              <div className="mb-4">
                <h2 className="text-xs font-bold uppercase mb-1">
                  Professional Profile
                </h2>
                <p className="text-xs">{resumeData.summary}</p>
              </div>
            )}

            {/* Experience */}
            {resumeData.experience.length > 0 && (
              <div className="mb-4">
                <h2 className="text-xs font-bold uppercase mb-2">
                  Professional Experience
                </h2>
                <div className="space-y-3">
                  {resumeData.experience.map((exp) => (
                    <div key={exp.id} className="break-inside-avoid">
                      <div className="flex justify-between items-baseline">
                        <h3 className="text-sm font-bold">{exp.title}</h3>
                        <span className="text-xs">
                          {formatDate(exp.startDate)} -{" "}
                          {exp.current ? "Present" : formatDate(exp.endDate)}
                        </span>
                      </div>
                      <p className="text-xs font-semibold mb-1">
                        {exp.company}
                        {exp.location && `, ${exp.location}`}
                      </p>
                      {exp.description && (
                        <ul className="list-disc pl-5 text-xs space-y-1">
                          {exp.description
                            .split("\n")
                            .filter((line) => line.trim())
                            .map((line, i) => (
                              <li key={i}>{line.replace(/^•\s*/, "")}</li>
                            ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Education */}
            {resumeData.education.length > 0 && (
              <div>
                <h2 className="text-xs font-bold uppercase mb-2">Education</h2>
                <div className="space-y-2">
                  {resumeData.education.map((edu) => (
                    <div key={edu.id} className="break-inside-avoid">
                      <div className="flex justify-between items-baseline">
                        <h3 className="text-sm font-bold">{edu.degree}</h3>
                        <span className="text-xs">
                          {edu.graduationDate
                            ? formatDate(edu.graduationDate)
                            : ""}
                        </span>
                      </div>
                      <p className="text-xs font-semibold">
                        {edu.institution}
                        {edu.location && `, ${edu.location}`}
                      </p>
                      {edu.gpa && <p className="text-xs">GPA: {edu.gpa}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );

    const renderMinimalDesign = () => (
      <div
        ref={ref}
        className="bg-white border border-gray-200 rounded-lg md:p-6 min-h-[800px]"
        style={{
          fontFamily: "'Arial', sans-serif",
          fontSize: "10pt",
          lineHeight: 1.4,
        }}
      >
        <div className="space-y-4">
          {/* Header */}
          <div className="mb-4">
            <h1 className="text-lg font-bold uppercase">
              {resumeData.personalInfo.fullName || "YOUR NAME"}
            </h1>
            {resumeData.personalInfo.title && (
              <p className="text-xs text-gray-600 mt-1">
                {resumeData.personalInfo.title}
              </p>
            )}
            <div className="flex flex-wrap gap-x-4 mt-1 text-xs">
              {resumeData.personalInfo.email && (
                <span>{resumeData.personalInfo.email}</span>
              )}
              {resumeData.personalInfo.phone && (
                <span>{resumeData.personalInfo.phone}</span>
              )}
              {resumeData.personalInfo.location && (
                <span>{resumeData.personalInfo.location}</span>
              )}
            </div>
          </div>

          {/* Summary */}
          {resumeData.summary && (
            <div className="mb-4">
              <h2 className="text-xs font-bold uppercase mb-1">Summary</h2>
              <p className="text-xs">{resumeData.summary}</p>
            </div>
          )}

          {/* Experience */}
          {resumeData.experience.length > 0 && (
            <div className="mb-4">
              <h2 className="text-xs font-bold uppercase mb-2">Experience</h2>
              <div className="space-y-3">
                {resumeData.experience.map((exp) => (
                  <div key={exp.id} className="break-inside-avoid">
                    <div className="flex justify-between items-baseline">
                      <h3 className="text-sm font-bold">{exp.title}</h3>
                      <span className="text-xs">
                        {formatDate(exp.startDate)} -{" "}
                        {exp.current ? "Present" : formatDate(exp.endDate)}
                      </span>
                    </div>
                    <p className="text-xs font-semibold mb-1">
                      {exp.company}
                      {exp.location && `, ${exp.location}`}
                    </p>
                    {exp.description && (
                      <ul className="list-disc pl-5 text-xs space-y-1">
                        {exp.description
                          .split("\n")
                          .filter((line) => line.trim())
                          .map((line, i) => (
                            <li key={i}>{line.replace(/^•\s*/, "")}</li>
                          ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Education */}
          {resumeData.education.length > 0 && (
            <div className="mb-4">
              <h2 className="text-xs font-bold uppercase mb-2">Education</h2>
              <div className="space-y-2">
                {resumeData.education.map((edu) => (
                  <div key={edu.id} className="break-inside-avoid">
                    <div className="flex justify-between items-baseline">
                      <h3 className="text-sm font-bold">{edu.degree}</h3>
                      <span className="text-xs">
                        {edu.graduationDate
                          ? formatDate(edu.graduationDate)
                          : ""}
                      </span>
                    </div>
                    <p className="text-xs font-semibold">
                      {edu.institution}
                      {edu.location && `, ${edu.location}`}
                    </p>
                    {edu.gpa && <p className="text-xs">GPA: {edu.gpa}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Skills */}
          {resumeData.skills.length > 0 && (
            <div className="mb-4">
              <h2 className="text-xs font-bold uppercase mb-1">Skills</h2>
              <p className="text-xs">{resumeData.skills.join(" • ")}</p>
            </div>
          )}

          {/* Certifications */}
          {resumeData.certifications.length > 0 && (
            <div className="mb-4">
              <h2 className="text-xs font-bold uppercase mb-1">
                Certifications
              </h2>
              <ul className="list-disc pl-5 text-xs space-y-1">
                {resumeData.certifications.map((cert, i) => (
                  <li key={i}>{cert}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Languages */}
          {resumeData.languages.length > 0 && (
            <div>
              <h2 className="text-xs font-bold uppercase mb-1">Languages</h2>
              <p className="text-xs">{resumeData.languages.join(", ")}</p>
            </div>
          )}
        </div>
      </div>
    );

    return (
      <Card className="h-fit">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <span>Resume Preview</span>
            <span className="text-sm text-gray-500">({style} design)</span>
          </CardTitle>
          <Button className="bg-gray-800 hover:bg-gray-700">
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
        </CardHeader>
        <CardContent>
          {style === "classic" && renderClassicDesign()}
          {style === "modern" && renderModernDesign()}
          {style === "minimal" && renderMinimalDesign()}
        </CardContent>
      </Card>
    );
  }
);

ResumePreview.displayName = "ResumePreview";

export default ResumePreview;
