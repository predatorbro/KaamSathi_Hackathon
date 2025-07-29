import { FileText, Scan } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import ResumeBuilder from "@/components/ResumeBuilder";
import AtsScanner from "@/components/AtsScanner";

export default async function ResumePage({
  params,
}: {
  params: Promise<{ style: string }>;
}) {
  const { style } = await params;
  // Determine active tab and style
  const isScanner = style === "scanner";
  const activeTab = isScanner ? "scanner" : "builder";

  // Validate style
  const validStyles = ["modern", "classic", "minimal"];
  const selectedStyle = validStyles.includes(style || "")
    ? (style as "modern" | "classic" | "minimal")
    : "modern";

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Career Toolkit
          </h1>
          <p className="text-gray-600">
            Build, optimize, and analyze your resume
          </p>
        </div>

        <Tabs value={activeTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-full">
            <TabsTrigger
              value="builder"
              className="cursor-pointer w-full"
              asChild
            >
              <Link href="/resume/modern">
                <div className="flex items-center">
                  <FileText className="h-4 w-4 mr-2" />
                  Resume Builder
                </div>
              </Link>
            </TabsTrigger>
            <TabsTrigger
              value="scanner"
              className="cursor-pointer w-full"
              asChild
            >
              <Link href="/resume/scanner">
                <div className="flex items-center">
                  <Scan className="h-4 w-4 mr-2" />
                  ATS Scanner
                </div>
              </Link>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="builder" className="mt-6">
            {!isScanner && <ResumeBuilder defaultStyle={selectedStyle} />}
          </TabsContent>
          <TabsContent value="scanner" className="mt-6">
            {isScanner && <AtsScanner />}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
