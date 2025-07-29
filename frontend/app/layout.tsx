import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "KaamSathi - AI Career & Job Companion",
  description: "Discover career paths, learn new skills, build resumes, and find jobs in Nepal with AI assistance.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {


  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-white">
          <Navbar />
          <main>{children}</main>
          <Footer />
        </div>
        <Toaster richColors position="top-center" />
      </body>
    </html>
  )
}
