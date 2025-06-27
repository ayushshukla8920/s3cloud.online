import { Globe, Shield, Zap } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"
import CheckAvailabilityClient from "@/components/check-availability-client"
import HeaderClient from "@/components/header-client"
import Link from "next/link"

export const metadata = {
  title: "Get Your Free Subdomain | S3Cloud Domains",
  description:
    "Claim a free subdomain instantly on s3cloud.online. Perfect for developers, startups, and personal projects.",
}

export default async function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href='/'><div className="flex items-center space-x-2">
            <Image src="/S3.png" alt="S3Cloud" width={40} height={40} />
            <span className="text-2xl font-bold text-gray-900">S3Cloud Domains</span>
          </div></Link>
          <HeaderClient />
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Get Your Free
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              {" "}
              Subdomain
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
            Claim your free subdomain on s3cloud.online instantly. Perfect for developers, startups, and personal
            projects.
          </p>

          {/* Client-Side Interactive Subdomain Checker */}
          <CheckAvailabilityClient />

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-8 mt-16">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-8 text-center">
                <Zap className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-3">Instant Setup</h3>
                <p className="text-gray-600">Get your subdomain up and running in seconds with our automated system.</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-8 text-center">
                <Shield className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-3">Secure & Reliable</h3>
                <p className="text-gray-600">
                  Built on robust infrastructure with SSL certificates included by default.
                </p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-8 text-center">
                <Globe className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-3">Full Control</h3>
                <p className="text-gray-600">
                  Manage DNS records, A records, and all domain settings from your dashboard.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 mt-20">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Globe className="h-6 w-6" />
            <span className="text-xl font-bold">S3Cloud Domains</span>
          </div>
          <p className="text-gray-400">© 2024 S3Cloud Domains. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
