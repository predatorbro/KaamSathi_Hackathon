// components/ResumeBuilder/index.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useEffect, useState } from "react";
import ResumePreview from "./ResumePreview";
import { PDFDownloadLink } from "@react-pdf/renderer";
import BuilderForm, { ResumeData } from "./BuilderForm.tsx";
import PDFResume from "./PDFResume";
import { usePathname, useRouter } from "next/navigation";
interface ResumeBuilderProps {
  defaultStyle?: "modern" | "classic" | "minimal";
}
export default function ResumeBuilder({
  defaultStyle = "modern",
}: ResumeBuilderProps) {
  const [selectedStyle, setSelectedStyle] = useState<
    "modern" | "classic" | "minimal"
  >(defaultStyle);
  const router = useRouter();
  const pathname = usePathname();

  const handleStyleChange = (style: "modern" | "classic" | "minimal") => {
    // Update URL without page reload
    router.push(`/resume/${style}`);
  };

  // Sync with URL changes
  useEffect(() => {
    const styleFromUrl = pathname.split("/").pop();
    if (
      styleFromUrl === "modern" ||
      styleFromUrl === "classic" ||
      styleFromUrl === "minimal"
    ) {
      setSelectedStyle(styleFromUrl);
    }
  }, [pathname]);
  const [resumeData, setResumeData] = useState<ResumeData>({
    personalInfo: {
      fullName: "Alex Johnson",
      title: "Senior Software Engineer",
      email: "alex@example.com",
      phone: "(555) 123-4567",
      location: "San Francisco, CA",
      linkedin: "linkedin.com/in/alexjohnson",
      website: "alexjohnson.dev",
    },
    summary:
      "Results-driven Software Engineer with 5+ years of experience in full-stack development. Specialized in JavaScript frameworks and cloud technologies. Proven track record of delivering scalable solutions that improve performance by 30%+. Strong collaborator with cross-functional teams to drive product innovation.",
    experience: [
      {
        id: "1",
        title: "Senior Software Engineer",
        company: "Tech Solutions Inc.",
        location: "San Francisco, CA",
        startDate: "2020-01",
        endDate: "Present",
        description:
          "• Lead a team of 5 developers to build and maintain enterprise SaaS applications\n• Reduced API response time by 40% through optimization\n• Implemented CI/CD pipeline reducing deployment time by 60%",
        current: true,
      },
      {
        id: "2",
        title: "Software Engineer",
        company: "Digital Innovations LLC",
        location: "San Jose, CA",
        startDate: "2018-06",
        endDate: "2019-12",
        description:
          "• Developed responsive web applications using React and Node.js\n• Collaborated on a customer portal that increased user engagement by 25%",
        current: false,
      },
    ],
    education: [
      {
        id: "1",
        degree: "Master of Computer Science",
        institution: "Stanford University",
        location: "Stanford, CA",
        graduationDate: "2018",
        gpa: "3.8",
      },
      {
        id: "2",
        degree: "Bachelor of Science in Software Engineering",
        institution: "University of California",
        location: "Berkeley, CA",
        graduationDate: "2016",
        gpa: "3.6",
      },
    ],
    skills: [
      "JavaScript (ES6+)",
      "TypeScript",
      "React",
      "Node.js",
      "AWS",
      "Docker",
      "CI/CD Pipelines",
      "Agile Methodologies",
      "RESTful APIs",
      "MongoDB",
    ],
    languages: ["English (Native)", "Spanish (Professional)"],
    certifications: [
      "AWS Certified Developer - Associate (Amazon Web Services, 2021)",
      "Professional Scrum Master I (Scrum.org, 2020)",
    ],
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="space-y-6">
        <BuilderForm resumeData={resumeData} setResumeData={setResumeData} />

        {/* Style Selection */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Resume Style</h3>
          <div className="flex gap-2">
            <Button
              variant={selectedStyle === "modern" ? "default" : "outline"}
              onClick={() => handleStyleChange("modern")}
              className="text-xs cursor-pointer"
            >
              Modern
            </Button>
            <Button
              variant={selectedStyle === "classic" ? "default" : "outline"}
              onClick={() => handleStyleChange("classic")}
              className="text-xs cursor-pointer"
            >
              Classic
            </Button>
            <Button
              variant={selectedStyle === "minimal" ? "default" : "outline"}
              onClick={() => handleStyleChange("minimal")}
              className="text-xs cursor-pointer"
            >
              Minimal
            </Button>
          </div>
        </div>

        <div className="w-full">
          <PDFDownloadLink
            document={
              <PDFResume resumeData={resumeData} style={selectedStyle} />
            }
            fileName={`${resumeData.personalInfo.fullName || "resume"}.pdf`}
          >
            {({ loading }) => (
              <Button
                className="w-full bg-gray-800 hover:bg-gray-700 cursor-pointer"
                disabled={loading}
              >
                <Download className="h-4 w-4 mr-2" />
                {loading ? "Preparing PDF..." : "Download PDF"}
              </Button>
            )}
          </PDFDownloadLink>
        </div>
      </div>

      <div className="lg:sticky lg:top-8 h-fit">
        <ResumePreview resumeData={resumeData} style={selectedStyle} />
      </div>
    </div>
  );
}
