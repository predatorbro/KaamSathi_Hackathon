"use client";
import Link from "next/link"
import { Bot, Mail, Phone } from "lucide-react"
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation"

export function Footer() {
  const [show, setShow] = useState<boolean>(false)

  const params = usePathname().replace("/", "")

  useEffect(() => {
    setShow(params.includes("chat"))
  }, [params])

  if (show) return null

  return (
    <footer className={`bg-gray-50 border-t border-gray-200 `}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <Bot className="h-8 w-8 text-gray-800" />
              <span className="text-xl font-bold text-gray-800">KaamSathi</span>
            </div>
            <p className="text-gray-600 mb-4">
              Your AI-powered career companion helping you discover opportunities, build skills, and find the perfect
              job in Nepal.
            </p>
            <div className="flex space-x-4">
              <div className="flex items-center space-x-2 text-gray-600">
                <Mail className="h-4 w-4" />
                <span>hello@kaamsathi.com</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600">
                <Phone className="h-4 w-4" />
                <span>+977-1-4444444</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-800 mb-4">Features</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/chat" className="text-gray-600 hover:text-gray-800">
                  AI Career Chat
                </Link>
              </li>
              <li>
                <Link href="/resume" className="text-gray-600 hover:text-gray-800">
                  Resume Builder
                </Link>
              </li>
              <li>
                <Link href="/quiz" className="text-gray-600 hover:text-gray-800">
                  Career Quiz
                </Link>
              </li>
              <li>
                <Link href="/courses" className="text-gray-600 hover:text-gray-800">
                  Courses
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-gray-800 mb-4">Company</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-gray-600 hover:text-gray-800">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-600 hover:text-gray-800">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-gray-600 hover:text-gray-800">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-gray-600 hover:text-gray-800">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 mt-8 pt-8 text-center text-gray-600">
          <p>&copy; 2024 KaamSathi. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
