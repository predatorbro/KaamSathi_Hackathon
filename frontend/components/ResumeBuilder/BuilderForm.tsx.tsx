"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { FileText, Plus, X, Sparkles } from "lucide-react";

export interface ResumeData {
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    title: string; // Added title field
    linkedin: string;
    website: string;
  };
  summary: string;
  experience: Array<{
    id: string;
    title: string;
    company: string;
    location: string;
    startDate: string;
    endDate: string;
    description: string;
    current: boolean;
  }>;
  education: Array<{
    id: string;
    degree: string;
    institution: string;
    location: string;
    graduationDate: string;
    gpa: string;
  }>;
  skills: string[];
  languages: string[];
  certifications: string[];
}

interface BuilderFormProps {
  resumeData: ResumeData;
  setResumeData: (data: ResumeData) => void;
}

const defaultResumeData: ResumeData = {
  personalInfo: {
    fullName: "",
    email: "",
    phone: "",
    title: "", // Added title field
    location: "",
    linkedin: "",
    website: "",
  },
  summary: "",
  experience: [],
  education: [],
  skills: [],
  languages: [],
  certifications: [],
};

export default function BuilderForm({
  resumeData = defaultResumeData,
  setResumeData,
}: BuilderFormProps) {
  const [activeTab, setActiveTab] = useState("personal");
  const [newSkill, setNewSkill] = useState("");
  const [newLanguage, setNewLanguage] = useState("");
  const [newCertification, setNewCertification] = useState("");

  const addExperience = () => {
    const newExp = {
      id: Date.now().toString(),
      title: "",
      company: "",
      location: "",
      startDate: "",
      endDate: "",
      description: "",
      current: false,
    };
    setResumeData({
      ...resumeData,
      experience: [...resumeData.experience, newExp],
    });
  };

  const addEducation = () => {
    const newEdu = {
      id: Date.now().toString(),
      degree: "",
      institution: "",
      location: "",
      graduationDate: "",
      gpa: "",
    };
    setResumeData({
      ...resumeData,
      education: [...resumeData.education, newEdu],
    });
  };

  const addSkill = () => {
    if (newSkill.trim()) {
      setResumeData({
        ...resumeData,
        skills: [...resumeData.skills, newSkill.trim()],
      });
      setNewSkill("");
    }
  };

  const addLanguage = () => {
    if (newLanguage.trim()) {
      setResumeData({
        ...resumeData,
        languages: [...resumeData.languages, newLanguage.trim()],
      });
      setNewLanguage("");
    }
  };

  const addCertification = () => {
    if (newCertification.trim()) {
      setResumeData({
        ...resumeData,
        certifications: [...resumeData.certifications, newCertification.trim()],
      });
      setNewCertification("");
    }
  };

  const removeSkill = (index: number) => {
    setResumeData({
      ...resumeData,
      skills: resumeData.skills.filter((_, i) => i !== index),
    });
  };

  const removeLanguage = (index: number) => {
    setResumeData({
      ...resumeData,
      languages: resumeData.languages.filter((_, i) => i !== index),
    });
  };

  const removeCertification = (index: number) => {
    setResumeData({
      ...resumeData,
      certifications: resumeData.certifications.filter((_, i) => i !== index),
    });
  };

  const tabs = [
    { id: "personal", label: "Personal Info" },
    { id: "summary", label: "Summary" },
    { id: "experience", label: "Experience" },
    { id: "education", label: "Education" },
    { id: "skills", label: "Skills" },
  ];

  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle className="flex items-center space-x-2">
          <FileText className="h-5 w-5" />
          <span>Resume Details</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="flex flex-wrap border-b border-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {/* Personal Info Tab */}
          {activeTab === "personal" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    value={resumeData.personalInfo.fullName}
                    onChange={(e) =>
                      setResumeData({
                        ...resumeData,
                        personalInfo: {
                          ...resumeData.personalInfo,
                          fullName: e.target.value,
                        },
                      })
                    }
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <Label htmlFor="title">Professional Title</Label>
                  <Input
                    id="title"
                    value={resumeData.personalInfo.title}
                    onChange={(e) =>
                      setResumeData({
                        ...resumeData,
                        personalInfo: {
                          ...resumeData.personalInfo,
                          title: e.target.value,
                        },
                      })
                    }
                    placeholder="Software Engineer"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={resumeData.personalInfo.email}
                    onChange={(e) =>
                      setResumeData({
                        ...resumeData,
                        personalInfo: {
                          ...resumeData.personalInfo,
                          email: e.target.value,
                        },
                      })
                    }
                    placeholder="john@example.com"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={resumeData.personalInfo.phone}
                    onChange={(e) =>
                      setResumeData({
                        ...resumeData,
                        personalInfo: {
                          ...resumeData.personalInfo,
                          phone: e.target.value,
                        },
                      })
                    }
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={resumeData.personalInfo.location}
                    onChange={(e) =>
                      setResumeData({
                        ...resumeData,
                        personalInfo: {
                          ...resumeData.personalInfo,
                          location: e.target.value,
                        },
                      })
                    }
                    placeholder="New York, NY"
                  />
                </div>
                <div>
                  <Label htmlFor="linkedin">LinkedIn</Label>
                  <Input
                    id="linkedin"
                    value={resumeData.personalInfo.linkedin}
                    onChange={(e) =>
                      setResumeData({
                        ...resumeData,
                        personalInfo: {
                          ...resumeData.personalInfo,
                          linkedin: e.target.value,
                        },
                      })
                    }
                    placeholder="linkedin.com/in/username"
                  />
                </div>
                <div>
                  <Label htmlFor="website">Website/Portfolio</Label>
                  <Input
                    id="website"
                    value={resumeData.personalInfo.website}
                    onChange={(e) =>
                      setResumeData({
                        ...resumeData,
                        personalInfo: {
                          ...resumeData.personalInfo,
                          website: e.target.value,
                        },
                      })
                    }
                    placeholder="yourwebsite.com"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Summary Tab */}
          {activeTab === "summary" && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="summary">Professional Summary *</Label>
                <Textarea
                  id="summary"
                  rows={6}
                  placeholder="Experienced software engineer with 5+ years in web development..."
                  value={resumeData.summary}
                  onChange={(e) =>
                    setResumeData({
                      ...resumeData,
                      summary: e.target.value,
                    })
                  }
                />
                <p className="text-xs text-gray-500 mt-1">
                  Write 2-4 sentences about your professional background and key
                  skills.
                </p>
              </div>
              <Button variant="outline" className="w-full bg-transparent">
                <Sparkles className="h-4 w-4 mr-2" />
                Generate with AI
              </Button>
            </div>
          )}

          {/* Experience Tab */}
          {activeTab === "experience" && (
            <div className="space-y-4">
              {resumeData.experience.length === 0 && (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <p className="text-gray-500">No experience added yet</p>
                  <Button onClick={addExperience} className="mt-4">
                    Add Your First Experience
                  </Button>
                </div>
              )}

              {resumeData.experience.map((exp, index) => (
                <Card key={exp.id} className="border-gray-200">
                  <CardContent className="pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <Label>Job Title *</Label>
                        <Input
                          value={exp.title}
                          onChange={(e) => {
                            const newExp = [...resumeData.experience];
                            newExp[index].title = e.target.value;
                            setResumeData({
                              ...resumeData,
                              experience: newExp,
                            });
                          }}
                          placeholder="Software Engineer"
                        />
                      </div>
                      <div>
                        <Label>Company *</Label>
                        <Input
                          value={exp.company}
                          onChange={(e) => {
                            const newExp = [...resumeData.experience];
                            newExp[index].company = e.target.value;
                            setResumeData({
                              ...resumeData,
                              experience: newExp,
                            });
                          }}
                          placeholder="Google"
                        />
                      </div>
                      <div>
                        <Label>Location</Label>
                        <Input
                          value={exp.location}
                          onChange={(e) => {
                            const newExp = [...resumeData.experience];
                            newExp[index].location = e.target.value;
                            setResumeData({
                              ...resumeData,
                              experience: newExp,
                            });
                          }}
                          placeholder="Remote"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label>Start Date *</Label>
                          <Input
                            type="month"
                            value={exp.startDate}
                            onChange={(e) => {
                              const newExp = [...resumeData.experience];
                              newExp[index].startDate = e.target.value;
                              setResumeData({
                                ...resumeData,
                                experience: newExp,
                              });
                            }}
                          />
                        </div>
                        <div>
                          <Label>End Date</Label>
                          <Input
                            type="month"
                            value={exp.endDate}
                            onChange={(e) => {
                              const newExp = [...resumeData.experience];
                              newExp[index].endDate = e.target.value;
                              setResumeData({
                                ...resumeData,
                                experience: newExp,
                              });
                            }}
                            disabled={exp.current}
                            placeholder="Present"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 mb-4">
                      <input
                        type="checkbox"
                        id={`current-${exp.id}`}
                        checked={exp.current}
                        onChange={(e) => {
                          const newExp = [...resumeData.experience];
                          newExp[index].current = e.target.checked;
                          if (e.target.checked) {
                            newExp[index].endDate = "";
                          }
                          setResumeData({ ...resumeData, experience: newExp });
                        }}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <Label htmlFor={`current-${exp.id}`}>
                        I currently work here
                      </Label>
                    </div>
                    <div>
                      <Label>Description *</Label>
                      <Textarea
                        rows={4}
                        value={exp.description}
                        onChange={(e) => {
                          const newExp = [...resumeData.experience];
                          newExp[index].description = e.target.value;
                          setResumeData({ ...resumeData, experience: newExp });
                        }}
                        placeholder="Describe your responsibilities and achievements..."
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Use bullet points for better readability (e.g., •
                        Developed new features...)
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {resumeData.experience.length > 0 && (
                <Button
                  onClick={addExperience}
                  variant="outline"
                  className="w-full bg-transparent"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Another Experience
                </Button>
              )}
            </div>
          )}

          {/* Education Tab */}
          {activeTab === "education" && (
            <div className="space-y-4">
              {resumeData.education.length === 0 && (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <p className="text-gray-500">No education added yet</p>
                  <Button onClick={addEducation} className="mt-4">
                    Add Your First Education
                  </Button>
                </div>
              )}

              {resumeData.education.map((edu, index) => (
                <Card key={edu.id} className="border-gray-200">
                  <CardContent className="pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Degree *</Label>
                        <Input
                          value={edu.degree}
                          onChange={(e) => {
                            const newEdu = [...resumeData.education];
                            newEdu[index].degree = e.target.value;
                            setResumeData({ ...resumeData, education: newEdu });
                          }}
                          placeholder="Bachelor of Science in Computer Science"
                        />
                      </div>
                      <div>
                        <Label>Institution *</Label>
                        <Input
                          value={edu.institution}
                          onChange={(e) => {
                            const newEdu = [...resumeData.education];
                            newEdu[index].institution = e.target.value;
                            setResumeData({ ...resumeData, education: newEdu });
                          }}
                          placeholder="Stanford University"
                        />
                      </div>
                      <div>
                        <Label>Location</Label>
                        <Input
                          value={edu.location}
                          onChange={(e) => {
                            const newEdu = [...resumeData.education];
                            newEdu[index].location = e.target.value;
                            setResumeData({ ...resumeData, education: newEdu });
                          }}
                          placeholder="Stanford, CA"
                        />
                      </div>
                      <div>
                        <Label>Graduation Date *</Label>
                        <Input
                          type="month"
                          value={edu.graduationDate}
                          onChange={(e) => {
                            const newEdu = [...resumeData.education];
                            newEdu[index].graduationDate = e.target.value;
                            setResumeData({ ...resumeData, education: newEdu });
                          }}
                        />
                      </div>
                      <div>
                        <Label>GPA (Optional)</Label>
                        <Input
                          value={edu.gpa}
                          onChange={(e) => {
                            const newEdu = [...resumeData.education];
                            newEdu[index].gpa = e.target.value;
                            setResumeData({ ...resumeData, education: newEdu });
                          }}
                          placeholder="3.8"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {resumeData.education.length > 0 && (
                <Button
                  onClick={addEducation}
                  variant="outline"
                  className="w-full bg-transparent"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Another Education
                </Button>
              )}
            </div>
          )}

          {/* Skills Tab */}
          {activeTab === "skills" && (
            <div className="space-y-6">
              <div>
                <Label>Skills *</Label>
                <div className="flex space-x-2 mt-2">
                  <Input
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    placeholder="Add a skill (e.g., React, Project Management)"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addSkill();
                      }
                    }}
                  />
                  <Button onClick={addSkill}>Add</Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {resumeData.skills.map((skill, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="flex items-center space-x-1"
                    >
                      <span>{skill}</span>
                      <button
                        onClick={() => removeSkill(index)}
                        className="ml-1"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                {resumeData.skills.length === 0 && (
                  <p className="text-sm text-gray-500 mt-2">
                    Add at least 5 key skills relevant to your field
                  </p>
                )}
              </div>

              <div>
                <Label>Languages</Label>
                <div className="flex space-x-2 mt-2">
                  <Input
                    value={newLanguage}
                    onChange={(e) => setNewLanguage(e.target.value)}
                    placeholder="Add a language (e.g., English, Spanish)"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addLanguage();
                      }
                    }}
                  />
                  <Button onClick={addLanguage}>Add</Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {resumeData.languages.map((language, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="flex items-center space-x-1"
                    >
                      <span>{language}</span>
                      <button
                        onClick={() => removeLanguage(index)}
                        className="ml-1"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <Label>Certifications (Optional)</Label>
                <div className="flex space-x-2 mt-2">
                  <Input
                    value={newCertification}
                    onChange={(e) => setNewCertification(e.target.value)}
                    placeholder="Add a certification (e.g., AWS Certified)"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addCertification();
                      }
                    }}
                  />
                  <Button onClick={addCertification}>Add</Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {resumeData.certifications.map((certification, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="flex items-center space-x-1"
                    >
                      <span>{certification}</span>
                      <button
                        onClick={() => removeCertification(index)}
                        className="ml-1"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
