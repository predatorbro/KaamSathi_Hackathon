"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { SwipeCard } from "@/components/swipe-card"
import { Undo2, ArrowLeft } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"
import { useMobile } from "@/hooks/use-mobile"

// Mock job applications data (same as before)
const mockApplications = [
  {
    id: "1",
    jobTitle: "Grocery Store Helper",
    applicant: {
      name: "Krishna Tamang",
      avatar: "/placeholder.svg?height=100&width=100",
      rating: 4.7,
      phone: "+977-9841111111",
      email: "krishna.tamang@email.com",
      location: "Thamel, Kathmandu",
      experience: "2 years in retail",
      skills: ["Customer Service", "Organization", "Physical Work"],
      bio: "Hardworking individual with experience in retail and customer service. Available for part-time work.",
      availability: "Immediate",
      expectedPayment: "NPR 1,500/day",
      previousJobs: 12,
      completionRate: 95,
      image: "/placeholder.svg?height=200&width=400&text=Krishna+Profile",
    },
    appliedTime: "2 hours ago",
    status: "pending",
  },
  {
    id: "2",
    jobTitle: "Plumber for Pipe Repair",
    applicant: {
      name: "Bikash Shrestha",
      avatar: "/placeholder.svg?height=100&width=100",
      rating: 4.9,
      phone: "+977-9851111111",
      email: "bikash.plumber@email.com",
      location: "Lalitpur, Nepal",
      experience: "5 years plumbing experience",
      skills: ["Plumbing", "Pipe Repair", "Tools", "Emergency Repair"],
      bio: "Professional plumber with 5 years of experience. Specializes in emergency repairs and installations.",
      availability: "Today",
      expectedPayment: "NPR 2,000",
      previousJobs: 45,
      completionRate: 98,
      image: "/placeholder.svg?height=200&width=400&text=Bikash+Profile",
    },
    appliedTime: "1 hour ago",
    status: "pending",
  },
]

// Mock available workers data (same as before)
const mockWorkers = [
  {
    id: "1",
    name: "Suman Rai",
    avatar: "/placeholder.svg?height=100&width=100",
    rating: 4.6,
    phone: "+977-9861111111",
    email: "suman.rai@email.com",
    location: "Baneshwor, Kathmandu",
    profession: "Delivery Person",
    experience: "3 years delivery experience",
    skills: ["Motorcycle", "Driving License", "Time Management", "Customer Service"],
    bio: "Experienced delivery person with own motorcycle. Available for food delivery, package delivery, and courier services.",
    availability: "Available Now",
    hourlyRate: "NPR 300/hour",
    previousJobs: 28,
    completionRate: 92,
    image: "/placeholder.svg?height=200&width=400&text=Suman+Profile",
    type: "Delivery",
    urgent: false,
  },
  {
    id: "2",
    name: "Maya Gurung",
    avatar: "/placeholder.svg?height=100&width=100",
    rating: 4.8,
    phone: "+977-9871111111",
    email: "maya.babysitter@email.com",
    location: "Boudha, Kathmandu",
    profession: "Babysitter",
    experience: "4 years childcare experience",
    skills: ["Childcare", "First Aid", "Cooking", "Patience"],
    bio: "Experienced babysitter and nanny. Great with children of all ages. First aid certified and very reliable.",
    availability: "Available Today",
    hourlyRate: "NPR 400/hour",
    previousJobs: 35,
    completionRate: 97,
    image: "/placeholder.svg?height=200&width=400&text=Maya+Profile",
    type: "Childcare",
    urgent: false,
  },
  {
    id: "3",
    name: "Ramesh Karki",
    avatar: "/placeholder.svg?height=100&width=100",
    rating: 4.5,
    phone: "+977-9881111111",
    email: "ramesh.cleaner@email.com",
    location: "Patan, Lalitpur",
    profession: "House Cleaner",
    experience: "6 years cleaning experience",
    skills: ["Deep Cleaning", "Organization", "Attention to Detail", "Reliability"],
    bio: "Professional house cleaner with extensive experience in residential cleaning. Thorough and reliable work.",
    availability: "Available Tomorrow",
    hourlyRate: "NPR 350/hour",
    previousJobs: 52,
    completionRate: 94,
    image: "/placeholder.svg?height=200&width=400&text=Ramesh+Profile",
    type: "Cleaning",
    urgent: false,
  },
]

export default function RemoteJobsAdminPanel() {
  const isMobile = useMobile()
  const [applications, setApplications] = useState(mockApplications)
  const [workers, setWorkers] = useState(mockWorkers)
  const [currentApplicationIndex, setCurrentApplicationIndex] = useState(0)
  const [currentWorkerIndex, setCurrentWorkerIndex] = useState(0)
  const [rejectedApplications, setRejectedApplications] = useState<any[]>([])
  const [rejectedWorkers, setRejectedWorkers] = useState<any[]>([])

  const getCardName = (card: any) => {
    if (card?.applicant?.name) return card.applicant.name
    if (card?.title) return card.title
    if (card?.name) return card.name
    return "Person"
  }

  const handleApplicationSwipe = (direction: "left" | "right" | "up", application: any) => {
    if (direction === "up") {
      toast.info(`Viewing ${getCardName(application)}'s full profile`)
      return
    }

    if (direction === "left") {
      setRejectedApplications((prev) => [...prev, { application, index: currentApplicationIndex }])
      toast.info(`Rejected ${getCardName(application)}`)
    } else if (direction === "right") {
      toast.success(`Accepted ${getCardName(application)}!`)
    }

    setCurrentApplicationIndex((prev) => prev + 1)
  }

  const handleWorkerSwipe = (direction: "left" | "right" | "up", worker: any) => {
    if (direction === "up") {
      toast.info(`Viewing ${worker.name}'s full profile`)
      return
    }

    if (direction === "left") {
      setRejectedWorkers((prev) => [...prev, { worker, index: currentWorkerIndex }])
      toast.info(`Passed on ${worker.name}`)
    } else if (direction === "right") {
      toast.success(`Contacted ${worker.name} for work!`)
    }

    setCurrentWorkerIndex((prev) => prev + 1)
  }

  const handleUndoApplication = () => {
    if (rejectedApplications.length > 0) {
      const lastRejected = rejectedApplications[rejectedApplications.length - 1]
      setCurrentApplicationIndex(lastRejected.index)
      setRejectedApplications((prev) => prev.slice(0, -1))
      toast.success("Undone! Application restored.")
    }
  }

  const handleUndoWorker = () => {
    if (rejectedWorkers.length > 0) {
      const lastRejected = rejectedWorkers[rejectedWorkers.length - 1]
      setCurrentWorkerIndex(lastRejected.index)
      setRejectedWorkers((prev) => prev.slice(0, -1))
      toast.success("Undone! Worker restored.")
    }
  }

  const currentApplication = applications[currentApplicationIndex]
  const nextApplication = applications[currentApplicationIndex + 1]
  const currentWorker = workers[currentWorkerIndex]
  const nextWorker = workers[currentWorkerIndex + 1]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      {isMobile && (
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center space-x-3 mb-2">
            <Button variant="ghost" size="sm" onClick={() => window.history.back()} className="p-1">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
          </div>
          <p className="text-gray-600 text-sm">Manage applications and find workers</p>
        </div>
      )}

      <div className={`${isMobile ? "" : "py-8"}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {!isMobile && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-8"
            >
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Job Poster Dashboard</h1>
              <p className="text-gray-600">Manage your job applications and find available workers</p>
            </motion.div>
          )}

          <Tabs defaultValue="applications" className="w-full">
            <TabsList className={`grid w-full grid-cols-2 ${isMobile ? "mx-4 mb-4" : ""}`}>
              <TabsTrigger value="applications" className="text-sm">
                Job Applications
              </TabsTrigger>
              <TabsTrigger value="workers" className="text-sm">
                Available Workers
              </TabsTrigger>
            </TabsList>

            <TabsContent value="applications" className="space-y-6">
              <div className={`grid grid-cols-1 ${isMobile ? "" : "lg:grid-cols-4"} gap-4 lg:gap-8`}>
                {/* Stats Sidebar */}
                {!isMobile && (
                  <div className="lg:col-span-1">
                    <Card>
                      <CardHeader>
                        <CardTitle>Application Stats</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total Applications:</span>
                          <span className="font-medium">{applications.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Reviewed:</span>
                          <span className="font-medium">{currentApplicationIndex}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Pending:</span>
                          <span className="font-medium">{applications.length - currentApplicationIndex}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Rejected:</span>
                          <span className="font-medium">{rejectedApplications.length}</span>
                        </div>
                      </CardContent>
                    </Card>

                    {rejectedApplications.length > 0 && (
                      <Card className="mt-4">
                        <CardContent className="pt-6">
                          <Button onClick={handleUndoApplication} variant="outline" className="w-full bg-transparent">
                            <Undo2 className="h-4 w-4 mr-2" />
                            Undo Last ({rejectedApplications.length})
                          </Button>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                )}

                {/* Applications Swipe Area */}
                <div className={`${isMobile ? "" : "lg:col-span-3"}`}>
                  {/* Mobile Stats */}
                  {isMobile && (
                    <div className="grid grid-cols-2 gap-4 mb-4 px-4">
                      <Card>
                        <CardContent className="p-3 text-center">
                          <div className="text-lg font-bold text-gray-900">{applications.length}</div>
                          <div className="text-xs text-gray-600">Total</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-3 text-center">
                          <div className="text-lg font-bold text-gray-900">{currentApplicationIndex}</div>
                          <div className="text-xs text-gray-600">Reviewed</div>
                        </CardContent>
                      </Card>
                    </div>
                  )}

                  <div
                    className={`relative ${isMobile ? "h-[calc(100vh-200px)]" : "h-[600px]"} ${isMobile ? "px-4" : "max-w-md mx-auto"}`}
                  >
                    {currentApplicationIndex >= applications.length ? (
                      <Card className="h-full flex items-center justify-center">
                        <CardContent className="text-center p-6">
                          <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-2">
                            All Applications Reviewed!
                          </h3>
                          <p className="text-gray-600 text-sm sm:text-base">You've reviewed all job applications.</p>
                        </CardContent>
                      </Card>
                    ) : (
                      <AnimatePresence>
                        {nextApplication && (
                          <SwipeCard
                            key={`${nextApplication.id}-next`}
                            job={{
                              ...nextApplication.applicant,
                              title: nextApplication.applicant.name,
                              location: nextApplication.applicant.location,
                              payment: nextApplication.applicant.expectedPayment,
                              duration: nextApplication.applicant.availability,
                              description: nextApplication.applicant.bio,
                              poster: `Applied for: ${nextApplication.jobTitle}`,
                              rating: nextApplication.applicant.rating,
                              skills: nextApplication.applicant.skills,
                              postedTime: nextApplication.appliedTime,
                              applicants: nextApplication.applicant.previousJobs,
                              image: nextApplication.applicant.image,
                              posterAvatar: nextApplication.applicant.avatar,
                            }}
                            onSwipe={handleApplicationSwipe}
                            isTop={false}
                            isMobile={isMobile}
                          />
                        )}
                        {currentApplication && (
                          <SwipeCard
                            key={`${currentApplication.id}-current`}
                            job={{
                              ...currentApplication.applicant,
                              title: currentApplication.applicant.name,
                              location: currentApplication.applicant.location,
                              payment: currentApplication.applicant.expectedPayment,
                              duration: currentApplication.applicant.availability,
                              description: currentApplication.applicant.bio,
                              poster: `Applied for: ${currentApplication.jobTitle}`,
                              rating: currentApplication.applicant.rating,
                              skills: currentApplication.applicant.skills,
                              postedTime: currentApplication.appliedTime,
                              applicants: currentApplication.applicant.previousJobs,
                              image: currentApplication.applicant.image,
                              posterAvatar: currentApplication.applicant.avatar,
                            }}
                            onSwipe={handleApplicationSwipe}
                            isTop={true}
                            isMobile={isMobile}
                          />
                        )}
                      </AnimatePresence>
                    )}
                  </div>

                  {/* Mobile Undo Button */}
                  {isMobile && rejectedApplications.length > 0 && (
                    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-30">
                      <Button
                        onClick={handleUndoApplication}
                        variant="outline"
                        className="rounded-full bg-white/90 backdrop-blur-sm border-gray-300 px-4"
                      >
                        <Undo2 className="h-4 w-4 mr-2" />
                        Undo ({rejectedApplications.length})
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="workers" className="space-y-6">
              <div className={`grid grid-cols-1 ${isMobile ? "" : "lg:grid-cols-4"} gap-4 lg:gap-8`}>
                {/* Stats Sidebar */}
                {!isMobile && (
                  <div className="lg:col-span-1">
                    <Card>
                      <CardHeader>
                        <CardTitle>Worker Stats</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Available Workers:</span>
                          <span className="font-medium">{workers.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Viewed:</span>
                          <span className="font-medium">{currentWorkerIndex}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Contacted:</span>
                          <span className="font-medium">0</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Rejected:</span>
                          <span className="font-medium">{rejectedWorkers.length}</span>
                        </div>
                      </CardContent>
                    </Card>

                    {rejectedWorkers.length > 0 && (
                      <Card className="mt-4">
                        <CardContent className="pt-6">
                          <Button onClick={handleUndoWorker} variant="outline" className="w-full bg-transparent">
                            <Undo2 className="h-4 w-4 mr-2" />
                            Undo Last ({rejectedWorkers.length})
                          </Button>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                )}

                {/* Workers Swipe Area */}
                <div className={`${isMobile ? "" : "lg:col-span-3"}`}>
                  {/* Mobile Stats */}
                  {isMobile && (
                    <div className="grid grid-cols-2 gap-4 mb-4 px-4">
                      <Card>
                        <CardContent className="p-3 text-center">
                          <div className="text-lg font-bold text-gray-900">{workers.length}</div>
                          <div className="text-xs text-gray-600">Available</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-3 text-center">
                          <div className="text-lg font-bold text-gray-900">{currentWorkerIndex}</div>
                          <div className="text-xs text-gray-600">Viewed</div>
                        </CardContent>
                      </Card>
                    </div>
                  )}

                  <div
                    className={`relative ${isMobile ? "h-[calc(100vh-200px)]" : "h-[600px]"} ${isMobile ? "px-4" : "max-w-md mx-auto"}`}
                  >
                    {currentWorkerIndex >= workers.length ? (
                      <Card className="h-full flex items-center justify-center">
                        <CardContent className="text-center p-6">
                          <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-2">All Workers Viewed!</h3>
                          <p className="text-gray-600 text-sm sm:text-base">You've seen all available workers.</p>
                        </CardContent>
                      </Card>
                    ) : (
                      <AnimatePresence>
                        {nextWorker && (
                          <SwipeCard
                            key={`${nextWorker.id}-next`}
                            job={{
                              ...nextWorker,
                              title: `${nextWorker.profession} - ${nextWorker.name}`,
                              location: nextWorker.location,
                              payment: nextWorker.hourlyRate,
                              duration: nextWorker.availability,
                              description: nextWorker.bio,
                              poster: `${nextWorker.experience}`,
                              rating: nextWorker.rating,
                              skills: nextWorker.skills,
                              postedTime: "Available now",
                              applicants: nextWorker.previousJobs,
                              image: nextWorker.image,
                              posterAvatar: nextWorker.avatar,
                            }}
                            onSwipe={handleWorkerSwipe}
                            isTop={false}
                            isMobile={isMobile}
                          />
                        )}
                        {currentWorker && (
                          <SwipeCard
                            key={`${currentWorker.id}-current`}
                            job={{
                              ...currentWorker,
                              title: `${currentWorker.profession} - ${currentWorker.name}`,
                              location: currentWorker.location,
                              payment: currentWorker.hourlyRate,
                              duration: currentWorker.availability,
                              description: currentWorker.bio,
                              poster: `${currentWorker.experience}`,
                              rating: currentWorker.rating,
                              skills: currentWorker.skills,
                              postedTime: "Available now",
                              applicants: currentWorker.previousJobs,
                              image: currentWorker.image,
                              posterAvatar: currentWorker.avatar,
                            }}
                            onSwipe={handleWorkerSwipe}
                            isTop={true}
                            isMobile={isMobile}
                          />
                        )}
                      </AnimatePresence>
                    )}
                  </div>

                  {/* Mobile Undo Button */}
                  {isMobile && rejectedWorkers.length > 0 && (
                    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-30">
                      <Button
                        onClick={handleUndoWorker}
                        variant="outline"
                        className="rounded-full bg-white/90 backdrop-blur-sm border-gray-300 px-4"
                      >
                        <Undo2 className="h-4 w-4 mr-2" />
                        Undo ({rejectedWorkers.length})
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
