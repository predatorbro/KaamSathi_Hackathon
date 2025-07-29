"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Menu, X, Bot, User, Briefcase, BookOpen, FileText, HelpCircle } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

type User = {
  name: string,
  fullName: string,
}

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

  const navItems = [
    { href: "/quiz", label: "AI Career Quiz", icon: HelpCircle },
    { href: "/chat", label: "AI Mentor", icon: Bot },
    { href: "/resume/classic", label: "Resume", icon: FileText },
    { href: "/courses", label: "Courses", icon: BookOpen },
    { href: "/jobs", label: "Jobs", icon: Briefcase },
  ];

  const [currUser, setCurrUser] = useState<User | null>(null)

  useEffect(() => {
    const userData = localStorage.getItem("userData")
    if (userData) {
      setCurrUser(JSON.parse(userData))
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("userData")
    setCurrUser(null)
    location.reload() // or use router.refresh() if using next/navigation
  }


  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <Bot className="h-8 w-8 text-gray-800" />
              <span className="text-xl font-bold text-gray-800">KaamSathi</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center space-x-1 text-gray-600 hover:text-gray-800 transition-colors text-sm"
              >
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            ))}
            {currUser ? (
              <div className="flex items-center space-x-3">
                <Link
                  href="/profile"
                  className="text-sm text-gray-700 font-semibold hover:underline"
                >
                  Hi, {currUser.name}
                </Link>
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  className="text-sm px-3 py-1"
                >
                  Logout
                </Button>
              </div>
            ) : (
              <Button className="bg-gray-800 hover:bg-gray-700">
                <Link href="/register">Get Started</Link>
              </Button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden flex items-center">
            <Button variant="ghost" size="sm" onClick={() => setIsOpen(!isOpen)}>
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white border-t border-gray-200"
          >
            <div className="px-2 pt-2 pb-3 space-y-1 max-h-96 overflow-y-auto">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-md transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              ))}
              <div className="px-3 py-2">
                {currUser ? (
                  <div className="flex justify-between items-center">
                    <Link
                      href="/profile"
                      onClick={() => setIsOpen(false)}
                      className="text-sm font-medium text-gray-700"
                    >
                      Hi, {currUser.name}
                    </Link>
                    <Button
                      onClick={() => {
                        handleLogout()
                        setIsOpen(false)
                      }}
                      variant="outline"
                      size="sm"
                    >
                      Logout
                    </Button>
                  </div>
                ) : (
                  <Button className="w-full bg-gray-800 hover:bg-gray-700">
                    <Link href="/register">Get Started</Link>
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
