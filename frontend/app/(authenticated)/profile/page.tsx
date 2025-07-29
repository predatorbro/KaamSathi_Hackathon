"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User, MapPin, Mail, Phone, Globe, Linkedin, Edit, Download, Briefcase, GraduationCap } from "lucide-react"
import { motion } from "framer-motion"
import { storage } from "@/lib/storage"
import Link from "next/link"

export default function ProfilePage() {
  const [resumeData, setResumeData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const data = storage.getResumeData()
    setResumeData(data)
    setLoading(false)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-800"></div>
      </div>
    )
  }

  if (!resumeData || !resumeData.personalInfo?.fullName) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="text-center py-12">
            <CardContent>
              <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Complete Your Profile</h2>
              <p className="text-gray-600 mb-6">Create your resume first to build your professional profile</p>
              <Button asChild className="bg-gray-800 hover:bg-gray-700">
                <Link href="/resume/classic">Build Resume</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const { personalInfo, summary, experience, education, skills, languages } = resumeData

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Banner Section */}
      <div className="relative h-48 bg-gradient-to-r from-gray-800 to-gray-600">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-end pb-6">
          <div className="flex items-end space-x-6">
            <Avatar className="w-32 h-32 border-4 border-white shadow-lg">
              <AvatarImage src="/placeholder.svg?height=128&width=128" />
              <AvatarFallback className="text-2xl bg-white text-gray-800">
                {getInitials(personalInfo.fullName)}
              </AvatarFallback>
            </Avatar>
            <div className="pb-4">
              <h1 className="text-3xl font-bold text-white mb-2"> HI, {personalInfo.fullName}</h1>
              <div className="flex items-center space-x-4 text-gray-200">
                {personalInfo.location && (
                  <div className="flex items-center space-x-1">
                    <MapPin className="h-4 w-4" />
                    <span>{personalInfo.location}</span>
                  </div>
                )}
                {personalInfo.email && (
                  <div className="flex items-center space-x-1">
                    <Mail className="h-4 w-4" />
                    <span>{personalInfo.email}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      
    </div>
  )
}
