"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SwipeCard } from "@/components/swipe-card"
import { JobDetailModal } from "@/components/job-detail-modal"
import { Filter, RefreshCw, Undo2, Search, ArrowLeft } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"
import { useMobile } from "@/hooks/use-mobile"

// Mock gig jobs data (same as before)
const mockGigJobs = [
  {
    id: "1",
    title: "Grocery Store Helper",
    location: "Thamel, Kathmandu",
    payment: "NPR 1,500/day",
    duration: "1 week",
    type: "Part-time",
    urgent: true,
    description: "Need someone to help organize inventory and assist customers in our grocery store.",
    fullDescription:
      "We are looking for a reliable person to help in our grocery store for one week. Tasks include organizing shelves, helping customers find products, basic cleaning, and assisting with inventory management. No prior experience required, but should be friendly and hardworking.",
    poster: "Ram Bahadur",
    posterBio: "Owner of Thamel Grocery Store for 10 years",
    posterPhone: "+977-9841234567",
    posterEmail: "ram@thamelgrocery.com",
    posterAvatar: "/placeholder.svg?height=100&width=100",
    rating: 4.8,
    skills: ["Customer Service", "Organization", "Physical Work"],
    postedTime: "2 hours ago",
    applicants: 12,
    startDate: "Tomorrow",
    image: "/placeholder.svg?height=200&width=400&text=Grocery+Store",
  },
  {
    id: "2",
    title: "Plumber for Pipe Repair",
    location: "Lalitpur, Nepal",
    payment: "NPR 2,000",
    duration: "3 hours",
    type: "One-time",
    urgent: false,
    description: "Kitchen sink pipe is leaking, need experienced plumber to fix it today.",
    fullDescription:
      "Our kitchen sink has a leaking pipe that needs immediate repair. Looking for an experienced plumber who can come today and fix the issue. All necessary tools should be brought by the plumber. Payment will be made immediately after completion.",
    poster: "Sita Sharma",
    posterBio: "Homeowner in Lalitpur",
    posterPhone: "+977-9851234567",
    posterEmail: "sita.sharma@email.com",
    posterAvatar: "/placeholder.svg?height=100&width=100",
    rating: 4.5,
    skills: ["Plumbing", "Pipe Repair", "Tools"],
    postedTime: "1 hour ago",
    applicants: 5,
    startDate: "Today",
    image: "/placeholder.svg?height=200&width=400&text=Plumbing+Work",
  },
  {
    id: "3",
    title: "Delivery Boy for Restaurant",
    location: "Baneshwor, Kathmandu",
    payment: "NPR 800/day",
    duration: "3 hours daily",
    type: "Part-time",
    urgent: true,
    description: "Need delivery person for evening shift at our restaurant.",
    fullDescription:
      "We need a reliable delivery person for our restaurant's evening shift (6 PM - 9 PM). Must have own motorcycle and driving license. Will provide delivery bag and uniform. Good opportunity for students or part-time workers.",
    poster: "Mohan's Restaurant",
    posterBio: "Popular restaurant in Baneshwor area",
    posterPhone: "+977-9861234567",
    posterEmail: "mohan.restaurant@email.com",
    posterAvatar: "/placeholder.svg?height=100&width=100",
    rating: 4.2,
    skills: ["Motorcycle", "Driving License", "Time Management"],
    postedTime: "30 minutes ago",
    applicants: 8,
    startDate: "Today",
    image: "/placeholder.svg?height=200&width=400&text=Food+Delivery",
  },
  {
    id: "4",
    title: "Baby Sitter Needed",
    location: "Boudha, Kathmandu",
    payment: "NPR 1,200/day",
    duration: "8 hours",
    type: "One-time",
    urgent: false,
    description: "Need experienced babysitter for 2-year-old child for one day.",
    fullDescription:
      "We need an experienced and trustworthy babysitter to take care of our 2-year-old daughter for one day (8 AM - 6 PM). Previous experience with toddlers is required. Must be patient, caring, and responsible. References will be checked.",
    poster: "Priya Thapa",
    posterBio: "Working mother of one",
    posterPhone: "+977-9871234567",
    posterEmail: "priya.thapa@email.com",
    posterAvatar: "/placeholder.svg?height=100&width=100",
    rating: 4.9,
    skills: ["Childcare", "Patience", "First Aid"],
    postedTime: "4 hours ago",
    applicants: 15,
    startDate: "This Saturday",
    image: "/placeholder.svg?height=200&width=400&text=Babysitting",
  },
  {
    id: "5",
    title: "House Cleaning Service",
    location: "Patan, Lalitpur",
    payment: "NPR 1,800",
    duration: "4 hours",
    type: "One-time",
    urgent: false,
    description: "Deep cleaning needed for 3-bedroom house before guests arrive.",
    fullDescription:
      "We need professional house cleaning service for our 3-bedroom house. This includes deep cleaning of all rooms, bathrooms, kitchen, and living areas. We have guests coming this weekend, so quality work is essential. Cleaning supplies will be provided.",
    poster: "Rajesh Maharjan",
    posterBio: "Homeowner in Patan",
    posterPhone: "+977-9881234567",
    posterEmail: "rajesh.maharjan@email.com",
    posterAvatar: "/placeholder.svg?height=100&width=100",
    rating: 4.6,
    skills: ["House Cleaning", "Attention to Detail", "Reliability"],
    postedTime: "6 hours ago",
    applicants: 7,
    startDate: "This Friday",
    image: "/placeholder.svg?height=200&width=400&text=House+Cleaning",
  },
]

export default function RemoteJobsPage() {
  const isMobile = useMobile()
  const [jobs, setJobs] = useState(mockGigJobs)
  const [currentJobIndex, setCurrentJobIndex] = useState(0)
  const [selectedJob, setSelectedJob] = useState<any>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showFilters, setShowFilters] = useState(!isMobile)
  const [showSwipeView, setShowSwipeView] = useState(!isMobile)
  const [rejectedJobs, setRejectedJobs] = useState<any[]>([])
  const [filters, setFilters] = useState({
    location: "all",
    paymentRange: "all",
    duration: "all",
    type: "all",
  })

  const currentJob = jobs[currentJobIndex]
  const nextJob = jobs[currentJobIndex + 1]

  const handleSwipe = (direction: "left" | "right" | "up", job: any) => {
    if (direction === "up") {
      setSelectedJob(job)
      setShowDetailModal(true)
      return
    }

    if (direction === "left") {
      setRejectedJobs((prev) => [...prev, { job, index: currentJobIndex }])
      toast.info(`Passed on ${job.title}`)
    } else if (direction === "right") {
      toast.success(`Applied to ${job.title}!`)
    }

    setCurrentJobIndex((prev) => prev + 1)
  }

  const handleUndo = () => {
    if (rejectedJobs.length > 0) {
      const lastRejected = rejectedJobs[rejectedJobs.length - 1]
      setCurrentJobIndex(lastRejected.index)
      setRejectedJobs((prev) => prev.slice(0, -1))
      toast.success("Undone! Card restored.")
    }
  }

  const handleApply = () => {
    if (selectedJob) {
      toast.success(`Applied to ${selectedJob.title}!`)
      setShowDetailModal(false)
      setCurrentJobIndex((prev) => prev + 1)
    }
  }

  const resetCards = () => {
    setCurrentJobIndex(0)
    setRejectedJobs([])
    setJobs([...mockGigJobs])
    toast.info("Cards refreshed!")
  }

  const handleFindJobs = () => {
    setShowFilters(false)
    setShowSwipeView(true)
    toast.success("Showing filtered jobs!")
  }

  const noMoreJobs = currentJobIndex >= jobs.length

  // Mobile filter view
  if (isMobile && showFilters) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center space-x-3 mb-2">
            <Button variant="ghost" size="sm" onClick={() => window.history.back()} className="p-1">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Find Gig Jobs</h1>
          </div>
          <p className="text-gray-600 text-sm">Set your preferences to find perfect jobs</p>
        </div>

        <div className="p-4 space-y-6">
          <div>
            <label className="text-base font-medium mb-3 block">Location</label>
            <Select
              value={filters.location}
              onValueChange={(value) => setFilters((prev) => ({ ...prev, location: value }))}
            >
              <SelectTrigger className="h-12">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                <SelectItem value="kathmandu">Kathmandu</SelectItem>
                <SelectItem value="lalitpur">Lalitpur</SelectItem>
                <SelectItem value="bhaktapur">Bhaktapur</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-base font-medium mb-3 block">Payment Range</label>
            <Select
              value={filters.paymentRange}
              onValueChange={(value) => setFilters((prev) => ({ ...prev, paymentRange: value }))}
            >
              <SelectTrigger className="h-12">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Ranges</SelectItem>
                <SelectItem value="low">Under NPR 1,000</SelectItem>
                <SelectItem value="medium">NPR 1,000 - 2,000</SelectItem>
                <SelectItem value="high">Above NPR 2,000</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-base font-medium mb-3 block">Duration</label>
            <Select
              value={filters.duration}
              onValueChange={(value) => setFilters((prev) => ({ ...prev, duration: value }))}
            >
              <SelectTrigger className="h-12">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Durations</SelectItem>
                <SelectItem value="hours">Few Hours</SelectItem>
                <SelectItem value="days">Few Days</SelectItem>
                <SelectItem value="weeks">Few Weeks</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-base font-medium mb-3 block">Job Type</label>
            <Select value={filters.type} onValueChange={(value) => setFilters((prev) => ({ ...prev, type: value }))}>
              <SelectTrigger className="h-12">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="one-time">One-time</SelectItem>
                <SelectItem value="part-time">Part-time</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200">
          <Button onClick={handleFindJobs} className="w-full h-12 bg-gray-800 hover:bg-gray-700 text-lg">
            <Search className="h-5 w-5 mr-2" />
            Find Jobs
          </Button>
        </div>
      </div>
    )
  }

  // Mobile swipe view (full screen like reels)
  if (isMobile && showSwipeView) {
    return (
      <div className="min-h-screen bg-gray-50 relative">
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-30 bg-gradient-to-b from-black/50 to-transparent p-4">
          <div className="flex items-center justify-between text-white">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFilters(true)}
              className="text-white hover:bg-white/20"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
            <div className="text-sm">
              {currentJobIndex + 1} / {jobs.length}
            </div>
          </div>
        </div>

        {/* Swipe Cards */}
        <div className="relative h-screen">
          {noMoreJobs ? (
            <div className="h-full flex items-center justify-center p-8">
              <Card>
                <CardContent className="text-center p-8">
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">No More Jobs!</h3>
                  <p className="text-gray-600 mb-4">You've seen all available gig jobs.</p>
                  <Button onClick={resetCards} className="bg-gray-800 hover:bg-gray-700">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Load More Jobs
                  </Button>
                </CardContent>
              </Card>
            </div>
          ) : (
            <AnimatePresence>
              {nextJob && (
                <SwipeCard
                  key={`${nextJob.id}-next`}
                  job={nextJob}
                  onSwipe={handleSwipe}
                  isTop={false}
                  isMobile={true}
                />
              )}
              {currentJob && (
                <SwipeCard
                  key={`${currentJob.id}-current`}
                  job={currentJob}
                  onSwipe={handleSwipe}
                  isTop={true}
                  isMobile={true}
                />
              )}
            </AnimatePresence>
          )}
        </div>

        {/* Bottom Actions */}
        <div className="absolute bottom-4 left-4 right-4 z-30">
          <div className="flex justify-center space-x-4">
            {rejectedJobs.length > 0 && (
              <Button
                variant="outline"
                size="lg"
                className="rounded-full w-12 h-12 p-0 bg-white/90 backdrop-blur-sm border-gray-300"
                onClick={handleUndo}
              >
                <Undo2 className="h-5 w-5 text-gray-700" />
              </Button>
            )}
          </div>
        </div>

        {/* Job Detail Modal */}
        <JobDetailModal
          job={selectedJob}
          isOpen={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          onApply={handleApply}
        />
      </div>
    )
  }

  // Desktop view
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Gig Jobs</h1>
          <p className="text-gray-600">Swipe right to apply, left to pass, up for details</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Filter className="h-5 w-5" />
                  <span>Filters</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Location</label>
                  <Select
                    value={filters.location}
                    onValueChange={(value) => setFilters((prev) => ({ ...prev, location: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Locations</SelectItem>
                      <SelectItem value="kathmandu">Kathmandu</SelectItem>
                      <SelectItem value="lalitpur">Lalitpur</SelectItem>
                      <SelectItem value="bhaktapur">Bhaktapur</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Payment Range</label>
                  <Select
                    value={filters.paymentRange}
                    onValueChange={(value) => setFilters((prev) => ({ ...prev, paymentRange: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Ranges</SelectItem>
                      <SelectItem value="low">Under NPR 1,000</SelectItem>
                      <SelectItem value="medium">NPR 1,000 - 2,000</SelectItem>
                      <SelectItem value="high">Above NPR 2,000</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Duration</label>
                  <Select
                    value={filters.duration}
                    onValueChange={(value) => setFilters((prev) => ({ ...prev, duration: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Durations</SelectItem>
                      <SelectItem value="hours">Few Hours</SelectItem>
                      <SelectItem value="days">Few Days</SelectItem>
                      <SelectItem value="weeks">Few Weeks</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Job Type</label>
                  <Select
                    value={filters.type}
                    onValueChange={(value) => setFilters((prev) => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="one-time">One-time</SelectItem>
                      <SelectItem value="part-time">Part-time</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Button onClick={resetCards} variant="outline" className="w-full bg-transparent">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh Cards
                  </Button>

                  {rejectedJobs.length > 0 && (
                    <Button onClick={handleUndo} variant="outline" className="w-full bg-transparent">
                      <Undo2 className="h-4 w-4 mr-2" />
                      Undo Last ({rejectedJobs.length})
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Stats */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Your Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Jobs Viewed:</span>
                  <span className="font-medium">{currentJobIndex}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Applications:</span>
                  <span className="font-medium">0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Rejected:</span>
                  <span className="font-medium">{rejectedJobs.length}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Swipe Cards Area */}
          <div className="lg:col-span-3">
            <div className="relative h-[600px] max-w-md mx-auto">
              {noMoreJobs ? (
                <Card className="h-full flex items-center justify-center">
                  <CardContent className="text-center">
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">No More Jobs!</h3>
                    <p className="text-gray-600 mb-4">You've seen all available gig jobs.</p>
                    <Button onClick={resetCards} className="bg-gray-800 hover:bg-gray-700">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Load More Jobs
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <AnimatePresence>
                  {nextJob && (
                    <SwipeCard key={`${nextJob.id}-next`} job={nextJob} onSwipe={handleSwipe} isTop={false} />
                  )}
                  {currentJob && (
                    <SwipeCard key={`${currentJob.id}-current`} job={currentJob} onSwipe={handleSwipe} isTop={true} />
                  )}
                </AnimatePresence>
              )}
            </div>

            {/* Instructions */}
            <div className="mt-6 text-center">
              <div className="flex justify-center space-x-8 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                  <span>Swipe Left: Pass</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                  <span>Swipe Up: Details</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                  <span>Swipe Right: Apply</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Job Detail Modal */}
        <JobDetailModal
          job={selectedJob}
          isOpen={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          onApply={handleApply}
        />
      </div>
    </div>
  )
}
