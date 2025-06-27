"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"

export default function CheckAvailabilityClient() {
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState(null)
  const [isSearching, setIsSearching] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!searchTerm.trim()) return

    setIsSearching(true)
    setError("")
    setSearchResults(null)

    try {
      const res = await fetch("/api/check-availability", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ alias: searchTerm.trim().toLowerCase() }),
      })

      const result = await res.json()

      setSearchResults({
        domain: `${searchTerm}.s3cloud.online`,
        available: result.available,
      })
    } catch (err) {
      console.error("Search error:", err)
      setError("Something went wrong. Please try again.")
    }

    setIsSearching(false)
  }

  return (
    <div className="max-w-2xl mx-auto mb-12">
      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Input
            type="text"
            placeholder="Enter desired name"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="text-lg py-6 pl-4 pr-32 rounded-full border-2 border-gray-200 focus:border-blue-500"
          />
          <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-black font-semibold">
            .s3cloud.online
          </span>
        </div>
        <Button
          type="submit"
          size="lg"
          disabled={isSearching}
          className="hover:cursor-pointer px-8 py-6 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          {isSearching ? (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Searching...</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Search className="h-5 w-5" />
              <span>Search</span>
            </div>
          )}
        </Button>
      </form>

      {error && <p className="text-red-500 mt-4">{error}</p>}

      {searchResults && !searchResults.available && (
        <Card className="mt-6 border-2">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 rounded-full bg-red-500"></div>
                <span className="text-lg font-semibold">{searchResults.domain}</span>
              </div>
              <span className="text-red-600 font-medium">Not Available</span>
            </div>
            <p className="text-gray-600 mt-2">
              This domain is already taken. Try a different name.
            </p>
          </CardContent>
        </Card>
      )}

      {searchResults && searchResults.available && (
        <Card className="mt-6 border-2">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 rounded-full bg-green-500"></div>
                <span className="text-lg font-semibold">{searchResults.domain}</span>
              </div>
              <span className="text-green-600 font-medium">Available</span>
            </div>
            <p className="text-gray-600 mt-2">
              Congratulations, your selected subdomain is available.
            </p>
            <Button
              size="lg"
              onClick={() => router.push(`/checkout?domain=${searchResults.domain}`)}
              className="hover:cursor-pointer mt-8 px-8 py-6 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              Get it Now
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
