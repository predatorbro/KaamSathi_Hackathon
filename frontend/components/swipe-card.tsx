"use client"

import { useState, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MapPin, Clock, DollarSign, Star, X, Heart, ArrowUp } from "lucide-react"
import { motion, useMotionValue, useTransform, type PanInfo } from "framer-motion"
import { getSwipeDirection } from "@/lib/swipe-utils"

interface SwipeCardProps {
  job: any
  onSwipe: (direction: "left" | "right" | "up", job: any) => void
  isTop?: boolean
  isMobile?: boolean
}

export function SwipeCard({ job, onSwipe, isTop = false, isMobile = false }: SwipeCardProps) {
  const [isDragging, setIsDragging] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const rotate = useTransform(x, [-200, 200], [-15, 15])
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0])

  // Color overlays for swipe feedback
  const redOverlay = useTransform(x, [-150, -50, 0], [0.3, 0.1, 0])
  const greenOverlay = useTransform(x, [0, 50, 150], [0, 0.1, 0.3])
  const blueOverlay = useTransform(y, [-150, -50, 0], [0.3, 0.1, 0])

  const handleDragStart = () => {
    setIsDragging(true)
  }

  const handleDragEnd = (event: any, info: PanInfo) => {
    setIsDragging(false)
    const direction = getSwipeDirection(info.offset.x, info.offset.y)

    if (direction) {
      onSwipe(direction, job)
    } else {
      // Snap back to center
      x.set(0)
      y.set(0)
    }
  }

  const handleButtonSwipe = (direction: "left" | "right" | "up") => {
    onSwipe(direction, job)
  }

  const getInitials = (name: string) => {
    if (!name) return "U"
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  return (
    <motion.div
      ref={cardRef}
      className={`absolute inset-0 ${isTop ? "z-20" : "z-10"}`}
      style={{ x, y, rotate, opacity }}
      drag={isTop}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      whileDrag={{ scale: 1.05 }}
      animate={isTop ? {} : { scale: 0.95, y: 10 }}
    >
      <Card
        className={`h-full bg-white shadow-xl border-2 border-gray-100 overflow-hidden relative ${isMobile ? "rounded-none" : ""
          }`}
      >
        {/* Color Overlays */}
        <motion.div className="absolute inset-0 bg-red-500 pointer-events-none z-10" style={{ opacity: redOverlay }} />
        <motion.div
          className="absolute inset-0 bg-green-500 pointer-events-none z-10"
          style={{ opacity: greenOverlay }}
        />
        <motion.div
          className="absolute inset-0 bg-blue-500 pointer-events-none z-10"
          style={{ opacity: blueOverlay }}
        />

        <div className={`relative ${isMobile ? "h-64" : "h-48"} bg-gradient-to-br from-gray-100 to-gray-200 z-20`}>
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1000!2d72.8777!3d19.0760!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2z19.0760%2C72.8777!5e0!3m2!1sen!2sin!4v1"
            width="100%"
            height="100%"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="w-full h-[400px] md:h-full"
            style={{ border: 0 }}
            allowFullScreen
          />
          <div className="absolute top-4 right-4">
            <Badge variant={job.urgent ? "destructive" : "secondary"}>{job.urgent ? "Urgent" : job.type}</Badge>
          </div>
          <div className="absolute bottom-4 left-4 right-4">
            <div className="bg-black/50 backdrop-blur-sm rounded-lg p-3 text-white">
              <h3 className={`${isMobile ? "text-xl" : "text-lg"} font-bold mb-1 line-clamp-2`}>{job.title}</h3>
              <div className="flex items-center space-x-2 text-sm">
                <MapPin className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">{job.location}</span>
              </div>
            </div>
          </div>
        </div>

        <CardContent className={`${isMobile ? "p-4 sm:p-6" : "p-4 sm:p-6"} space-y-3 sm:space-y-4 relative z-20`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-green-600 flex-shrink-0" />
              <span
                className={`${isMobile ? "text-lg sm:text-xl" : "text-lg sm:text-xl"} font-bold text-gray-900 truncate`}
              >
                {job.payment}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-gray-600 flex-shrink-0" />
              <span className={`text-gray-600 ${isMobile ? "text-sm sm:text-base" : "text-sm"} truncate`}>
                {job.duration}
              </span>
            </div>
          </div>

          <p className={`text-gray-700 ${isMobile ? "text-sm sm:text-base" : "text-sm"} leading-relaxed line-clamp-3`}>
            {job.description}
          </p>

          {/* Profile Section */}
          <div className="flex items-center space-x-3 bg-gray-50 rounded-lg p-3">
            <Avatar className={`${isMobile ? "w-10 h-10 sm:w-12 sm:h-12" : "w-10 h-10"} flex-shrink-0`}>
              <AvatarImage src={job.posterAvatar || job.avatar || "/placeholder.svg"} />
              <AvatarFallback className="bg-gray-200 text-gray-700">
                {getInitials(job.poster || job.name || "User")}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <span className={`${isMobile ? "text-sm sm:text-base" : "text-sm"} font-medium text-gray-900 truncate`}>
                  {job.poster || job.name}
                </span>
                <div className="flex items-center space-x-1 flex-shrink-0">
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  <span className={`${isMobile ? "text-xs sm:text-sm" : "text-xs"} font-medium`}>{job.rating}</span>
                </div>
              </div>
              <div className="flex items-center space-x-1 mt-1">
                <MapPin className="h-3 w-3 text-gray-500 flex-shrink-0" />
                <span className={`${isMobile ? "text-xs sm:text-sm" : "text-xs"} text-gray-500 truncate`}>
                  {job.location}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-1 sm:gap-2">
            {job.skills?.slice(0, isMobile ? 3 : 4).map((skill: string, index: number) => (
              <Badge key={index} variant="outline" className={`${isMobile ? "text-xs" : "text-xs"} truncate`}>
                {skill}
              </Badge>
            ))}
            {job.skills?.length > (isMobile ? 3 : 4) && (
              <Badge variant="outline" className="text-xs">
                +{job.skills.length - (isMobile ? 3 : 4)}
              </Badge>
            )}
          </div>

          <div className={`${isMobile ? "text-xs" : "text-xs"} text-gray-500 truncate`}>
            Posted {job.postedTime} • {job.applicants} applicants
          </div>

          {/* Action Buttons */}
          {isTop && (
            <div className="flex justify-center space-x-3 sm:space-x-4 pt-2 sm:pt-4">
              <Button
                variant="outline"
                size={isMobile ? "default" : "lg"}
                className={`rounded-full ${isMobile ? "w-12 h-12 sm:w-14 sm:h-14" : "w-14 h-14"
                  } p-0 border-red-200 hover:bg-red-50 bg-transparent`}
                onClick={() => handleButtonSwipe("left")}
              >
                <X className={`${isMobile ? "h-5 w-5 sm:h-6 sm:w-6" : "h-6 w-6"} text-red-500`} />
              </Button>
              <Button
                variant="outline"
                size={isMobile ? "default" : "lg"}
                className={`rounded-full ${isMobile ? "w-12 h-12 sm:w-14 sm:h-14" : "w-14 h-14"
                  } p-0 border-blue-200 hover:bg-blue-50 bg-transparent`}
                onClick={() => handleButtonSwipe("up")}
              >
                <ArrowUp className={`${isMobile ? "h-5 w-5 sm:h-6 sm:w-6" : "h-6 w-6"} text-blue-500`} />
              </Button>
              <Button
                variant="outline"
                size={isMobile ? "default" : "lg"}
                className={`rounded-full ${isMobile ? "w-12 h-12 sm:w-14 sm:h-14" : "w-14 h-14"
                  } p-0 border-green-200 hover:bg-green-50 bg-transparent`}
                onClick={() => handleButtonSwipe("right")}
              >
                <Heart className={`${isMobile ? "h-5 w-5 sm:h-6 sm:w-6" : "h-6 w-6"} text-green-500`} />
              </Button>
            </div>
          )}
        </CardContent>

        {/* Swipe Indicators */}
        {isDragging && isTop && (
          <>
            <motion.div
              className={`absolute top-1/2 left-4 sm:left-8 transform -translate-y-1/2 bg-red-500 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-lg font-bold ${isMobile ? "text-sm sm:text-base" : "text-base"
                } z-30`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: x.get() < -50 ? 1 : 0, scale: x.get() < -50 ? 1 : 0.8 }}
            >
              PASS
            </motion.div>
            <motion.div
              className={`absolute top-1/2 right-4 sm:right-8 transform -translate-y-1/2 bg-green-500 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-lg font-bold ${isMobile ? "text-sm sm:text-base" : "text-base"
                } z-30`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: x.get() > 50 ? 1 : 0, scale: x.get() > 50 ? 1 : 0.8 }}
            >
              APPLY
            </motion.div>
            <motion.div
              className={`absolute top-4 sm:top-8 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-lg font-bold ${isMobile ? "text-sm sm:text-base" : "text-base"
                } z-30`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: y.get() < -50 ? 1 : 0, scale: y.get() < -50 ? 1 : 0.8 }}
            >
              DETAILS
            </motion.div>
          </>
        )}
      </Card>
    </motion.div>
  )
}
