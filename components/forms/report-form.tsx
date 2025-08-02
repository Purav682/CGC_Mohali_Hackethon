"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useToast } from "@/hooks/use-toast"
import { MapPin, Upload, X, MessageSquare, Loader2, User, UserX, Shield, Info } from "lucide-react"
import { ChatBot } from "@/components/chat/chat-bot"
import { useAuth } from "@/components/providers/auth-provider-google"
import { getFormCategories, suggestCategory, getCategoryByValue } from "@/lib/categories"

const categories = getFormCategories()

interface FormData {
  title: string
  description: string
  category: string
  images: File[]
  location: {
    lat: number | null
    lng: number | null
    address: string
  }
  reportingMode: "anonymous" | "verified"
  contactInfo?: {
    name?: string
    email?: string
    phone?: string
  }
}

export function ReportForm() {
  const { user } = useAuth()
  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    category: "",
    images: [],
    location: {
      lat: null,
      lng: null,
      address: "",
    },
    reportingMode: user ? "verified" : "anonymous",
    contactInfo: user ? {
      name: user.name,
      email: user.email,
    } : undefined
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isGettingLocation, setIsGettingLocation] = useState(false)
  const [showChatBot, setShowChatBot] = useState(false)
  const [suggestedCategory, setSuggestedCategory] = useState<string>("")
  const [sentiment, setSentiment] = useState<"positive" | "negative" | "neutral">("neutral")

  const { toast } = useToast()
  const router = useRouter()

  // Auto-categorize based on description using centralized logic
  useEffect(() => {
    if (formData.description.length > 20) {
      const suggested = suggestCategory(formData.description)
      setSuggestedCategory(suggested || "")
      
      // Simple sentiment analysis
      const description = formData.description.toLowerCase()
      const negativeWords = ["broken", "damaged", "dangerous", "terrible", "awful", "bad", "worst"]
      const positiveWords = ["good", "better", "improved", "fixed", "great"]

      const negativeCount = negativeWords.filter((word) => description.includes(word)).length
      const positiveCount = positiveWords.filter((word) => description.includes(word)).length

      if (negativeCount > positiveCount) {
        setSentiment("negative")
      } else if (positiveCount > negativeCount) {
        setSentiment("positive")
      } else {
        setSentiment("neutral")
      }
    } else {
      setSuggestedCategory("")
    }
  }, [formData.description])

  const getCurrentLocation = () => {
    setIsGettingLocation(true)

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords

          // Reverse geocoding to get address
          try {
            // Note: In production, use a proper geocoding service
            const address = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
            
            setFormData((prev) => ({
              ...prev,
              location: {
                lat: latitude,
                lng: longitude,
                address: address,
              },
            }))

            toast({
              title: "Location found!",
              description: "Your current location has been set for this report.",
            })
          } catch (error) {
            console.error("Error getting address:", error)
            setFormData((prev) => ({
              ...prev,
              location: {
                lat: latitude,
                lng: longitude,
                address: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
              },
            }))
          }

          setIsGettingLocation(false)
        },
        (error) => {
          console.error("Error getting location:", error)
          let errorMessage = "Unable to get your location."
          
          switch(error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = "Location access denied. Please enable location services and try again."
              break
            case error.POSITION_UNAVAILABLE:
              errorMessage = "Location information unavailable."
              break
            case error.TIMEOUT:
              errorMessage = "Location request timed out."
              break
          }
          
          toast({
            title: "Location Error",
            description: errorMessage,
            variant: "destructive",
          })
          setIsGettingLocation(false)
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000
        }
      )
    } else {
      toast({
        title: "Geolocation not supported",
        description: "Your browser doesn't support geolocation. Please enter your address manually.",
        variant: "destructive",
      })
      setIsGettingLocation(false)
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])

    if (formData.images.length + files.length > 5) {
      toast({
        title: "Too many images",
        description: "You can upload a maximum of 5 images for your report.",
        variant: "destructive",
      })
      return
    }

    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ...files],
    }))
  }

  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title || !formData.description || !formData.category) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    if (!formData.location.lat || !formData.location.lng) {
      toast({
        title: "Location required",
        description: "Please set your location to continue.",
        variant: "destructive",
      })
      return
    }

    if (formData.reportingMode === "verified" && !user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to submit a verified report.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Mock API call with reporting mode data
      const reportData = {
        ...formData,
        submittedAt: new Date().toISOString(),
        reportId: `RPT-${Date.now()}`,
        status: "submitted",
        isAnonymous: formData.reportingMode === "anonymous",
        userId: user?.id || null,
      }

      console.log("Submitting report:", reportData)
      
      // Mock API delay
      await new Promise((resolve) => setTimeout(resolve, 2000))

      toast({
        title: "Issue reported successfully!",
        description: formData.reportingMode === "verified" 
          ? "Your verified report has been submitted. You'll receive email updates."
          : "Your anonymous report has been submitted and will be reviewed by the community.",
      })

      router.push("/map")
    } catch (error) {
      toast({
        title: "Error submitting report",
        description: "Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const applySuggestedCategory = () => {
    setFormData((prev) => ({ ...prev, category: suggestedCategory }))
    setSuggestedCategory("")
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div className="space-y-2">
          <Label htmlFor="title">Issue Title *</Label>
          <Input
            id="title"
            placeholder="Brief description of the issue"
            value={formData.title}
            onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
            required
          />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description">Detailed Description *</Label>
          <Textarea
            id="description"
            placeholder="Provide detailed information about the issue..."
            value={formData.description}
            onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
            rows={4}
            required
          />
          {sentiment !== "neutral" && (
            <div className="flex items-center space-x-2">
              <Badge variant={sentiment === "negative" ? "destructive" : "default"}>
                {sentiment === "negative" ? "High Priority" : "Standard Priority"}
              </Badge>
              <span className="text-sm text-muted-foreground">Based on sentiment analysis</span>
            </div>
          )}
        </div>

        {/* Reporting Mode Selection */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Reporting Mode *</Label>
            <RadioGroup
              value={formData.reportingMode}
              onValueChange={(value: "anonymous" | "verified") => 
                setFormData((prev) => ({ 
                  ...prev, 
                  reportingMode: value,
                  contactInfo: value === "verified" && user ? {
                    name: user.name,
                    email: user.email,
                  } : undefined
                }))
              }
              className="grid grid-cols-1 gap-4"
            >
              <div className="flex items-center space-x-3 border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                <RadioGroupItem value="anonymous" id="anonymous" />
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <UserX className="h-4 w-4 text-muted-foreground" />
                    <Label htmlFor="anonymous" className="font-medium cursor-pointer">
                      Anonymous Report
                    </Label>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Report anonymously. Your identity will not be shared, but you won't receive updates.
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3 border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                <RadioGroupItem value="verified" id="verified" />
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <Shield className="h-4 w-4 text-primary" />
                    <Label htmlFor="verified" className="font-medium cursor-pointer">
                      Verified Report
                    </Label>
                    {user && (
                      <Badge variant="secondary" className="text-xs">
                        Recommended
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {user 
                      ? "Report with your account. Get updates and build community trust."
                      : "Sign in to report as verified user and receive updates on your report."
                    }
                  </p>
                </div>
              </div>
            </RadioGroup>
          </div>

          {/* Additional Contact Info for Anonymous Reports */}
          {formData.reportingMode === "anonymous" && (
            <Card className="border-muted">
              <CardContent className="p-4">
                <div className="flex items-start space-x-2 mb-3">
                  <Info className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Optional Contact Information</p>
                    <p className="text-xs text-muted-foreground">
                      Provide contact details if you want updates (still anonymous to public)
                    </p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="anon-name" className="text-sm">Name (Optional)</Label>
                    <Input
                      id="anon-name"
                      placeholder="Your name"
                      value={formData.contactInfo?.name || ""}
                      onChange={(e) => 
                        setFormData((prev) => ({
                          ...prev,
                          contactInfo: { ...prev.contactInfo, name: e.target.value }
                        }))
                      }
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="anon-email" className="text-sm">Email (Optional)</Label>
                    <Input
                      id="anon-email"
                      type="email"
                      placeholder="your.email@example.com"
                      value={formData.contactInfo?.email || ""}
                      onChange={(e) => 
                        setFormData((prev) => ({
                          ...prev,
                          contactInfo: { ...prev.contactInfo, email: e.target.value }
                        }))
                      }
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="anon-phone" className="text-sm">Phone (Optional)</Label>
                    <Input
                      id="anon-phone"
                      type="tel"
                      placeholder="+1 (555) 123-4567"
                      value={formData.contactInfo?.phone || ""}
                      onChange={(e) => 
                        setFormData((prev) => ({
                          ...prev,
                          contactInfo: { ...prev.contactInfo, phone: e.target.value }
                        }))
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Verified User Info Display */}
          {formData.reportingMode === "verified" && user && (
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <User className="h-4 w-4 text-primary" />
                  <p className="text-sm font-medium">Reporting as verified user</p>
                </div>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p><strong>Name:</strong> {user.name}</p>
                  <p><strong>Email:</strong> {user.email}</p>
                  <p className="text-xs">You'll receive updates about this report via email.</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Sign-in prompt for non-logged users wanting verified reporting */}
          {formData.reportingMode === "verified" && !user && (
            <Card className="border-muted">
              <CardContent className="p-4">
                <div className="text-center space-y-3">
                  <div className="flex items-center justify-center space-x-2">
                    <Shield className="h-5 w-5 text-muted-foreground" />
                    <p className="text-sm font-medium">Sign in required for verified reporting</p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Create an account or sign in to report as a verified user and track your reports.
                  </p>
                  <div className="flex space-x-2 justify-center">
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={() => window.open('/auth/login', '_blank')}
                    >
                      Sign In
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={() => window.open('/auth/register', '_blank')}
                    >
                      Sign Up
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Category with AI suggestion */}
        <div className="space-y-2">
          <Label htmlFor="category">Category *</Label>
          {suggestedCategory && suggestedCategory !== formData.category && (
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">AI Suggestion</p>
                    <p className="text-sm text-muted-foreground">
                      Based on your description, this seems like a{" "}
                      <strong>{categories.find((c) => c.value === suggestedCategory)?.label}</strong> issue.
                    </p>
                  </div>
                  <Button type="button" size="sm" onClick={applySuggestedCategory}>
                    Apply
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
          <Select
            value={formData.category}
            onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value }))}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Location */}
        <div className="space-y-2">
          <Label>Location *</Label>
          <div className="space-y-3">
            <div className="flex space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={getCurrentLocation}
                disabled={isGettingLocation}
                className="flex-1 bg-transparent"
              >
                {isGettingLocation ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <MapPin className="mr-2 h-4 w-4" />
                )}
                {isGettingLocation ? "Getting Location..." : "Use Current Location"}
              </Button>
            </div>

            <Input
              placeholder="Or enter address manually"
              value={formData.location.address}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  location: { ...prev.location, address: e.target.value },
                }))
              }
            />

            {formData.location.lat && formData.location.lng && (
              <div className="text-sm text-muted-foreground">
                📍 Location set: {formData.location.lat.toFixed(4)}, {formData.location.lng.toFixed(4)}
              </div>
            )}
          </div>
        </div>

        {/* Images */}
        <div className="space-y-2">
          <Label>Images (Optional - Max 5)</Label>
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload"
              />
              <Label
                htmlFor="image-upload"
                className="flex items-center space-x-2 cursor-pointer border border-dashed border-muted-foreground/25 rounded-md p-4 hover:bg-muted/50 transition-colors"
              >
                <Upload className="h-4 w-4" />
                <span>Click to upload images</span>
              </Label>
            </div>

            {formData.images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {formData.images.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={URL.createObjectURL(image) || "/placeholder.svg"}
                      alt={`Upload ${index + 1}`}
                      className="w-full h-24 object-cover rounded-md"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeImage(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <Button 
          type="submit" 
          className="w-full" 
          disabled={isSubmitting || (formData.reportingMode === "verified" && !user)}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting {formData.reportingMode === "anonymous" ? "Anonymous" : "Verified"} Report...
            </>
          ) : (
            <>
              {formData.reportingMode === "anonymous" ? (
                <UserX className="mr-2 h-4 w-4" />
              ) : (
                <Shield className="mr-2 h-4 w-4" />
              )}
              Submit {formData.reportingMode === "anonymous" ? "Anonymous" : "Verified"} Report
            </>
          )}
        </Button>

        {/* Quick Summary */}
        <Card className="border-muted bg-muted/20">
          <CardContent className="p-4">
            <h3 className="font-medium mb-2">Report Summary</h3>
            <div className="text-sm text-muted-foreground space-y-1">
              <p><strong>Mode:</strong> {formData.reportingMode === "anonymous" ? "Anonymous" : "Verified"}</p>
              <p><strong>Category:</strong> {formData.category ? categories.find(c => c.value === formData.category)?.label : "Not selected"}</p>
              <p><strong>Images:</strong> {formData.images.length}/5 uploaded</p>
              <p><strong>Location:</strong> {formData.location.lat ? "Set" : "Not set"}</p>
              {formData.reportingMode === "verified" && user && (
                <p><strong>Reporter:</strong> {user.name}</p>
              )}
            </div>
          </CardContent>
        </Card>
      </form>

      {/* AI Chatbot Toggle */}
      <div className="fixed bottom-4 right-4">
        <Button onClick={() => setShowChatBot(!showChatBot)} size="icon" className="h-12 w-12 rounded-full shadow-lg">
          <MessageSquare className="h-5 w-5" />
        </Button>
      </div>

      {/* Chatbot */}
      {showChatBot && (
        <div className="fixed bottom-20 right-4 w-80 h-96 z-50">
          <ChatBot onClose={() => setShowChatBot(false)} />
        </div>
      )}
    </div>
  )
}
