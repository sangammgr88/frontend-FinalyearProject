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
    <div className="flex flex-col">

      <div className="flex-1 space-y-6 p-6">
        {/* Student Profile Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
              <div className="flex gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarFallback className="bg-primary text-2xl text-primary-foreground">
                    ST
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold">Sangam Thapa</h2>
                  <p className="font-mono text-sm text-muted-foreground">
                    LC00017002053
                  </p>
                  <div className="flex gap-2">
                    <Badge variant="default">Active</Badge>
                    <Badge variant="secondary">Final Year</Badge>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span>sangam.thapa@example.com</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  <span>+977 98xxxxxxxx</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Enrolled: Sep 2020</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistics */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Exams
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">
                Enrolled in 12 exams
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Completed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">10</div>
              <p className="text-xs text-green-600">83% completion rate</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Average Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">87.6%</div>
              <p className="text-xs text-muted-foreground">Above average</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Violations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">2</div>
              <p className="text-xs text-muted-foreground">Low risk profile</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="exams">Exam History</TabsTrigger>
            <TabsTrigger value="violations">Violations</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Performance Trend</CardTitle>
                <CardDescription>
                  Score progression over recent exams
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    score: {
                      label: "Score",
                      color: "hsl(var(--chart-1))",
                    },
                  }}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={performanceData}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        className="stroke-muted"
                      />
                      <XAxis dataKey="exam" className="text-xs" />
                      <YAxis className="text-xs" domain={[0, 100]} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line
                        type="monotone"
                        dataKey="score"
                        stroke="var(--color-score)"
                        strokeWidth={2}
                        dot={{ fill: "var(--color-score)", r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="exams">
            <Card>
              <CardHeader>
                <CardTitle>Exam History</CardTitle>
                <CardDescription>
                  Complete list of attempted exams
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Exam Name</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-center">Score</TableHead>
                      <TableHead className="text-center">Violations</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {examHistory.map((exam, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">
                          {exam.name}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {exam.date}
                        </TableCell>
                        <TableCell className="text-center">
                          <span
                            className={`font-medium ${
                              exam.score >= 90
                                ? "text-green-600"
                                : exam.score >= 70
                                ? "text-blue-600"
                                : "text-yellow-600"
                            }`}
                          >
                            {exam.score}%
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          {exam.violations > 0 ? (
                            <span className="text-yellow-600">
                              {exam.violations}
                            </span>
                          ) : (
                            <CheckCircle2 className="mx-auto h-4 w-4 text-green-600" />
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            <CheckCircle2 className="mr-1 h-3 w-3" />
                            {exam.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="violations">
            <Card>
              <CardHeader>
                <CardTitle>Violation Records</CardTitle>
                <CardDescription>
                  Detected violations during exams
                </CardDescription>
              </CardHeader>
              <CardContent>
                {violations.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Exam</TableHead>
                        <TableHead>Violation Type</TableHead>
                        <TableHead>Timestamp</TableHead>
                        <TableHead>Severity</TableHead>
                        <TableHead>Action Taken</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {violations.map((violation, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">
                            {violation.exam}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <AlertTriangle className="h-4 w-4 text-yellow-600" />
                              {violation.type}
                            </div>
                          </TableCell>
                          <TableCell className="font-mono text-sm text-muted-foreground">
                            {violation.timestamp}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                violation.severity === "high"
                                  ? "destructive"
                                  : "secondary"
                              }
                            >
                              {violation.severity}
                            </Badge>
                          </TableCell>
                          <TableCell>{violation.action}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <CheckCircle2 className="mb-2 h-12 w-12 text-green-600" />
                    <p className="text-lg font-medium">No Violations</p>
                    <p className="text-sm text-muted-foreground">
                      This student has a clean record
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
