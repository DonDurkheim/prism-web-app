'use client';

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/components/ui/use-toast"
import { Briefcase, Calendar, MapPin, Search, SlidersHorizontal, XCircle } from "lucide-react"
interface JobCompany {
  name: string
}

interface Job {
  title: string
  location: string
  company: JobCompany
}

interface Application {
  id: string
  job: Job
  status: string
  created_at: string
  ai_score?: number
}

const statusColors = {
  "pending": "bg-yellow-500/20 text-yellow-500",
  "in_review": "bg-blue-500/20 text-blue-500",
  "interview_scheduled": "bg-green-500/20 text-green-500",
  "rejected": "bg-red-500/20 text-red-500",
  "accepted": "bg-purple-500/20 text-purple-500"
}

const statusLabels = {
  "all": "All Statuses",
  "pending": "Pending",
  "in_review": "In Review",
  "interview_scheduled": "Interview Scheduled",
  "rejected": "Rejected",
  "accepted": "Accepted"
}

export default function Applications() {
  const router = useRouter()
  const { toast } = useToast()
  const [applications, setApplications] = useState<Application[]>([
    {
      id: "app1",
      job: {
        title: "Frontend Developer",
        location: "Remote",
        company: { name: "Tech Solutions Inc." },
      },
      status: "in_review",
      created_at: new Date(Date.now() - 86400000 * 10).toISOString(),
      ai_score: 85,
    },
    {
      id: "app2",
      job: {
        title: "UI/UX Designer",
        location: "New York, NY",
        company: { name: "Creative Agency" },
      },
      status: "pending",
      created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
      ai_score: 70,
    },
    {
      id: "app3",
      job: {
        title: "Backend Engineer",
        location: "San Francisco, CA",
        company: { name: "Data Innovations" },
      },
      status: "rejected",
      created_at: new Date(Date.now() - 86400000 * 15).toISOString(),
      ai_score: 60,
    },
    {
      id: "app4",
      job: {
        title: "Product Manager",
        location: "Remote",
        company: { name: "Global Corp" },
      },
      status: "interview_scheduled",
      created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
      ai_score: 92,
    },
    {
      id: "app5",
      job: {
        title: "DevOps Engineer",
        location: "Austin, TX",
        company: { name: "Cloud Services Ltd." },
      },
      status: "accepted",
      created_at: new Date(Date.now() - 86400000 * 20).toISOString(),
      ai_score: 88,
    },
  ])
  const [isLoading, setIsLoading] = useState(false) // Set to false as we're not loading from backend
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [showFilters, setShowFilters] = useState(false)

  // No useEffect or loadApplications needed as we're using mock data for now

  const filteredApplications = applications.filter(app => {
    const matchesSearch = searchQuery === "" || 
      app.job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.job.company.name.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || app.status === statusFilter

    return matchesSearch && matchesStatus
  })

  return (
    <Card className="card-gradient border-0 text-white">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Job Applications</CardTitle>
            <CardDescription className="text-white/70">Track and manage your job applications</CardDescription>
          </div>
          <Button 
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
            onClick={() => router.push("/dashboard/applicant/jobs")}
          >
            Browse Jobs
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 h-4 w-4" />
              <Input
                placeholder="Search by job title or company..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/40"
              />
            </div>
            <div className="flex gap-4">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px] bg-white/5 border-white/10 text-white">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_review">In Review</SelectItem>
                  <SelectItem value="interview_scheduled">Interview Scheduled</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="accepted">Accepted</SelectItem>
                </SelectContent>
              </Select>

              {(searchQuery || statusFilter !== "all") && (
                <Button
                  variant="outline"
                  className="border-white/10 text-white hover:bg-white/10"
                  onClick={() => {
                    setSearchQuery("")
                    setStatusFilter("all")
                  }}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Clear
                </Button>
              )}
            </div>
          </div>

          {/* Applications Table */}
          <div className="rounded-lg border border-white/10 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-white/10 hover:bg-transparent">
                  <TableHead className="text-white/70">Position</TableHead>
                  <TableHead className="text-white/70">Company</TableHead>
                  <TableHead className="text-white/70">Location</TableHead>
                  <TableHead className="text-white/70">Status</TableHead>
                  <TableHead className="text-white/70">Applied</TableHead>
                  <TableHead className="text-white/70">Match</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <AnimatePresence mode="wait">
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24">
                        <div className="flex items-center justify-center">
                          <div className="text-white/70">Loading applications...</div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : filteredApplications.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <Briefcase className="w-8 h-8 text-white/40" />
                          <div className="text-white/70">No applications found</div>
                          {searchQuery || statusFilter !== "all" ? (
                            <Button
                              variant="link"
                              className="text-white/70 hover:text-white"
                              onClick={() => {
                                setSearchQuery("")
                                setStatusFilter("all")
                              }}
                            >
                              Clear filters
                            </Button>
                          ) : (
                            <Button
                              variant="link"
                              className="text-white/70 hover:text-white"
                              onClick={() => router.push("/dashboard/applicant/jobs")}
                            >
                              Browse available jobs
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredApplications.map((app, index) => (
                      <motion.tr
                        key={app.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.2, delay: index * 0.05 }}
                        className="border-white/10 cursor-pointer group hover:bg-white/5"
                        onClick={() => router.push(`/dashboard/applicant/applications/${app.id}`)}
                      >
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Briefcase className="w-4 h-4 text-white/70" />
                            <span>{app.job.title}</span>
                          </div>
                        </TableCell>
                        <TableCell>{app.job.company.name}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-white/70" />
                            <span>{app.job.location}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={statusColors[app.status as keyof typeof statusColors]}>
                            {statusLabels[app.status as keyof typeof statusLabels]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-white/70" />
                            <span>{new Date(app.created_at).toLocaleDateString()}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {app.ai_score ? (
                            <Badge variant="outline" className="border-white/10">
                              {app.ai_score}% Match
                            </Badge>
                          ) : (
                            <span className="text-white/40">N/A</span>
                          )}
                        </TableCell>
                      </motion.tr>
                    ))
                  )}
                </AnimatePresence>
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
