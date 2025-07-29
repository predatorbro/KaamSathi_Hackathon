// components/ResumeBuilder/PDFResume.tsx
import {
  Document,
  Page,
  StyleSheet,
  View,
  Text,
  Font,
} from "@react-pdf/renderer";
import { ResumeData } from "./BuilderForm.tsx";

// Register fonts (optional - if you want custom fonts)
Font.register({
  family: "Helvetica",
  fonts: [
    { src: "https://fonts.gstatic.com/s/helvetica/v15/Helvetica.ttf" },
    {
      src: "https://fonts.gstatic.com/s/helvetica/v15/Helvetica-Bold.ttf",
      fontWeight: "bold",
    },
    {
      src: "https://fonts.gstatic.com/s/helvetica/v15/Helvetica-Oblique.ttf",
      fontStyle: "italic",
    },
  ],
});

Font.register({
  family: "Times-Roman",
  fonts: [
    { src: "https://fonts.gstatic.com/s/timesnewroman/v20/TimesNewRoman.ttf" },
    {
      src: "https://fonts.gstatic.com/s/timesnewroman/v20/TimesNewRomanBold.ttf",
      fontWeight: "bold",
    },
    {
      src: "https://fonts.gstatic.com/s/timesnewroman/v20/TimesNewRomanItalic.ttf",
      fontStyle: "italic",
    },
  ],
});

// Create styles
const styles = StyleSheet.create({
  // Modern Style
  modernPage: {
    padding: 0,
    fontFamily: "Helvetica",
    lineHeight: 1.4,
    fontSize: 10,
  },
  modernTwoColumn: {
    flexDirection: "row",
    width: "100%",
    minHeight: "100%",
  },
  modernSidebar: {
    width: "30%",
    padding: 20,
    backgroundColor: "#f8f9fa",
  },
  modernMainContent: {
    width: "70%",
    padding: 20,
  },
  modernSection: {
    marginBottom: 12,
  },
  modernHeader: {
    fontSize: 10,
    fontWeight: "bold",
    marginBottom: 8,
    textTransform: "uppercase",
    color: "#2c3e50",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    paddingBottom: 3,
  },
  modernName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
    textTransform: "uppercase",
    color: "#2c3e50",
  },
  modernTitle: {
    fontSize: 10,
    color: "#7f8c8d",
    marginBottom: 12,
  },
  modernContactItem: {
    fontSize: 9,
    marginBottom: 4,
    color: "#34495e",
  },
  modernJobTitle: {
    fontSize: 11,
    fontWeight: "bold",
    marginBottom: 2,
    color: "#2c3e50",
  },
  modernCompany: {
    fontSize: 9,
    fontWeight: "semibold",
    color: "#7f8c8d",
    marginBottom: 4,
  },
  modernDate: {
    fontSize: 9,
    color: "#95a5a6",
  },
  modernBulletItem: {
    fontSize: 9,
    marginLeft: 10,
    marginBottom: 3,
    color: "#34495e",
  },
  modernEducationDegree: {
    fontSize: 11,
    fontWeight: "bold",
    marginBottom: 2,
    color: "#2c3e50",
  },
  modernEducationInstitution: {
    fontSize: 9,
    fontWeight: "semibold",
    color: "#7f8c8d",
  },
  modernSkillItem: {
    fontSize: 9,
    marginLeft: 10,
    marginBottom: 3,
    color: "#34495e",
  },
  modernSummaryText: {
    fontSize: 9,
    lineHeight: 1.4,
    color: "#34495e",
  },
  modernDivider: {
    height: 1,
    backgroundColor: "#e0e0e0",
    marginVertical: 8,
  },

  // Classic Style
  classicPage: {
    padding: 40,
    fontFamily: "Times-Roman",
    lineHeight: 1.25,
    fontSize: 11,
    color: "#333",
  },
  classicSection: {
    marginBottom: 12,
  },
  classicHeader: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 8,
    textTransform: "uppercase",
    color: "#000",
    borderBottomWidth: 1,
    borderBottomColor: "#000",
    paddingBottom: 2,
  },
  classicName: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4,
    textTransform: "uppercase",
    color: "#000",
    textAlign: "center",
  },
  classicTitle: {
    fontSize: 12,
    color: "#555",
    marginBottom: 12,
    fontStyle: "italic",
    textAlign: "center",
  },
  classicContactItem: {
    fontSize: 10,
    marginBottom: 4,
    color: "#333",
    textAlign: "center",
  },
  classicJobTitle: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 2,
    color: "#000",
  },
  classicCompany: {
    fontSize: 10,
    fontStyle: "italic",
    color: "#555",
    marginBottom: 4,
  },
  classicDate: {
    fontSize: 10,
    color: "#666",
  },
  classicBulletItem: {
    fontSize: 10,
    marginLeft: 12,
    marginBottom: 3,
    color: "#333",
  },
  classicEducationDegree: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 2,
    color: "#000",
  },
  classicEducationInstitution: {
    fontSize: 10,
    fontStyle: "italic",
    color: "#555",
  },
  classicSummaryText: {
    fontSize: 10,
    lineHeight: 1.3,
    color: "#333",
  },
  classicDivider: {
    height: 1,
    backgroundColor: "#ddd",
    marginVertical: 10,
  },

  // Minimal Style
  minimalPage: {
    padding: 30,
    fontFamily: "Helvetica",
    lineHeight: 1.4,
    fontSize: 9,
  },
  minimalSection: {
    marginBottom: 10,
  },
  minimalHeader: {
    fontSize: 9,
    fontWeight: "bold",
    marginBottom: 6,
    textTransform: "uppercase",
    color: "#444",
    borderBottomWidth: 0.5,
    borderBottomColor: "#ddd",
    paddingBottom: 2,
  },
  minimalName: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 2,
    textTransform: "uppercase",
    color: "#333",
  },
  minimalTitle: {
    fontSize: 8,
    color: "#777",
    marginBottom: 8,
  },
  minimalContactItem: {
    fontSize: 8,
    marginBottom: 3,
    color: "#555",
  },
  minimalJobTitle: {
    fontSize: 9,
    fontWeight: "bold",
    marginBottom: 1,
    color: "#333",
  },
  minimalCompany: {
    fontSize: 8,
    fontWeight: "semibold",
    color: "#666",
    marginBottom: 3,
  },
  minimalDate: {
    fontSize: 8,
    color: "#777",
  },
  minimalBulletItem: {
    fontSize: 8,
    marginLeft: 8,
    marginBottom: 2,
    color: "#555",
  },
  minimalEducationDegree: {
    fontSize: 9,
    fontWeight: "bold",
    marginBottom: 1,
    color: "#333",
  },
  minimalEducationInstitution: {
    fontSize: 8,
    fontWeight: "semibold",
    color: "#666",
  },
  minimalSummaryText: {
    fontSize: 8,
    lineHeight: 1.4,
    color: "#555",
  },
  minimalDivider: {
    height: 0.5,
    backgroundColor: "#eee",
    marginVertical: 6,
  },

  // Shared Styles
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  contactContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 8,
  },
  bulletList: {
    marginTop: 4,
  },
});

const formatDate = (dateString: string) => {
  if (!dateString) return "Present";
  if (dateString.length === 4) return dateString; // Just year

  const [year, month] = dateString.split("-");
  const date = new Date(parseInt(year), parseInt(month) - 1);
  return date.toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
};

interface PDFResumeProps {
  resumeData: ResumeData;
  style: "modern" | "classic" | "minimal";
}

const PDFResume = ({ resumeData, style }: PDFResumeProps) => {
  const renderModernDesign = () => (
    <Page size="A4" style={styles.modernPage}>
      <View style={styles.modernTwoColumn}>
        {/* Sidebar */}
        <View style={styles.modernSidebar}>
          {/* Name and Title */}
          <View style={styles.modernSection}>
            <Text style={styles.modernName}>
              {resumeData.personalInfo.fullName || "YOUR NAME"}
            </Text>
            {resumeData.personalInfo.title && (
              <Text style={styles.modernTitle}>
                {resumeData.personalInfo.title}
              </Text>
            )}
          </View>

          {/* Contact Info */}
          <View style={styles.modernSection}>
            <Text style={styles.modernHeader}>Contact</Text>
            {resumeData.personalInfo.email && (
              <Text style={styles.modernContactItem}>
                {resumeData.personalInfo.email}
              </Text>
            )}
            {resumeData.personalInfo.phone && (
              <Text style={styles.modernContactItem}>
                {resumeData.personalInfo.phone}
              </Text>
            )}
            {resumeData.personalInfo.location && (
              <Text style={styles.modernContactItem}>
                {resumeData.personalInfo.location}
              </Text>
            )}
            {resumeData.personalInfo.linkedin && (
              <Text style={styles.modernContactItem}>
                linkedin.com/in/
                {resumeData.personalInfo.linkedin.split("/").pop()}
              </Text>
            )}
            {resumeData.personalInfo.website && (
              <Text style={styles.modernContactItem}>
                {resumeData.personalInfo.website.replace(/^https?:\/\//, "")}
              </Text>
            )}
          </View>

          {/* Skills */}
          {resumeData.skills.length > 0 && (
            <View style={styles.modernSection}>
              <Text style={styles.modernHeader}>Skills</Text>
              <View style={styles.bulletList}>
                {resumeData.skills.map((skill, i) => (
                  <Text key={i} style={styles.modernSkillItem}>
                    • {skill}
                  </Text>
                ))}
              </View>
            </View>
          )}

          {/* Languages */}
          {resumeData.languages.length > 0 && (
            <View style={styles.modernSection}>
              <Text style={styles.modernHeader}>Languages</Text>
              <View style={styles.bulletList}>
                {resumeData.languages.map((lang, i) => (
                  <Text key={i} style={styles.modernSkillItem}>
                    • {lang}
                  </Text>
                ))}
              </View>
            </View>
          )}

          {/* Certifications */}
          {resumeData.certifications.length > 0 && (
            <View style={styles.modernSection}>
              <Text style={styles.modernHeader}>Certifications</Text>
              <View style={styles.bulletList}>
                {resumeData.certifications.map((cert, i) => (
                  <Text key={i} style={styles.modernSkillItem}>
                    • {cert}
                  </Text>
                ))}
              </View>
            </View>
          )}
        </View>

        {/* Main Content */}
        <View style={styles.modernMainContent}>
          {/* Summary */}
          {resumeData.summary && (
            <View style={styles.modernSection}>
              <Text style={styles.modernHeader}>Professional Profile</Text>
              <Text style={styles.modernSummaryText}>{resumeData.summary}</Text>
            </View>
          )}

          {/* Experience */}
          {resumeData.experience.length > 0 && (
            <View style={styles.modernSection}>
              <Text style={styles.modernHeader}>Professional Experience</Text>
              {resumeData.experience.map((exp, index) => (
                <View key={exp.id}>
                  {index > 0 && <View style={styles.modernDivider} />}
                  <View style={{ marginBottom: 8 }}>
                    <View style={styles.row}>
                      <Text style={styles.modernJobTitle}>{exp.title}</Text>
                      <Text style={styles.modernDate}>
                        {formatDate(exp.startDate)} -{" "}
                        {exp.current ? "Present" : formatDate(exp.endDate)}
                      </Text>
                    </View>
                    <Text style={styles.modernCompany}>
                      {exp.company}
                      {exp.location && ` • ${exp.location}`}
                    </Text>
                    {exp.description && (
                      <View style={styles.bulletList}>
                        {exp.description
                          .split("\n")
                          .filter((line) => line.trim())
                          .map((line, i) => (
                            <Text key={i} style={styles.modernBulletItem}>
                              • {line.replace(/^•\s*/, "")}
                            </Text>
                          ))}
                      </View>
                    )}
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Education */}
          {resumeData.education.length > 0 && (
            <View style={styles.modernSection}>
              <Text style={styles.modernHeader}>Education</Text>
              {resumeData.education.map((edu, index) => (
                <View key={edu.id}>
                  {index > 0 && <View style={styles.modernDivider} />}
                  <View style={{ marginBottom: 8 }}>
                    <View style={styles.row}>
                      <Text style={styles.modernEducationDegree}>
                        {edu.degree}
                      </Text>
                      <Text style={styles.modernDate}>
                        {edu.graduationDate
                          ? formatDate(edu.graduationDate)
                          : ""}
                      </Text>
                    </View>
                    <Text style={styles.modernEducationInstitution}>
                      {edu.institution}
                      {edu.location && ` • ${edu.location}`}
                    </Text>
                    {edu.gpa && (
                      <Text style={[styles.modernDate, { marginTop: 2 }]}>
                        GPA: {edu.gpa}
                      </Text>
                    )}
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </View>
    </Page>
  );

  const renderClassicDesign = () => (
    <Page size="A4" style={styles.classicPage}>
      {/* Header */}
      <View style={[styles.classicSection, { alignItems: "center" }]}>
        <Text style={styles.classicName}>
          {resumeData.personalInfo.fullName || "YOUR NAME"}
        </Text>
        {resumeData.personalInfo.title && (
          <Text style={styles.classicTitle}>
            {resumeData.personalInfo.title}
          </Text>
        )}
        <View style={styles.contactContainer}>
          {resumeData.personalInfo.email && (
            <Text style={styles.classicContactItem}>
              {resumeData.personalInfo.email}
            </Text>
          )}
          {resumeData.personalInfo.phone && (
            <Text style={styles.classicContactItem}>
              {resumeData.personalInfo.phone}
            </Text>
          )}
          {resumeData.personalInfo.location && (
            <Text style={styles.classicContactItem}>
              {resumeData.personalInfo.location}
            </Text>
          )}
        </View>
        {/* LinkedIn and Website on separate lines but still centered */}
        <View style={{ alignItems: "center" }}>
          {resumeData.personalInfo.linkedin && (
            <Text style={styles.classicContactItem}>
              in/{resumeData.personalInfo.linkedin.split("/").pop()}
            </Text>
          )}
          {resumeData.personalInfo.website && (
            <Text style={styles.classicContactItem}>
              {resumeData.personalInfo.website.replace(/^https?:\/\//, "")}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.classicDivider} />

      {/* Summary */}
      {resumeData.summary && (
        <View style={styles.classicSection}>
          <Text style={styles.classicHeader}>Professional Summary</Text>
          <Text style={styles.classicSummaryText}>{resumeData.summary}</Text>
        </View>
      )}

      {/* Experience */}
      {resumeData.experience.length > 0 && (
        <View style={styles.classicSection}>
          <Text style={styles.classicHeader}>Professional Experience</Text>
          {resumeData.experience.map((exp, index) => (
            <View key={exp.id}>
              {index > 0 && <View style={styles.classicDivider} />}
              <View style={{ marginBottom: 10 }}>
                <View style={styles.row}>
                  <Text style={styles.classicJobTitle}>
                    {exp.title}, {exp.company}
                    {exp.location && `, ${exp.location}`}
                  </Text>
                  <Text style={styles.classicDate}>
                    {formatDate(exp.startDate)} -{" "}
                    {exp.current ? "Present" : formatDate(exp.endDate)}
                  </Text>
                </View>
                {exp.description && (
                  <View style={styles.bulletList}>
                    {exp.description
                      .split("\n")
                      .filter((line) => line.trim())
                      .map((line, i) => (
                        <Text key={i} style={styles.classicBulletItem}>
                          • {line.replace(/^•\s*/, "")}
                        </Text>
                      ))}
                  </View>
                )}
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Education */}
      {resumeData.education.length > 0 && (
        <View style={styles.classicSection}>
          <Text style={styles.classicHeader}>Education</Text>
          {resumeData.education.map((edu, index) => (
            <View key={edu.id}>
              {index > 0 && <View style={styles.classicDivider} />}
              <View style={{ marginBottom: 8 }}>
                <View style={styles.row}>
                  <Text style={styles.classicEducationDegree}>
                    {edu.degree}, {edu.institution}
                    {edu.location && `, ${edu.location}`}
                  </Text>
                  <Text style={styles.classicDate}>
                    {edu.graduationDate ? formatDate(edu.graduationDate) : ""}
                  </Text>
                </View>
                {edu.gpa && (
                  <Text style={[styles.classicDate, { marginTop: 2 }]}>
                    GPA: {edu.gpa}
                  </Text>
                )}
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Skills */}
      {resumeData.skills.length > 0 && (
        <View style={styles.classicSection}>
          <Text style={styles.classicHeader}>Technical Skills</Text>
          <Text style={styles.classicSummaryText}>
            {resumeData.skills.join(" • ")}
          </Text>
        </View>
      )}

      {/* Certifications */}
      {resumeData.certifications.length > 0 && (
        <View style={styles.classicSection}>
          <Text style={styles.classicHeader}>Certifications</Text>
          <View style={styles.bulletList}>
            {resumeData.certifications.map((cert, i) => (
              <Text key={i} style={styles.classicBulletItem}>
                • {cert}
              </Text>
            ))}
          </View>
        </View>
      )}

      {/* Languages */}
      {resumeData.languages.length > 0 && (
        <View style={styles.classicSection}>
          <Text style={styles.classicHeader}>Languages</Text>
          <Text style={styles.classicSummaryText}>
            {resumeData.languages.join(", ")}
          </Text>
        </View>
      )}
    </Page>
  );

  const renderMinimalDesign = () => (
    <Page size="A4" style={styles.minimalPage}>
      {/* Header */}
      <View style={styles.minimalSection}>
        <Text style={styles.minimalName}>
          {resumeData.personalInfo.fullName || "YOUR NAME"}
        </Text>
        {resumeData.personalInfo.title && (
          <Text style={styles.minimalTitle}>
            {resumeData.personalInfo.title}
          </Text>
        )}
        <View style={styles.contactContainer}>
          {resumeData.personalInfo.email && (
            <Text style={styles.minimalContactItem}>
              {resumeData.personalInfo.email}
            </Text>
          )}
          {resumeData.personalInfo.phone && (
            <Text style={styles.minimalContactItem}>
              {resumeData.personalInfo.phone}
            </Text>
          )}
          {resumeData.personalInfo.location && (
            <Text style={styles.minimalContactItem}>
              {resumeData.personalInfo.location}
            </Text>
          )}
          {resumeData.personalInfo.linkedin && (
            <Text style={styles.minimalContactItem}>
              in/{resumeData.personalInfo.linkedin.split("/").pop()}
            </Text>
          )}
          {resumeData.personalInfo.website && (
            <Text style={styles.minimalContactItem}>
              {resumeData.personalInfo.website.replace(/^https?:\/\//, "")}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.minimalDivider} />

      {/* Summary */}
      {resumeData.summary && (
        <View style={styles.minimalSection}>
          <Text style={styles.minimalHeader}>Summary</Text>
          <Text style={styles.minimalSummaryText}>{resumeData.summary}</Text>
        </View>
      )}

      {/* Experience */}
      {resumeData.experience.length > 0 && (
        <View style={styles.minimalSection}>
          <Text style={styles.minimalHeader}>Experience</Text>
          {resumeData.experience.map((exp, index) => (
            <View key={exp.id}>
              {index > 0 && <View style={styles.minimalDivider} />}
              <View style={{ marginBottom: 8 }}>
                <View style={styles.row}>
                  <Text style={styles.minimalJobTitle}>{exp.title}</Text>
                  <Text style={styles.minimalDate}>
                    {formatDate(exp.startDate)} -{" "}
                    {exp.current ? "Present" : formatDate(exp.endDate)}
                  </Text>
                </View>
                <Text style={styles.minimalCompany}>
                  {exp.company}
                  {exp.location && ` • ${exp.location}`}
                </Text>
                {exp.description && (
                  <View style={styles.bulletList}>
                    {exp.description
                      .split("\n")
                      .filter((line) => line.trim())
                      .map((line, i) => (
                        <Text key={i} style={styles.minimalBulletItem}>
                          • {line.replace(/^•\s*/, "")}
                        </Text>
                      ))}
                  </View>
                )}
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Education */}
      {resumeData.education.length > 0 && (
        <View style={styles.minimalSection}>
          <Text style={styles.minimalHeader}>Education</Text>
          {resumeData.education.map((edu, index) => (
            <View key={edu.id}>
              {index > 0 && <View style={styles.minimalDivider} />}
              <View style={{ marginBottom: 6 }}>
                <View style={styles.row}>
                  <Text style={styles.minimalEducationDegree}>
                    {edu.degree}
                  </Text>
                  <Text style={styles.minimalDate}>
                    {edu.graduationDate ? formatDate(edu.graduationDate) : ""}
                  </Text>
                </View>
                <Text style={styles.minimalEducationInstitution}>
                  {edu.institution}
                  {edu.location && ` • ${edu.location}`}
                </Text>
                {edu.gpa && (
                  <Text style={[styles.minimalDate, { marginTop: 2 }]}>
                    GPA: {edu.gpa}
                  </Text>
                )}
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Skills */}
      {resumeData.skills.length > 0 && (
        <View style={styles.minimalSection}>
          <Text style={styles.minimalHeader}>Skills</Text>
          <Text style={styles.minimalSummaryText}>
            {resumeData.skills.join(" • ")}
          </Text>
        </View>
      )}

      {/* Certifications */}
      {resumeData.certifications.length > 0 && (
        <View style={styles.minimalSection}>
          <Text style={styles.minimalHeader}>Certifications</Text>
          <View style={styles.bulletList}>
            {resumeData.certifications.map((cert, i) => (
              <Text key={i} style={styles.minimalBulletItem}>
                • {cert}
              </Text>
            ))}
          </View>
        </View>
      )}

      {/* Languages */}
      {resumeData.languages.length > 0 && (
        <View style={styles.minimalSection}>
          <Text style={styles.minimalHeader}>Languages</Text>
          <Text style={styles.minimalSummaryText}>
            {resumeData.languages.join(", ")}
          </Text>
        </View>
      )}
    </Page>
  );

  return (
    <Document>
      {style === "classic" && renderClassicDesign()}
      {style === "modern" && renderModernDesign()}
      {style === "minimal" && renderMinimalDesign()}
    </Document>
  );
};

export default PDFResume;
