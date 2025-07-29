"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { MapPin, DollarSign, Building, ExternalLink, Globe, Zap, Heart, Calendar } from "lucide-react"
import { motion } from "framer-motion"
import Image from "next/image"

interface Job {
  id: string
  title: string
  description: string
  shortDescription: string
  company: string
  companyLogo: string
  location: string
  url: string
  skills: string[]
  salary: string
  employmentType: string
  isRemote: boolean
  postedDate: string
  isBookmarked: boolean
}

interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}

export default function JobsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [selectedLocation, setSelectedLocation] = useState("all")
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [selectedType, setSelectedType] = useState("all")
  const [activeTab, setActiveTab] = useState("search")
  const [jobs, setJobs] = useState<Job[]>([])
  const [featuredJobs, setFeaturedJobs] = useState<Job[]>([])
  const [bookmarkedJobs, setBookmarkedJobs] = useState<Job[]>([])
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [loading, setLoading] = useState(false)
  const [featuredLoading, setFeaturedLoading] = useState(false)
  const [bookmarkedLoading, setBookmarkedLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isJobModalOpen, setIsJobModalOpen] = useState(false)
  const [hasToken, setHasToken] = useState(false);

  const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_BASE_URL || "http://localhost:3000"

  // Fetch featured jobs on component mount
  useEffect(() => {
    fetchFeaturedJobs()
  }, [])

  // Fetch jobs when search term changes (with debounce)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm.trim()) {
        searchJobs(searchTerm)
      } else {
        setJobs([])
      }
    }, 500)

    return () => clearTimeout(timeoutId)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm])

  // Fetch bookmarked jobs when tab changes to bookmarked
  useEffect(() => {
    if (activeTab === "bookmarked") {
      fetchBookmarkedJobs()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab])

  useEffect(() => {
    setHasToken(!!localStorage.getItem("token"));
  }, []);

  const searchJobs = async (query: string) => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`${BASE_URL}/api/jobs/search?query=${encodeURIComponent(query)}`, {
        headers: {
          "Content-Type": "application/json",
        },
      })

      const contentType = response.headers.get("content-type")

      if (!response.ok) {
        if (response.status === 404) {
          setError("Search API endpoint not found. Please check your API setup.")
          setJobs([])
          return
        }
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      if (!contentType || !contentType.includes("application/json")) {
        setError("API returned invalid response. Please check your API setup.")
        setJobs([])
        return
      }

      const result: ApiResponse<Job[]> = await response.json()

      if (result.success) {
        setJobs(result.data)
      } else {
        setError(result.message || "Failed to search jobs")
        setJobs([])
      }
    } catch (err) {
      console.error("Search error:", err)
      setError("Failed to connect to search API. Please check your setup.")
      setJobs([])
    } finally {
      setLoading(false)
    }
  }

  const fetchFeaturedJobs = async () => {
    setFeaturedLoading(true)
    try {
      const response = await fetch(`${BASE_URL}/api/jobs/featured`, {
        headers: {
          "Content-Type": "application/json",
        },
      })

      const contentType = response.headers.get("content-type")

      if (!response.ok) {
        if (response.status === 404) {
          console.warn("Featured jobs API endpoint not found")
          setFeaturedJobs([])
          return
        }
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      if (!contentType || !contentType.includes("application/json")) {
        console.warn("Featured jobs API returned non-JSON response")
        setFeaturedJobs([])
        return
      }

      const result: ApiResponse<Job[]> = await response.json()

      if (result.success) {
        setFeaturedJobs(result.data)
      } else {
        setFeaturedJobs([])
      }
    } catch (err) {
      console.error("Featured jobs error:", err)
      setFeaturedJobs([])
    } finally {
      setFeaturedLoading(false)
    }
  }

  const fetchBookmarkedJobs = async () => {
    setBookmarkedLoading(true)
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        setBookmarkedJobs([])
        setBookmarkedLoading(false)
        return
      }

      const response = await fetch(`${BASE_URL}/api/jobs/user/jobs`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      // Check if response is ok and content-type is JSON
      const contentType = response.headers.get("content-type")
      if (!response.ok) {
        if (response.status === 401) {
          setBookmarkedJobs([])
          return
        }
        if (response.status === 404) {
          // API endpoint doesn't exist yet, show empty state
          setBookmarkedJobs([])
          return
        }
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      if (!contentType || !contentType.includes("application/json")) {
        // Response is not JSON, likely HTML error page
        console.warn("API returned non-JSON response, endpoint may not exist")
        setBookmarkedJobs([])
        return
      }

      const result: ApiResponse<Job[]> = await response.json()

      if (result.success) {
        setBookmarkedJobs(result.data)
      } else {
        setBookmarkedJobs([])
      }
    } catch (err) {
      console.error("Bookmarked jobs error:", err)
      setBookmarkedJobs([])
    } finally {
      setBookmarkedLoading(false)
    }
  }

  const fetchJobDetails = async (jobId: string) => {
    try {
      const response = await fetch(`${BASE_URL}/api/jobs/job/${jobId}`, {
        headers: {
          "Content-Type": "application/json",
        },
      })

      const contentType = response.headers.get("content-type")

      if (!response.ok) {
        setError("Failed to load job details")
        return
      }

      if (!contentType || !contentType.includes("application/json")) {
        setError("Invalid response format")
        return
      }

      const result: ApiResponse<Job> = await response.json()

      if (result.success) {
        setSelectedJob(result.data)
        setIsJobModalOpen(true)
      } else {
        setError("Failed to load job details")
      }
    } catch (err) {
      console.error("Job details error:", err)
      setError("Failed to load job details")
    }
  }

  const toggleBookmark = async (jobId: string, currentBookmarkStatus: boolean) => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        setError("Please log in to bookmark jobs")
        return
      }

      const response = await fetch(`${BASE_URL}/api/jobs/${jobId}/bookmark`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ bookmark: !currentBookmarkStatus }),
      })

      const contentType = response.headers.get("content-type")

      if (!response.ok) {
        if (response.status === 401) {
          setError("Please log in to bookmark jobs")
          return
        }
        if (response.status === 404) {
          setError("Bookmark API endpoint not found")
          return
        }
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      if (!contentType || !contentType.includes("application/json")) {
        setError("Bookmark API returned invalid response")
        return
      }

      const result: ApiResponse<{ isBookmarked: boolean }> = await response.json()

      if (result.success) {
        // Update the job in all relevant arrays
        const updateJobBookmark = (job: Job) =>
          job.id === jobId ? { ...job, isBookmarked: result.data.isBookmarked } : job

        setJobs((prev) => prev.map(updateJobBookmark))
        setFeaturedJobs((prev) => prev.map(updateJobBookmark))

        // If unbookmarking, remove from bookmarked jobs
        if (!result.data.isBookmarked) {
          setBookmarkedJobs((prev) => prev.filter((job) => job.id !== jobId))
        }
      }
    } catch (err) {
      console.error("Bookmark error:", err)
      setError("Failed to update bookmark")
    }
  }

  const filteredJobs = (jobList: Job[]) => {
    return jobList.filter((job) => {
      const matchesLocation =
        selectedLocation === "all" ||
        job.location.toLowerCase().includes(selectedLocation.toLowerCase()) ||
        (selectedLocation === "remote" && job.isRemote)

      const matchesType = selectedType === "all" || job.employmentType.toLowerCase() === selectedType.toLowerCase()

      return matchesLocation && matchesType
    })
  }



  const JobCard = ({ job, index = 0 }: { job: Job; index?: number }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
    >
      {/* <Card className="hover:shadow-xl transition-all duration-300 border-0 shadow-md hover:scale-[1.02] bg-white">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4 flex-1">
              <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                <Image
                  src={job.companyLogo || "/placeholder.svg"}
                  alt={`${job.company} logo`}
                  width={48}
                  height={48}
                  className="object-contain"
                />
              </div>
              <div className="flex-1 min-w-0">
                <CardTitle
                  className="text-xl mb-1 text-gray-900 hover:text-blue-600 cursor-pointer"
                  onClick={() => fetchJobDetails(job.id)}
                >
                  {job.title}
                </CardTitle>
                <CardDescription className="text-base">
                  <div className="flex items-center space-x-4 mb-2 text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Building className="h-4 w-4" />
                      <span className="font-medium">{job.company}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      {job.isRemote ? <Globe className="h-4 w-4" /> : <MapPin className="h-4 w-4" />}
                      <span>{job.location}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <DollarSign className="h-4 w-4" />
                      <span>{job.salary}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(job.postedDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge
                variant={job.isRemote ? "default" : "secondary"}
                className={job.isRemote ? "bg-green-100 text-green-800" : ""}
              >
                {job.employmentType}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleBookmark(job.id, job.isBookmarked)}
                className="p-2"
              >
                <Heart className={`h-4 w-4 ${job.isBookmarked ? "fill-red-500 text-red-500" : "text-gray-400"}`} />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-700 line-clamp-2">{job.shortDescription}</p>

          <div className="flex flex-wrap gap-2">
            {job.skills.slice(0, 4).map((skill, i) => (
              <Badge key={i} variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                {skill}
              </Badge>
            ))}
            {job.skills.length > 4 && (
              <Badge variant="outline" className="text-xs">
                +{job.skills.length - 4} more
              </Badge>
            )}
          </div>

          <div className="flex items-center justify-between pt-4 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchJobDetails(job.id)}
              className="text-blue-600 border-blue-200 hover:bg-blue-50"
            >
              View Details
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => window.open(job.url, "_blank")}>
              <ExternalLink className="h-4 w-4 mr-2" />
              Apply Now
            </Button>
          </div>
        </CardContent>
      </Card> */}

      <Card className="group bg-white border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
        <CardHeader className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4 flex-1 min-w-0">
              <div className="w-12 h-12 bg-gray-100 rounded-md flex items-center justify-center shrink-0">
                <img
                  src={job.companyLogo || "/placeholder.svg"}
                  alt={`${job.company} logo`}
                  className="object-contain p-1"
                />
              </div>
              <div className="flex-1 min-w-0">
                <CardTitle
                  className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors cursor-pointer line-clamp-1"
                  onClick={() => fetchJobDetails(job.id)}
                >
                  {job.title}
                </CardTitle>
                <CardDescription className="text-sm text-gray-600 mt-1">
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <div className="flex items-center gap-1.5">
                      <Building className="h-3.5 w-3.5 text-gray-500" />
                      <span className="font-medium">{job.company}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {job.isRemote ? <Globe className="h-3.5 w-3.5 text-gray-500" /> : <MapPin className="h-3.5 w-3.5 text-gray-500" />}
                      <span>{job.location}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                    <div className="flex items-center gap-1.5">
                      <DollarSign className="h-3.5 w-3.5" />
                      <span>{job.salary || "Not disclosed"}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{new Date(job.postedDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                    </div>
                  </div>
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Badge
                variant={job.isRemote ? "default" : "secondary"}
                className={`text-xs font-medium ${job.isRemote ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}`}
              >
                {job.employmentType}
              </Badge>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => toggleBookmark(job.id, job.isBookmarked)}
                className="hover:bg-gray-100 rounded-full"
                aria-label={job.isBookmarked ? "Remove bookmark" : "Add bookmark"}
              >
                <Heart className={`h-4 w-4 ${job.isBookmarked ? "fill-red-500 text-red-500" : "text-gray-400"}`} />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 pt-0">
<p className="text-sm text-gray-600 line-clamp-2 mb-4">
  {job.shortDescription?.trim() || job.description?.slice(0, 150) + '...'}
</p>          <div className="flex flex-wrap gap-2 mb-4">
            {job.skills.slice(0, 4).map((skill, i) => (
              <Badge
                key={i}
                variant="outline"
                className="text-xs bg-blue-50 text-blue-700 border-blue-200 px-2 py-0.5"
              >
                {skill}
              </Badge>
            ))}
            {job.skills.length > 4 && (
              <Badge variant="outline" className="text-xs bg-gray-50 text-gray-600 border-gray-200 px-2 py-0.5">
                +{job.skills.length - 4} more
              </Badge>
            )}
          </div>
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchJobDetails(job.id)}
              className="text-blue-600 border-blue-200 hover:bg-blue-50 text-sm font-medium cursor-pointer"
            >
              View Details
            </Button>
            <Button
              size="sm"
              onClick={() => window.open(job.url, "_blank")}
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium cursor-pointer"
            >
              <ExternalLink className="h-4 w-4 mr-1.5" />
              Apply Now
            </Button>
          </div>
        </CardContent>
      </Card>


    </motion.div>
  )

  const LoadingSkeleton = () => (
    <div className="space-y-6">
      {[...Array(3)].map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <div className="flex items-start space-x-4">
              <Skeleton className="w-12 h-12 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-4 w-full mb-4" />
            <div className="flex space-x-2">
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-6 w-18" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8 text-center"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Find Your Dream Job</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover opportunities from top companies around the world
          </p>
        </motion.div>

        {/* Enhanced Search Section */}
        <div className="flex items-center justify-center mb-8">
          <Input
            type="text"
            placeholder="Search for jobs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full max-w-md mr-4"
          />
          <Button onClick={searchJobs} className="bg-blue-600 cursor-pointer hover:bg-blue-700">
            <Zap className="h-4 w-4 mr-2" />
            Smart Search
          </Button>
        </div>

        {/* Error Display */}
        {error && (
          <Card className="mb-4 border-red-200 bg-red-50">
            <CardContent className="pt-4">
              <div className="flex items-center space-x-2 text-red-700">
                <div className="w-4 h-4 rounded-full bg-red-500"></div>
                <p className="font-medium">{error}</p>
                <Button variant="outline" size="sm" onClick={() => setError(null)} className="ml-auto">
                  Dismiss
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabs Section */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger className="cursor-pointer" value="search">Search Jobs</TabsTrigger>
            <TabsTrigger className="cursor-pointer" value="bookmarked">Bookmarked Jobs</TabsTrigger>
          </TabsList>
          <TabsContent value="search">
            {loading ? (
              <LoadingSkeleton />
            ) : error ? (
              <Card className="p-8 text-center">
                <div className="text-red-500 mb-4">
                  <h3 className="text-lg font-semibold mb-2">Error Loading Jobs</h3>
                  <p>{error}</p>
                  <Button onClick={() => searchTerm && searchJobs(searchTerm)} className="mt-4">
                    Retry
                  </Button>
                </div>
              </Card>
            ) : jobs.length === 0 && searchTerm ? (
              <Card className="p-8 text-center">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">No jobs found</h3>
                <p className="text-gray-600">Try different search terms or check back later</p>
              </Card>
            ) : jobs.length === 0 ? (
              <Card className="p-8 text-center">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Start searching for jobs</h3>
                <p className="text-gray-600">Enter keywords above to find your perfect job</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredJobs(jobs).map((job, index) => (
                  <JobCard key={job.id} job={job} index={index} />
                ))}
              </div>
            )}
          </TabsContent>
          <TabsContent value="bookmarked">
            {bookmarkedLoading ? (
              <LoadingSkeleton />
            ) : bookmarkedJobs.length === 0 ? (
              <Card className="p-8 text-center">
                <Heart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">No bookmarked jobs</h3>
                <p className="text-gray-600 mb-4">
                  {hasToken
                    ? "Start bookmarking jobs to see them here"
                    : "Please log in to view your bookmarked jobs"}
                </p>
                {!hasToken && <Button className="bg-blue-600 hover:bg-blue-700">Log In</Button>}              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredJobs(bookmarkedJobs).map((job, index) => (
                  <JobCard key={job.id} job={job} index={index} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Featured Jobs Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Featured Jobs</h2>
          {featuredLoading ? (
            <LoadingSkeleton />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {featuredJobs.map((job, index) => (
                <JobCard key={job.id} job={job} index={index} />
              ))}
            </div>
          )}
        </div>

        {/* Job Modal */}
        {selectedJob && (
          <Dialog open={isJobModalOpen} onOpenChange={setIsJobModalOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{selectedJob.title}</DialogTitle>
                <DialogDescription>{selectedJob.description}</DialogDescription>
              </DialogHeader>
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                  <Image
                    src={selectedJob.companyLogo || "/placeholder.svg?height=48&width=48"}
                    alt={`${selectedJob.company} logo`}
                    width={48}
                    height={48}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-gray-600">
                    <Building className="h-4 w-4 inline-block mr-2" />
                    {selectedJob.company}
                  </p>
                  <p className="text-gray-600">
                    {selectedJob.isRemote ? (
                      <Globe className="h-4 w-4 inline-block mr-2" />
                    ) : (
                      <MapPin className="h-4 w-4 inline-block mr-2" />
                    )}
                    {selectedJob.location}
                  </p>
                  <p className="text-gray-600">
                    <DollarSign className="h-4 w-4 inline-block mr-2" />
                    {selectedJob.salary}
                  </p>
                  <p className="text-gray-600">
                    <Calendar className="h-4 w-4 inline-block mr-2" />
                    {new Date(selectedJob.postedDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleBookmark(selectedJob.id, selectedJob.isBookmarked)}
                  className="p-2"
                >
                  <Heart
                    className={`h-4 w-4 ${selectedJob.isBookmarked ? "fill-red-500 text-red-500" : "text-gray-400"}`}
                  />
                  {selectedJob.isBookmarked ? "Unbookmark" : "Bookmark"}
                </Button>
                <Button
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={() => window.open(selectedJob.url, "_blank")}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Apply Now
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  )
}
