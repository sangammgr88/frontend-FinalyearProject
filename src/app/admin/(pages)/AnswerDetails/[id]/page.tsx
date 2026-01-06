"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Mail,
  Phone,
  Calendar,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import {
  Line,
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const performanceData = [
  { exam: "Exam 1", score: 85 },
  { exam: "Exam 2", score: 78 },
  { exam: "Exam 3", score: 92 },
  { exam: "Exam 4", score: 88 },
  { exam: "Exam 5", score: 95 },
];

const examHistory = [
  {
    name: "Mathematics Final",
    date: "2024-01-15",
    score: 95,
    violations: 0,
    status: "completed",
  },
  {
    name: "Physics Midterm",
    date: "2024-01-10",
    score: 88,
    violations: 1,
    status: "completed",
  },
  {
    name: "Chemistry Test",
    date: "2024-01-05",
    score: 92,
    violations: 0,
    status: "completed",
  },
  {
    name: "Biology Quiz",
    date: "2024-01-03",
    score: 78,
    violations: 1,
    status: "completed",
  },
];

const violations = [
  {
    exam: "Physics Midterm",
    type: "Tab Switch",
    timestamp: "2024-01-10 14:35:22",
    severity: "medium",
    action: "Warning Issued",
  },
  {
    exam: "Biology Quiz",
    type: "Head Movement",
    timestamp: "2024-01-03 10:15:45",
    severity: "low",
    action: "Recorded",
  },
];

export default function StudentDetailPage() {
  return (
    <div className="min-h-screen bg-muted/30">
      <div className="max-w-fit mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* ================= PROFILE HEADER ================= */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              {/* Left */}
              <div className="flex gap-4 items-center">
                <Avatar className="h-20 w-20">
                  <AvatarFallback className="bg-primary text-2xl text-primary-foreground">
                    ST
                  </AvatarFallback>
                </Avatar>

                <div className="space-y-1">
                  <h2 className="text-2xl font-semibold">Sangam Thapa</h2>
                  <p className="text-sm font-mono text-muted-foreground">
                    LC00017002053
                  </p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <Badge>Active</Badge>
                    <Badge variant="secondary">Final Year</Badge>
                  </div>
                </div>
              </div>

              {/* Right */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" /> sangam.thapa@example.com
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" /> +977 98xxxxxxxx
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" /> Enrolled: Sep 2020
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ================= STATS ================= */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { title: "Total Exams", value: "12", desc: "Enrolled exams" },
            {
              title: "Completed",
              value: "10",
              desc: "83% completion",
              accent: "text-green-600",
            },
            { title: "Average Score", value: "87.6%", desc: "Above average" },
            {
              title: "Violations",
              value: "2",
              desc: "Low risk",
              accent: "text-yellow-600",
            },
          ].map((item, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">{item.title}</p>
                <p className={`text-2xl font-semibold ${item.accent ?? ""}`}>
                  {item.value}
                </p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* ================= TABS ================= */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="bg-transparent border-b rounded-none">
            {["overview", "exams", "violations"].map((tab) => (
              <TabsTrigger
                key={tab}
                value={tab}
                className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary"
              >
                {tab === "overview"
                  ? "Overview"
                  : tab === "exams"
                  ? "Exam History"
                  : "Violations"}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* ================= OVERVIEW ================= */}
          <TabsContent value="overview">
            <Card>
              <CardHeader>
                <CardTitle>Performance Trend</CardTitle>
                <CardDescription>
                  Score progression over recent exams
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ChartContainer
                  config={{
                    score: { label: "Score", color: "hsl(var(--chart-1))" },
                  }}
                  className="h-full"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={performanceData}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        className="stroke-muted"
                      />
                      <XAxis dataKey="exam" className="text-xs" />
                      <YAxis domain={[0, 100]} className="text-xs" />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line
                        type="monotone"
                        dataKey="score"
                        stroke="var(--color-score)"
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ================= EXAMS ================= */}
          <TabsContent value="exams">
            <Card>
              <CardHeader>
                <CardTitle>Exam History</CardTitle>
                <CardDescription>Attempted exams</CardDescription>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Exam</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-center">Score</TableHead>
                      <TableHead className="text-center">Violations</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {examHistory.map((exam, i) => (
                      <TableRow key={i}>
                        <TableCell className="font-medium">
                          {exam.name}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {exam.date}
                        </TableCell>
                        <TableCell className="text-center font-semibold">
                          {exam.score}%
                        </TableCell>
                        <TableCell className="text-center">
                          {exam.violations || (
                            <CheckCircle2 className="mx-auto h-4 w-4 text-green-600" />
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{exam.status}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ================= VIOLATIONS ================= */}
          <TabsContent value="violations">
            <Card>
              <CardHeader>
                <CardTitle>Violation Records</CardTitle>
                <CardDescription>Detected issues</CardDescription>
              </CardHeader>
              <CardContent>
                {violations.length ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Exam</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Time</TableHead>
                          <TableHead>Severity</TableHead>
                          <TableHead>Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {violations.map((v, i) => (
                          <TableRow key={i}>
                            <TableCell>{v.exam}</TableCell>
                            <TableCell className="flex gap-2 items-center">
                              <AlertTriangle className="h-4 w-4 text-yellow-600" />
                              {v.type}
                            </TableCell>
                            <TableCell className="font-mono text-sm">
                              {v.timestamp}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  v.severity === "high"
                                    ? "destructive"
                                    : "secondary"
                                }
                              >
                                {v.severity}
                              </Badge>
                            </TableCell>
                            <TableCell>{v.action}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="py-10 text-center">
                    <CheckCircle2 className="mx-auto h-12 w-12 text-green-600 mb-2" />
                    <p className="font-semibold">No Violations</p>
                    <p className="text-sm text-muted-foreground">
                      Clean student record
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
