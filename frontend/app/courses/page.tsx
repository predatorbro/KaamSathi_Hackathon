/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState } from "react";
import type React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ImageIcon } from "lucide-react";
import {
  BookmarkIcon,
  ExternalLinkIcon,
  SearchIcon,
  XIcon,
  GraduationCapIcon,
  ClockIcon,
  UsersIcon,
} from "lucide-react";

// Types
interface Course {
  id: string;
  title: string;
  description: string;
  shortDescription: string;
  provider: string;
  url: string;
  categories: string[];
  isFree: boolean;
  imageUrl?: string;
  isBookmarked?: boolean;
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

interface BookmarkResponse {
  isBookmarked: boolean;
}

// Custom Hook
function useCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [featuredCourses, setFeaturedCourses] = useState<Course[]>([]);
  const [userCourses, setUserCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const BASE_URL = `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/courses`;

  const searchCourses = async (query: string) => {
    if (!query.trim()) {
      setCourses([]);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `${BASE_URL}/search?query=${encodeURIComponent(query)}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      const result: ApiResponse<Course[]> = await response.json();
      if (result.success && result.data) {
        setCourses(result.data);
      } else {
        setError(result.message || "Failed to search courses");
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      setError("Network error occurred");
    } finally {
      setLoading(false);
    }
  };

  const getFeaturedCourses = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${BASE_URL}/featured`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const result: ApiResponse<Course[]> = await response.json();
      if (result.success && result.data) {
        setFeaturedCourses(result.data);
      } else {
        setError(result.message || "Failed to fetch featured courses");
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      setError("Network error occurred");
    } finally {
      setLoading(false);
    }
  };

  const getUserCourses = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${BASE_URL}/user/courses`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const result: ApiResponse<Course[]> = await response.json();
      if (result.success && result.data) {
        setUserCourses(result.data);
      } else {
        setError(result.message || "Failed to fetch user courses");
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      setError("Network error occurred");
    } finally {
      setLoading(false);
    }
  };

  const getCourseDetails = async (courseId: string): Promise<Course | null> => {
    try {
      const response = await fetch(`${BASE_URL}/course/${courseId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const result: ApiResponse<Course> = await response.json();
      if (result.success && result.data) {
        return result.data;
      }
      return null;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      return null;
    }
  };

  const toggleBookmark = async (courseId: string, bookmark: boolean) => {
    try {
      const response = await fetch(`${BASE_URL}/${courseId}/bookmark`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ bookmark }),
      });
      const result: ApiResponse<BookmarkResponse> = await response.json();
      if (result.success && result.data) {
        // Update the course in all relevant arrays
        const updateCourse = (course: Course) =>
          course.id === courseId
            ? { ...course, isBookmarked: result.data!.isBookmarked }
            : course;

        setCourses((prev) => prev.map(updateCourse));
        setFeaturedCourses((prev) => prev.map(updateCourse));
        setUserCourses((prev) => prev.map(updateCourse));
        return result.data.isBookmarked;
      }
      return null;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      return null;
    }
  };

  return {
    courses,
    featuredCourses,
    userCourses,
    loading,
    error,
    searchCourses,
    getFeaturedCourses,
    getUserCourses,
    getCourseDetails,
    toggleBookmark,
  };
}

// Course Card Component
interface CourseCardProps {
  course: Course;
  onBookmark?: (courseId: string, bookmark: boolean) => Promise<boolean | null>;
  onViewDetails?: (course: Course) => void;
}

function CourseCard({ course, onBookmark, onViewDetails }: CourseCardProps) {
  const [isBookmarking, setIsBookmarking] = useState(false);

  const handleBookmark = async () => {
    if (!onBookmark) return;
    setIsBookmarking(true);
    await onBookmark(course.id, !course.isBookmarked);
    setIsBookmarking(false);
  };

  const handleViewCourse = () => {
    window.open(course.url, "_blank", "noopener,noreferrer");
  };

  return (
    <Card className="group cursor-pointer h-full flex flex-col hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 shadow-md bg-gradient-to-br from-white to-gray-50/50">
      <CardHeader className="p-0">
        <div className="relative aspect-video w-full overflow-hidden rounded-t-lg bg-gradient-to-br from-blue-50 to-indigo-100">
          {course.imageUrl ? (
            <img
              src={course.imageUrl}
              alt={course.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
              <ImageIcon className="h-10 w-10 text-gray-400" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          {onBookmark && (
            <Button
              variant="secondary"
              size="sm"
              onClick={handleBookmark}
              disabled={isBookmarking}
              className="absolute cursor-pointer top-3 right-3 h-8 w-8 p-0 bg-white/90 hover:bg-white shadow-lg backdrop-blur-sm"
            >
              <BookmarkIcon
                className={`h-4 w-4 transition-colors ${
                  course.isBookmarked
                    ? "fill-yellow-500 text-yellow-500"
                    : "text-gray-600"
                }`}
              />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-1 p-6">
        <div className="space-y-4">
          <div>
            <h3 className="font-bold text-lg leading-tight line-clamp-2 text-gray-900 group-hover:text-blue-600 transition-colors">
              {course.title}
            </h3>
            <p className="text-sm text-gray-600 mt-2 line-clamp-3 leading-relaxed">
              {course.shortDescription?.trim() ||
                course.description?.slice(0, 150) + "..."}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Badge
              variant="secondary"
              className="bg-blue-100 text-blue-700 hover:bg-blue-200 font-medium"
            >
              Provider: {course.provider}
            </Badge>
            {course.isFree ? (
              <Badge
                variant="outline"
                className="border-green-200 text-green-700 bg-green-50"
              >
                Free
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="border-red-200 text-red-700 bg-red-50"
              >
                Paid
              </Badge>
            )}
          </div>

          <div className="flex flex-wrap gap-1.5">
            {course.categories.slice(0, 2).map((category) => (
              <Badge
                key={category}
                variant="outline"
                className="text-xs border-gray-200 text-gray-600 bg-gray-50"
              >
                {category}
              </Badge>
            ))}
            {course.categories.length > 2 && (
              <Badge
                variant="outline"
                className="text-xs border-gray-200 text-gray-600 bg-gray-50"
              >
                +{course.categories.length - 2} more
              </Badge>
            )}
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-6 pt-0 gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onViewDetails?.(course)}
          className="flex-1 border-gray-200 cursor-pointer hover:bg-gray-50"
        >
          View Details
        </Button>
        <Button
          size="sm"
          onClick={handleViewCourse}
          className="flex-1 bg-blue-600 cursor-pointer hover:bg-blue-700"
        >
          <ExternalLinkIcon className="h-4 w-4 mr-2" />
          Start Course
        </Button>
      </CardFooter>
    </Card>
  );
}

// Course Search Component
interface CourseSearchProps {
  onSearch: (query: string) => void;
  loading?: boolean;
}

function CourseSearch({ onSearch, loading }: CourseSearchProps) {
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  const handleClear = () => {
    setQuery("");
    onSearch("");
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="flex gap-3">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Search for courses, topics, or providers..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-12 pr-12 h-12 text-base border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
          />
          {query && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-gray-100"
            >
              <XIcon className="h-4 w-4" />
            </Button>
          )}
        </div>
        <Button
          type="submit"
          disabled={loading || !query.trim()}
          className="h-12 px-8 bg-blue-600 hover:bg-blue-700"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
              Searching...
            </>
          ) : (
            "Search"
          )}
        </Button>
      </form>
    </div>
  );
}

// Course Detail Modal Component
interface CourseDetailModalProps {
  course: Course | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBookmark?: (courseId: string, bookmark: boolean) => Promise<boolean | null>;
}

function CourseDetailModal({
  course,
  open,
  onOpenChange,
  onBookmark,
}: CourseDetailModalProps) {
  if (!course) return null;

  const handleBookmark = async () => {
    if (onBookmark) {
      await onBookmark(course.id, !course.isBookmarked);
    }
  };

  const handleViewCourse = () => {
    window.open(course.url, "_blank", "noopener,noreferrer");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0">
        <div className="flex flex-col h-full">
          {/* Header with image */}
          <div className="relative">
            {course.imageUrl ? (
              <div className="aspect-[2/1] w-full overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-100">
                <img
                  src={course.imageUrl || "/placeholder.svg"}
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              </div>
            ) : (
              <div className="aspect-[2/1] w-full bg-gradient-to-br from-blue-100 to-indigo-200 flex items-center justify-center">
                <GraduationCapIcon className="h-16 w-16 text-blue-500" />
              </div>
            )}

            <DialogHeader className="absolute bottom-0 left-0 right-0 p-6 text-white">
              <DialogTitle className="text-2xl font-bold leading-tight text-white drop-shadow-lg">
                {course.title}
              </DialogTitle>
            </DialogHeader>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-6">
              {/* Provider and badges */}
              <div className="flex items-center gap-3 flex-wrap">
                <Badge
                  variant="secondary"
                  className="bg-blue-100 text-blue-700 px-3 py-1"
                >
                  <UsersIcon className="h-3 w-3 mr-1" />
                  {course.provider}
                </Badge>
                {course.isFree && (
                  <Badge
                    variant="outline"
                    className="border-green-200 text-green-700 bg-green-50 px-3 py-1"
                  >
                    <ClockIcon className="h-3 w-3 mr-1" />
                    Free Course
                  </Badge>
                )}
              </div>

              {/* Description */}
              <div className="space-y-3">
                <h4 className="text-lg font-semibold text-gray-900">
                  About This Course
                </h4>
                <p className="text-gray-700 leading-relaxed text-base">
                  {course.description}
                </p>
              </div>

              {/* Categories */}
              <div className="space-y-3">
                <h4 className="text-lg font-semibold text-gray-900">
                  Topics Covered
                </h4>
                <div className="flex flex-wrap gap-2">
                  {course.categories.map((category) => (
                    <Badge
                      key={category}
                      variant="outline"
                      className="border-gray-200 text-gray-700 bg-gray-50 px-3 py-1"
                    >
                      {category}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Footer actions */}
          <div className="border-t bg-gray-50/50 p-6">
            <div className="flex gap-3">
              {onBookmark && (
                <Button
                  variant="outline"
                  onClick={handleBookmark}
                  className="flex-1 h-12 border-gray-200 hover:bg-gray-50 bg-transparent"
                >
                  <BookmarkIcon
                    className={`h-4 w-4 mr-2 ${
                      course.isBookmarked
                        ? "fill-yellow-500 text-yellow-500"
                        : ""
                    }`}
                  />
                  {course.isBookmarked ? "Bookmarked" : "Bookmark Course"}
                </Button>
              )}
              <Button
                onClick={handleViewCourse}
                className="flex-1 h-12 bg-blue-600 hover:bg-blue-700"
              >
                <ExternalLinkIcon className="h-4 w-4 mr-2" />
                Start Learning
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Main Component
export default function CoursesPage() {
  const {
    courses,
    featuredCourses,
    userCourses,
    loading,
    error,
    searchCourses,
    getFeaturedCourses,
    getUserCourses,
    toggleBookmark,
  } = useCourses();

  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("featured");

  useEffect(() => {
    getFeaturedCourses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleViewDetails = (course: Course) => {
    setSelectedCourse(course);
    setModalOpen(true);
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    if (value === "bookmarked") {
      getUserCourses();
    }
  };

  const CourseGrid = ({ courses: courseList }: { courses: Course[] }) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
      {courseList.map((course) => (
        <CourseCard
          key={course.id}
          course={course}
          onBookmark={toggleBookmark}
          onViewDetails={handleViewDetails}
        />
      ))}
    </div>
  );

  const LoadingSkeleton = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <Card key={i} className="h-full flex flex-col">
          <div className="p-0">
            <Skeleton className="aspect-video w-full rounded-t-lg" />
          </div>
          <div className="p-6 space-y-4 flex-1">
            <div className="space-y-2">
              <Skeleton className="h-5 w-4/5" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-6 w-16" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-5 w-20" />
            </div>
          </div>
          <div className="p-6 pt-0">
            <div className="flex gap-3">
              <Skeleton className="h-9 flex-1" />
              <Skeleton className="h-9 flex-1" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );

  const EmptyState = ({
    title,
    description,
  }: {
    title: string;
    description: string;
  }) => (
    <div className="text-center py-16">
      <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
        <GraduationCapIcon className="h-12 w-12 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 max-w-md mx-auto">{description}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Discover Amazing Courses
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Expand your knowledge with carefully curated courses from top
            providers around the world
          </p>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={handleTabChange}
          className="space-y-8"
        >
          <div className="flex justify-center">
            <TabsList className="grid w-full max-w-md grid-cols-3 h-12 bg-gray-100">
              <TabsTrigger
                value="featured"
                className="text-sm font-medium cursor-pointer"
              >
                Featured
              </TabsTrigger>
              <TabsTrigger
                value="search"
                className="text-sm font-medium cursor-pointer"
              >
                Search
              </TabsTrigger>
              <TabsTrigger
                value="bookmarked"
                className="text-sm font-medium cursor-pointer"
              >
                My Courses
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="featured" className="space-y-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Featured Courses
              </h2>
              <p className="text-gray-600">
                Hand-picked courses to help you learn something new
              </p>
            </div>

            {error && (
              <Alert className="max-w-2xl mx-auto border-red-200 bg-red-50">
                <AlertDescription className="text-red-700">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            {loading ? (
              <LoadingSkeleton />
            ) : featuredCourses.length > 0 ? (
              <CourseGrid courses={featuredCourses} />
            ) : (
              <EmptyState
                title="No Featured Courses"
                description="We're working on bringing you amazing featured courses. Check back soon!"
              />
            )}
          </TabsContent>

          <TabsContent value="search" className="space-y-8">
            <div className="text-center space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Search Courses
                </h2>
                <p className="text-gray-600">
                  Find the perfect course for your learning goals
                </p>
              </div>
              <CourseSearch onSearch={searchCourses} loading={loading} />
            </div>

            {error && (
              <Alert className="max-w-2xl mx-auto border-red-200 bg-red-50">
                <AlertDescription className="text-red-700">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            {loading ? (
              <LoadingSkeleton />
            ) : courses.length > 0 ? (
              <CourseGrid courses={courses} />
            ) : (
              <EmptyState
                title="Start Your Search"
                description="Use the search bar above to find courses on topics you're interested in"
              />
            )}
          </TabsContent>

          <TabsContent value="bookmarked" className="space-y-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                My Bookmarked Courses
              </h2>
              <p className="text-gray-600">
                Your saved courses for future learning
              </p>
            </div>

            {error && (
              <Alert className="max-w-2xl mx-auto border-red-200 bg-red-50">
                <AlertDescription className="text-red-700">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            {loading ? (
              <LoadingSkeleton />
            ) : userCourses.length > 0 ? (
              <CourseGrid courses={userCourses} />
            ) : (
              <EmptyState
                title="No Bookmarked Courses Yet"
                description="Start bookmarking courses you're interested in to build your personal learning collection"
              />
            )}
          </TabsContent>
        </Tabs>

        <CourseDetailModal
          course={selectedCourse}
          open={modalOpen}
          onOpenChange={setModalOpen}
          onBookmark={toggleBookmark}
        />
      </div>
    </div>
  );
}
