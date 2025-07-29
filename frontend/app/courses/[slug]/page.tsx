"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { BookOpen, Clock, Users, Star, Play, CheckCircle, Award, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { useParams } from "next/navigation"

// Mock course data - in real app, this would come from API
const getCourseData = (slug: string) => {
  const courses = {
    "digital-literacy": {
      id: "digital-literacy",
      title: "Digital Literacy for Modern Workplace",
      description:
        "Master essential digital skills including computer basics, internet usage, and office software to thrive in today's digital workplace.",
      instructor: {
        name: "Rajesh Sharma",
        bio: "Senior IT Trainer with 10+ years of experience in corporate training",
        avatar: "/placeholder.svg?height=100&width=100",
        rating: 4.9,
        students: 5000,
      },
      duration: "4 weeks",
      level: "Beginner" as const,
      category: "Technology",
      price: 0,
      rating: 4.8,
      students: 1250,
      image: "/placeholder.svg?height=400&width=600",
      tags: ["Computer Skills", "Office Software", "Internet"],
      whatYouLearn: [
        "Computer fundamentals and operating systems",
        "Internet browsing and email management",
        "Microsoft Office Suite (Word, Excel, PowerPoint)",
        "File management and cloud storage",
        "Online communication tools",
        "Digital security and privacy basics",
      ],
      curriculum: [
        {
          week: 1,
          title: "Computer Fundamentals",
          lessons: [
            "Introduction to Computers and Operating Systems",
            "File Management and Organization",
            "Basic Troubleshooting",
          ],
        },
        {
          week: 2,
          title: "Internet and Communication",
          lessons: ["Web Browsing and Search Techniques", "Email Setup and Management", "Online Communication Tools"],
        },
        {
          week: 3,
          title: "Microsoft Office Basics",
          lessons: ["Word Processing with Microsoft Word", "Spreadsheets with Excel", "Presentations with PowerPoint"],
        },
        {
          week: 4,
          title: "Digital Security and Cloud",
          lessons: ["Online Security and Privacy", "Cloud Storage and Collaboration", "Final Project and Assessment"],
        },
      ],
      requirements: ["Basic computer access", "Willingness to learn", "No prior experience required"],
      reviews: [
        {
          name: "Sita Gurung",
          rating: 5,
          comment: "Excellent course for beginners. Very clear explanations and practical examples.",
          date: "2 weeks ago",
        },
        {
          name: "Ram Bahadur",
          rating: 5,
          comment: "This course helped me get comfortable with computers. Now I can use office software confidently.",
          date: "1 month ago",
        },
      ],
    },
  }

  return courses[slug as keyof typeof courses] || null
}

export default function CourseDetailPage() {
  const params = useParams()
  const slug = params.slug as string
  const course = getCourseData(slug)
  const [isEnrolled, setIsEnrolled] = useState(false)

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Course Not Found</h1>
          <p className="text-gray-600 mb-4">The course you're looking for doesn't exist.</p>
          <Button asChild>
            <Link href="/courses">Back to Courses</Link>
          </Button>
        </div>
      </div>
    )
  }

  const handleEnroll = () => {
    setIsEnrolled(true)
    // In real app, this would make API call to enroll user
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <Button asChild variant="ghost" className="mb-6">
            <Link href="/courses">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Courses
            </Link>
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Course Header */}
              <Card>
                <div className="aspect-video bg-gray-200 rounded-t-lg overflow-hidden">
                  <img
                    src={course.image || "/placeholder.svg"}
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardHeader>
                  <div className="flex items-center space-x-2 mb-2">
                    <Badge variant="secondary">{course.level}</Badge>
                    <Badge variant="outline">{course.category}</Badge>
                  </div>
                  <CardTitle className="text-2xl">{course.title}</CardTitle>
                  <CardDescription className="text-base">{course.description}</CardDescription>

                  <div className="flex items-center space-x-6 pt-4">
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="font-medium">{course.rating}</span>
                      <span className="text-gray-600">({course.students.toLocaleString()} students)</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4 text-gray-600" />
                      <span>{course.duration}</span>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              {/* Course Content Tabs */}
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
                  <TabsTrigger value="instructor">Instructor</TabsTrigger>
                  <TabsTrigger value="reviews">Reviews</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>What You'll Learn</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {course.whatYouLearn.map((item, index) => (
                          <div key={index} className="flex items-start space-x-2">
                            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700">{item}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Requirements</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {course.requirements.map((req, index) => (
                          <li key={index} className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                            <span className="text-gray-700">{req}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="curriculum">
                  <Card>
                    <CardHeader>
                      <CardTitle>Course Curriculum</CardTitle>
                      <CardDescription>
                        {course.curriculum.length} weeks •{" "}
                        {course.curriculum.reduce((acc, week) => acc + week.lessons.length, 0)} lessons
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {course.curriculum.map((week) => (
                        <div key={week.week} className="border border-gray-200 rounded-lg p-4">
                          <h3 className="font-semibold text-gray-900 mb-3">
                            Week {week.week}: {week.title}
                          </h3>
                          <div className="space-y-2">
                            {week.lessons.map((lesson, index) => (
                              <div key={index} className="flex items-center space-x-3 text-gray-700">
                                <Play className="h-4 w-4 text-gray-400" />
                                <span>{lesson}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="instructor">
                  <Card>
                    <CardHeader>
                      <CardTitle>Meet Your Instructor</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-start space-x-4">
                        <Avatar className="w-16 h-16">
                          <AvatarImage src={course.instructor.avatar || "/placeholder.svg"} />
                          <AvatarFallback>
                            {course.instructor.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-gray-900">{course.instructor.name}</h3>
                          <p className="text-gray-600 mb-3">{course.instructor.bio}</p>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <div className="flex items-center space-x-1">
                              <Star className="h-4 w-4 text-yellow-400 fill-current" />
                              <span>{course.instructor.rating} rating</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Users className="h-4 w-4" />
                              <span>{course.instructor.students.toLocaleString()} students</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="reviews">
                  <Card>
                    <CardHeader>
                      <CardTitle>Student Reviews</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {course.reviews.map((review, index) => (
                        <div key={index} className="border-b border-gray-200 pb-4 last:border-b-0">
                          <div className="flex items-center space-x-2 mb-2">
                            <div className="flex">
                              {[...Array(review.rating)].map((_, i) => (
                                <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                              ))}
                            </div>
                            <span className="font-medium">{review.name}</span>
                            <span className="text-gray-500 text-sm">{review.date}</span>
                          </div>
                          <p className="text-gray-700">{review.comment}</p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card className="sticky top-8">
                <CardContent className="pt-6">
                  <div className="text-center mb-6">
                    {course.price === 0 ? (
                      <div className="text-3xl font-bold text-green-600 mb-2">Free</div>
                    ) : (
                      <div className="text-3xl font-bold text-gray-900 mb-2">NPR {course.price.toLocaleString()}</div>
                    )}
                  </div>

                  {isEnrolled ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-center space-x-2 text-green-600 bg-green-50 p-3 rounded-lg">
                        <CheckCircle className="h-5 w-5" />
                        <span className="font-medium">Enrolled Successfully!</span>
                      </div>
                      <Button className="w-full bg-gray-800 hover:bg-gray-700">
                        <Play className="h-4 w-4 mr-2" />
                        Start Learning
                      </Button>
                    </div>
                  ) : (
                    <Button onClick={handleEnroll} className="w-full bg-gray-800 hover:bg-gray-700 mb-4">
                      <BookOpen className="h-4 w-4 mr-2" />
                      {course.price === 0 ? "Enroll Free" : "Enroll Now"}
                    </Button>
                  )}

                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Duration:</span>
                      <span className="font-medium">{course.duration}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Level:</span>
                      <span className="font-medium">{course.level}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Students:</span>
                      <span className="font-medium">{course.students.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Certificate:</span>
                      <div className="flex items-center space-x-1">
                        <Award className="h-4 w-4 text-yellow-500" />
                        <span className="font-medium">Yes</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Course Tags</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {course.tags.map((tag, index) => (
                      <Badge key={index} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
