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
  TrendingUp,
  ShieldAlert,
} from "lucide-react";
import {
  Line,
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
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

const API_BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

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

      const response = await fetch(
        `${API_BASE_URL}/api/result/student/${studentId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();

      if (data.success && data.data.length > 0) {
        const firstResult = data.data[0];
        const studentInfo = firstResult.studentId;

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
        router.push("/admin/students");
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

  const getInitials = (name?: string) => {
    if (!name) return "??";
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
      student.results.reduce(
        (sum, r) => sum + (r.score / r.totalMarks) * 100,
        0,
      ) / completed;
    const totalViolations = student.results.reduce(
      (sum, r) => sum + r.violationCount,
      0,
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
      score: parseFloat(((result.score / result.totalMarks) * 100).toFixed(1)),
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
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
        <div className="text-center">
          <div className="inline-block p-4 bg-white dark:bg-slate-800 rounded-full mb-4 shadow-lg">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400" />
          </div>
          <p className="text-slate-600 dark:text-slate-300 font-medium">
            Loading student details...
          </p>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4">
        <Card className="max-w-md shadow-xl">
          <CardContent className="pt-8 text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Student Not Found</h3>
            <p className="text-slate-600 dark:text-slate-300 mb-6">
              Unable to load the requested student information.
            </p>
            <Button
              onClick={() => router.push("/admin/students")}
              className="w-full"
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
  const statusColor =
    stats.totalViolations > 5
      ? "bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800"
      : stats.totalViolations > 2
        ? "bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800"
        : "bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => router.push("/admin/student")}
          className="gap-2 text-slate-700 dark:text-slate-300 hover:bg-white/50 dark:hover:bg-slate-800/50"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Students
        </Button>

        {/* Profile Header */}
        <div className={`rounded-2xl border-2 p-8 ${statusColor} transition-colors`}>
          <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
            {/* Left - Student Info */}
            <div className="flex gap-6 items-start flex-1">
              <div className="flex-shrink-0">
                <Avatar className="h-24 w-24 shadow-lg ring-4 ring-white dark:ring-slate-800">
                  <AvatarFallback className="bg-gradient-to-br from-blue-600 to-blue-700 text-white text-2xl font-bold">
                    {getInitials(student.fullName)}
                  </AvatarFallback>
                </Avatar>
              </div>

              <div className="flex-1">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-1 text-balance">
                  {student.fullName}
                </h1>
                <p className="text-sm font-mono text-slate-600 dark:text-slate-400 mb-4">
                  ID: {student.studentIdNumber}
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge className="px-3 py-1">
                    {stats.totalViolations > 5
                      ? "🚩 Flagged"
                      : stats.totalViolations > 2
                        ? "⚠️ Warning"
                        : "✓ Active"}
                  </Badge>
                  {student.program && (
                    <Badge variant="secondary" className="px-3 py-1">
                      {student.program}
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Right - Contact Info */}
            <div className="space-y-3 lg:text-right">
              <div className="flex items-center gap-2 lg:justify-end">
                <Mail className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                <span className="text-slate-700 dark:text-slate-300">
                  {student.email}
                </span>
              </div>
              {student.institution && (
                <div className="flex items-center gap-2 lg:justify-end">
                  <BookOpen className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                  <span className="text-slate-700 dark:text-slate-300">
                    {student.institution}
                  </span>
                </div>
              )}
              {student.semester && (
                <div className="flex items-center gap-2 lg:justify-end">
                  <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                  <span className="text-slate-700 dark:text-slate-300">
                    {student.semester}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Exams */}
          <Card className="shadow-lg hover:shadow-xl transition-shadow border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Total Exams
                </p>
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <BookOpen className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <p className="text-4xl font-bold text-slate-900 dark:text-white">
                {stats.totalExams}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                Submitted & Completed
              </p>
            </CardContent>
          </Card>

          {/* Completion Rate */}
          <Card className="shadow-lg hover:shadow-xl transition-shadow border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Completion
                </p>
                <div className="p-2 bg-emerald-100 dark:bg-emerald-900 rounded-lg">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                </div>
              </div>
              <p className="text-4xl font-bold text-emerald-600 dark:text-emerald-400">
                {stats.totalExams > 0
                  ? `${((stats.completed / stats.totalExams) * 100).toFixed(0)}%`
                  : "0%"}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                All required exams
              </p>
            </CardContent>
          </Card>

          {/* Average Score */}
          <Card className="shadow-lg hover:shadow-xl transition-shadow border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Avg Score
                </p>
                <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                  <TrendingUp className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
              <p
                className={`text-4xl font-bold ${
                  stats.averageScore >= 80
                    ? "text-emerald-600 dark:text-emerald-400"
                    : stats.averageScore >= 60
                      ? "text-amber-600 dark:text-amber-400"
                      : "text-red-600 dark:text-red-400"
                }`}
              >
                {stats.averageScore.toFixed(1)}%
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                {stats.averageScore >= 80
                  ? "Excellent Performance"
                  : stats.averageScore >= 60
                    ? "Good Performance"
                    : "Needs Improvement"}
              </p>
            </CardContent>
          </Card>

          {/* Violations */}
          <Card className="shadow-lg hover:shadow-xl transition-shadow border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Violations
                </p>
                <div
                  className={`p-2 rounded-lg ${
                    stats.totalViolations > 5
                      ? "bg-red-100 dark:bg-red-900"
                      : stats.totalViolations > 0
                        ? "bg-amber-100 dark:bg-amber-900"
                        : "bg-emerald-100 dark:bg-emerald-900"
                  }`}
                >
                  <ShieldAlert
                    className={`h-4 w-4 ${
                      stats.totalViolations > 5
                        ? "text-red-600 dark:text-red-400"
                        : stats.totalViolations > 0
                          ? "text-amber-600 dark:text-amber-400"
                          : "text-emerald-600 dark:text-emerald-400"
                    }`}
                  />
                </div>
              </div>
              <p
                className={`text-4xl font-bold ${
                  stats.totalViolations > 5
                    ? "text-red-600 dark:text-red-400"
                    : stats.totalViolations > 0
                      ? "text-amber-600 dark:text-amber-400"
                      : "text-emerald-600 dark:text-emerald-400"
                }`}
              >
                {stats.totalViolations}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                {stats.totalViolations === 0
                  ? "Clean Record"
                  : stats.totalViolations > 5
                    ? "High Risk"
                    : "Low Risk"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Performance Chart */}
        {performanceData.length > 0 && (
          <Card className="shadow-lg border-0">
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl">Performance Trend</CardTitle>
              <CardDescription>
                Score progression across all exams
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="w-full h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={performanceData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="currentColor"
                      className="opacity-20"
                    />
                    <XAxis
                      dataKey="exam"
                      stroke="currentColor"
                      className="text-sm"
                    />
                    <YAxis
                      stroke="currentColor"
                      className="text-sm"
                      domain={[0, 100]}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--background))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                      formatter={(value: any) => `${value}%`}
                    />
                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke="hsl(217 91% 60%)"
                      strokeWidth={3}
                      dot={{
                        fill: "hsl(217 91% 60%)",
                        r: 5,
                      }}
                      activeDot={{ r: 7 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabs */}
        <Tabs defaultValue="exams" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:w-auto lg:inline-grid bg-slate-200/50 dark:bg-slate-800/50 p-1 rounded-xl">
            <TabsTrigger
              value="exams"
              className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-md"
            >
              <BookOpen className="h-4 w-4 mr-2" />
              Exam History
            </TabsTrigger>
            <TabsTrigger
              value="violations"
              className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-md"
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              Violations
            </TabsTrigger>
          </TabsList>

          {/* Exams Tab */}
          <TabsContent value="exams" className="space-y-4">
            <Card className="shadow-lg border-0 overflow-hidden">
              <CardHeader className="pb-4">
                <CardTitle className="text-2xl">Exam History</CardTitle>
                <CardDescription>
                  Detailed records of all submitted exams
                </CardDescription>
              </CardHeader>
              <CardContent>
                {student.results.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="hover:bg-transparent border-b-2 border-slate-200 dark:border-slate-700">
                          <TableHead className="font-semibold text-slate-900 dark:text-white">
                            Exam Title
                          </TableHead>
                          <TableHead className="font-semibold text-slate-900 dark:text-white">
                            Date
                          </TableHead>
                          <TableHead className="text-center font-semibold text-slate-900 dark:text-white">
                            Score
                          </TableHead>
                          <TableHead className="text-center font-semibold text-slate-900 dark:text-white">
                            Percentage
                          </TableHead>
                          <TableHead className="text-center font-semibold text-slate-900 dark:text-white">
                            Violations
                          </TableHead>
                          <TableHead className="font-semibold text-slate-900 dark:text-white">
                            Status
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {student.results.map((result) => (
                          <TableRow
                            key={result._id}
                            className="hover:bg-slate-50 dark:hover:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800"
                          >
                            <TableCell className="font-semibold text-slate-900 dark:text-white">
                              {result.examId.examTitle}
                            </TableCell>
                            <TableCell className="text-slate-600 dark:text-slate-400">
                              {formatDate(result.submittedAt)}
                            </TableCell>
                            <TableCell className="text-center font-semibold text-slate-900 dark:text-white">
                              {result.score}/{result.totalMarks}
                            </TableCell>
                            <TableCell className="text-center">
                              <span
                                className={`font-bold px-2 py-1 rounded ${
                                  (result.score / result.totalMarks) * 100 >= 80
                                    ? "text-emerald-600 dark:text-emerald-400"
                                    : (result.score / result.totalMarks) * 100 >=
                                        60
                                      ? "text-amber-600 dark:text-amber-400"
                                      : "text-red-600 dark:text-red-400"
                                }`}
                              >
                                {(
                                  (result.score / result.totalMarks) *
                                  100
                                ).toFixed(1)}
                                %
                              </span>
                            </TableCell>
                            <TableCell className="text-center">
                              {result.violationCount === 0 ? (
                                <div className="flex items-center justify-center">
                                  <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                                </div>
                              ) : (
                                <span
                                  className={`font-bold px-2 py-1 rounded ${
                                    result.violationCount > 3
                                      ? "text-red-600 dark:text-red-400"
                                      : "text-amber-600 dark:text-amber-400"
                                  }`}
                                >
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
                                className="capitalize"
                              >
                                {result.status}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <div className="inline-block p-4 bg-slate-100 dark:bg-slate-800 rounded-full mb-4">
                      <BookOpen className="h-8 w-8 text-slate-400 dark:text-slate-500" />
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 font-medium">
                      No exams submitted yet
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Violations Tab */}
          <TabsContent value="violations" className="space-y-4">
            <Card className="shadow-lg border-0 overflow-hidden">
              <CardHeader className="pb-4">
                <CardTitle className="text-2xl">Violation Records</CardTitle>
                <CardDescription>
                  All detected irregularities during exams
                </CardDescription>
              </CardHeader>
              <CardContent>
                {student.violations.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="hover:bg-transparent border-b-2 border-slate-200 dark:border-slate-700">
                          <TableHead className="font-semibold text-slate-900 dark:text-white">
                            Exam
                          </TableHead>
                          <TableHead className="font-semibold text-slate-900 dark:text-white">
                            Type
                          </TableHead>
                          <TableHead className="font-semibold text-slate-900 dark:text-white">
                            Timestamp
                          </TableHead>
                          <TableHead className="font-semibold text-slate-900 dark:text-white">
                            Severity
                          </TableHead>
                          <TableHead className="font-semibold text-slate-900 dark:text-white">
                            Description
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {student.violations.map((violation, index) => (
                          <TableRow
                            key={index}
                            className="hover:bg-slate-50 dark:hover:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800"
                          >
                            <TableCell className="font-semibold text-slate-900 dark:text-white">
                              {violation.exam}
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2 items-center">
                                <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                                <span className="text-slate-700 dark:text-slate-300">
                                  {violation.type}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="font-mono text-sm text-slate-600 dark:text-slate-400">
                              {violation.timestamp}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  violation.severity === "high"
                                    ? "destructive"
                                    : "secondary"
                                }
                                className="capitalize"
                              >
                                {violation.severity}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-slate-700 dark:text-slate-300">
                              {violation.description}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <div className="inline-block p-4 bg-emerald-100 dark:bg-emerald-900 rounded-full mb-4">
                      <CheckCircle2 className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                      No Violations
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400">
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
