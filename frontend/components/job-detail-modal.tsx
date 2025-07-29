"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MapPin, Clock, DollarSign, Star, Phone, Mail, Calendar, X } from "lucide-react"
import Image from "next/image"

interface JobDetailModalProps {
  job: any
  isOpen: boolean
  onClose: () => void
  onApply: () => void
}

export function JobDetailModal({ job, isOpen, onClose, onApply }: JobDetailModalProps) {
  if (!job) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl w-[95vw] max-h-[90vh] h-[90vh] p-0 gap-0 flex flex-col">
        {/* Fixed Header */}
        <DialogHeader className="flex-shrink-0 p-4 sm:p-6 pb-3 border-b border-gray-200">
          <div className="flex items-start justify-between gap-4">
            <DialogTitle className="text-lg sm:text-xl font-bold leading-tight pr-2">{job.title}</DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose} className="flex-shrink-0 h-8 w-8 p-0 hover:bg-gray-100">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6">
          <div className="space-y-4 sm:space-y-6 py-4">
            {/* Job Image */}
            <div className="relative h-40 sm:h-48 rounded-lg overflow-hidden bg-gray-100">
              <Image
                src={job.image || "/placeholder.svg?height=200&width=400"}
                alt={job.title}
                className="w-full h-full object-cover"
                height={200}
                width={400}
              />
              <div className="absolute top-3 right-3">
                <Badge variant={job.urgent ? "destructive" : "secondary"}>{job.urgent ? "Urgent" : job.type}</Badge>
              </div>
            </div>

            {/* Job Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                <DollarSign className="h-5 w-5 text-green-600 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-green-700 font-medium">Payment</p>
                  <p className="font-semibold text-sm text-green-800 truncate">{job.payment}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                <Clock className="h-5 w-5 text-blue-600 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-blue-700 font-medium">Duration</p>
                  <p className="font-semibold text-sm text-blue-800 truncate">{job.duration}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-red-50 rounded-lg">
                <MapPin className="h-5 w-5 text-red-600 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-red-700 font-medium">Location</p>
                  <p className="font-semibold text-sm text-red-800 truncate">{job.location}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
                <Calendar className="h-5 w-5 text-purple-600 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-purple-700 font-medium">Start Date</p>
                  <p className="font-semibold text-sm text-purple-800 truncate">{job.startDate || "Immediate"}</p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-3">
              <h3 className="font-semibold text-base text-gray-900">Job Description</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700 leading-relaxed text-sm">{job.fullDescription || job.description}</p>
              </div>
            </div>

            {/* Requirements/Skills */}
            <div className="space-y-3">
              <h3 className="font-semibold text-base text-gray-900">Required Skills</h3>
              <div className="flex flex-wrap gap-2">
                {job.skills?.map((skill: string, index: number) => (
                  <Badge key={index} variant="outline" className="text-xs px-2 py-1">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Poster Info */}
            <div className="space-y-3">
              <h3 className="font-semibold text-base text-gray-900">Job Poster</h3>
              <div className="border border-gray-200 rounded-lg p-4 bg-white">
                <div className="flex items-start space-x-3">
                  <Avatar className="w-12 h-12 flex-shrink-0">
                    <AvatarImage src={job.posterAvatar || "/placeholder.svg"} />
                    <AvatarFallback className="bg-gray-200 text-gray-700 text-sm">
                      {job.poster
                        ?.split(" ")
                        .map((n: string) => n[0])
                        .join("") || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium text-sm text-gray-900 truncate">{job.poster || "Anonymous"}</h4>
                      <div className="flex items-center space-x-1 flex-shrink-0">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="text-xs font-medium text-gray-700">{job.rating || "N/A"}</span>
                      </div>
                    </div>

                    {job.posterBio && <p className="text-xs text-gray-600 leading-relaxed">{job.posterBio}</p>}

                    <div className="space-y-1">
                      {job.posterPhone && (
                        <div className="flex items-center space-x-2">
                          <Phone className="h-3 w-3 text-gray-500 flex-shrink-0" />
                          <span className="text-xs text-gray-600 truncate">{job.posterPhone}</span>
                        </div>
                      )}
                      {job.posterEmail && (
                        <div className="flex items-center space-x-2">
                          <Mail className="h-3 w-3 text-gray-500 flex-shrink-0" />
                          <span className="text-xs text-gray-600 truncate">{job.posterEmail}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Location Map Placeholder */}
            <div className="space-y-3">
              <h3 className="font-semibold text-base text-gray-900">Location Map</h3>
              <div className="h-32 sm:h-40 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center border border-gray-200">
                <div className="text-center">
                  <MapPin className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm font-medium">Interactive Map</p>
                  <p className="text-gray-400 text-xs">Google Maps Integration</p>
                </div>
              </div>
            </div>

            {/* Additional Info */}
            {(job.postedTime || job.applicants) && (
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between text-sm text-gray-600">
                  {job.postedTime && <span>Posted {job.postedTime}</span>}
                  {job.applicants && <span>{job.applicants} applicants</span>}
                </div>
              </div>
            )}

            {/* Bottom spacing for fixed buttons */}
            <div className="h-4"></div>
          </div>
        </div>

        {/* Fixed Footer with Action Buttons */}
        <div className="flex-shrink-0 border-t border-gray-200 bg-white p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={onApply} className="flex-1 bg-gray-800 hover:bg-gray-700 h-11 font-medium">
              Apply for Job
            </Button>
            <Button
              variant="outline"
              onClick={onClose}
              className="bg-white border-gray-300 hover:bg-gray-50 h-11 sm:w-24"
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
