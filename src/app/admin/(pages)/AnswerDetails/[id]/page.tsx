"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { useToast } from "@/components/ui/use-toast";
import {
  Mail,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  ArrowLeft,
  Loader2,
  Award,
  BookOpen,
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

interface ExamResult {
  _id: string;
  examId: {
    examTitle: string;
    totalMarks: number;
    duration: number;
  };
  score: number;
  totalMarks: number;
  violationCount: number;
  status: string;
  submittedAt: string;
}

interface ViolationLog {
  exam: string;
  type: string;
  timestamp: string;
  severity: string;
  description: string;
}

interface StudentData {
  studentId: string;
  fullName: string;
  email: string;
  studentIdNumber: string;
  institution?: string;
  program?: string;
  semester?: string;
  results: ExamResult[];
  violations: ViolationLog[];
}

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

export default function StudentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const studentId = params.id as string;
  const { toast } = useToast();

  const [student, setStudent] = useState<StudentData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudentDetails();
  }, [studentId]);

  const fetchStudentDetails = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        toast({
          title: "Authentication Required",
          description: "Please login as admin",
          variant: "destructive",
        });
        router.push("/admin/dashboard");
        return;
      }

      // Fetch student results
      const response = await fetch(
        `${API_BASE_URL}/api/result/student/${studentId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (data.success && data.data.length > 0) {
        // Get student info from first result
        const firstResult = data.data[0];
        const studentInfo = firstResult.studentId;

        // Fetch violations (if endpoint exists)
        // For now, we'll extract from results
        const violations: ViolationLog[] = [];
        
        data.data.forEach((result: any) => {
          if (result.violationCount > 0) {
            violations.push({
              exam: result.examId.examTitle,
              type: "Various Violations",
              timestamp: new Date(result.submittedAt).toLocaleString(),
              severity: result.violationCount > 3 ? "high" : "medium",
              description: `${result.violationCount} violations detected`,
            });
          }
        });

        setStudent({
          studentId: studentInfo._id,
          fullName: studentInfo.fullName,
          email: studentInfo.email,
          studentIdNumber: studentInfo.studentId || "N/A",
          institution: studentInfo.institution,
          program: studentInfo.program,
          semester: studentInfo.semester,
          results: data.data,
          violations: violations,
        });
      } else {
        toast({
          title: "Student Not Found",
          description: "No results found for this student",
          variant: "destructive",
        });
        // router.push("/admin/students");
      }
    } catch (error) {
      console.error("Error fetching student details:", error);
      toast({
        title: "Error",
        description: "Failed to fetch student details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const calculateStats = () => {
    if (!student || student.results.length === 0) {
      return {
        totalExams: 0,
        completed: 0,
        averageScore: 0,
        totalViolations: 0,
      };
    }

    const completed = student.results.length;
    const averageScore =
      student.results.reduce((sum, r) => sum + (r.score / r.totalMarks) * 100, 0) /
      completed;
    const totalViolations = student.results.reduce(
      (sum, r) => sum + r.violationCount,
      0
    );

    return {
      totalExams: completed,
      completed,
      averageScore,
      totalViolations,
    };
  };

  const getPerformanceData = () => {
    if (!student) return [];
    
    return student.results.map((result, index) => ({
      exam: `Exam ${index + 1}`,
      score: ((result.score / result.totalMarks) * 100).toFixed(1),
    }));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
          <p className="mt-4 text-muted-foreground">Loading student details...</p>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Student not found</p>
            <Button
              className="mt-4"
              onClick={() => router.push("/admin/students")}
            >
              Back to Students
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const stats = calculateStats();
  const performanceData = getPerformanceData();

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => router.push("/admin/students")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Students
        </Button>

        {/* Profile Header */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              {/* Left */}
              <div className="flex gap-4 items-center">
                <Avatar className="h-20 w-20">
                  <AvatarFallback className="bg-primary text-2xl text-primary-foreground">
                    {getInitials(student.fullName)}
                  </AvatarFallback>
                </Avatar>

                <div className="space-y-1">
                  <h2 className="text-2xl font-semibold">{student.fullName}</h2>
                  <p className="text-sm font-mono text-muted-foreground">
                    {student.studentIdNumber}
                  </p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <Badge>
                      {stats.totalViolations > 5
                        ? "Flagged"
                        : stats.totalViolations > 2
                        ? "Warning"
                        : "Active"}
                    </Badge>
                    {student.program && (
                      <Badge variant="secondary">{student.program}</Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Right */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" /> {student.email}
                </div>
                {student.institution && (
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4" /> {student.institution}
                  </div>
                )}
                {student.semester && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" /> {student.semester}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Total Exams</p>
              <p className="text-2xl font-semibold">{stats.totalExams}</p>
              <p className="text-xs text-muted-foreground">Submitted</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Completed</p>
              <p className="text-2xl font-semibold text-green-600">
                {stats.completed}
              </p>
              <p className="text-xs text-muted-foreground">
                {stats.totalExams > 0
                  ? `${((stats.completed / stats.totalExams) * 100).toFixed(0)}% completion`
                  : "No exams"}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Average Score</p>
              <p className={`text-2xl font-semibold ${
                stats.averageScore >= 80 ? "text-green-600" :
                stats.averageScore >= 60 ? "text-orange-600" :
                "text-red-600"
              }`}>
                {stats.averageScore.toFixed(1)}%
              </p>
              <p className="text-xs text-muted-foreground">
                {stats.averageScore >= 80
                  ? "Excellent"
                  : stats.averageScore >= 60
                  ? "Good"
                  : "Needs improvement"}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Violations</p>
              <p
                className={`text-2xl font-semibold ${
                  stats.totalViolations > 5
                    ? "text-red-600"
                    : stats.totalViolations > 0
                    ? "text-yellow-600"
                    : "text-green-600"
                }`}
              >
                {stats.totalViolations}
              </p>
              <p className="text-xs text-muted-foreground">
                {stats.totalViolations === 0
                  ? "Clean record"
                  : stats.totalViolations > 5
                  ? "High risk"
                  : "Low risk"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="bg-transparent border-b rounded-none">
            <TabsTrigger
              value="overview"
              className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="exams"
              className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary"
            >
              Exam History
            </TabsTrigger>
            <TabsTrigger
              value="violations"
              className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary"
            >
              Violations
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <Card>
              <CardHeader>
                <CardTitle>Performance Trend</CardTitle>
                <CardDescription>
                  Score progression over recent exams
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                {performanceData.length > 0 ? (
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
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-muted-foreground">No exam data available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Exams Tab */}
          <TabsContent value="exams">
            <Card>
              <CardHeader>
                <CardTitle>Exam History</CardTitle>
                <CardDescription>All submitted exams</CardDescription>
              </CardHeader>
              <CardContent>
                {student.results.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Exam</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-center">Score</TableHead>
                        <TableHead className="text-center">Percentage</TableHead>
                        <TableHead className="text-center">Violations</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {student.results.map((result) => (
                        <TableRow key={result._id}>
                          <TableCell className="font-medium">
                            {result.examId.examTitle}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {formatDate(result.submittedAt)}
                          </TableCell>
                          <TableCell className="text-center font-semibold">
                            {result.score}/{result.totalMarks}
                          </TableCell>
                          <TableCell className="text-center">
                            <span className={`font-semibold ${
                              (result.score / result.totalMarks) * 100 >= 80
                                ? "text-green-600"
                                : (result.score / result.totalMarks) * 100 >= 60
                                ? "text-orange-600"
                                : "text-red-600"
                            }`}>
                              {((result.score / result.totalMarks) * 100).toFixed(1)}%
                            </span>
                          </TableCell>
                          <TableCell className="text-center">
                            {result.violationCount === 0 ? (
                              <CheckCircle2 className="mx-auto h-4 w-4 text-green-600" />
                            ) : (
                              <span className={result.violationCount > 3 ? "text-red-600 font-semibold" : "text-yellow-600"}>
                                {result.violationCount}
                              </span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                result.status === "passed"
                                  ? "default"
                                  : result.status === "flagged"
                                  ? "destructive"
                                  : "secondary"
                              }
                            >
                              {result.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-12">
                    <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No exams submitted yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Violations Tab */}
          <TabsContent value="violations">
            <Card>
              <CardHeader>
                <CardTitle>Violation Records</CardTitle>
                <CardDescription>Detected issues during exams</CardDescription>
              </CardHeader>
              <CardContent>
                {student.violations.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Exam</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Time</TableHead>
                        <TableHead>Severity</TableHead>
                        <TableHead>Description</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {student.violations.map((violation, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">
                            {violation.exam}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2 items-center">
                              <AlertTriangle className="h-4 w-4 text-yellow-600" />
                              {violation.type}
                            </div>
                          </TableCell>
                          <TableCell className="font-mono text-sm">
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
                          <TableCell>{violation.description}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
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