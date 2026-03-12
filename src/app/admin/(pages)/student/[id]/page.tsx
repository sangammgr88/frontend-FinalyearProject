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
  BookOpen,
  TrendingUp,
  ShieldAlert,
  MonitorX,
  Activity,
  Clock,
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

// ── Types ─────────────────────────────────────────────────────────────────────

interface TabSwitch {
  timestamp: string;
  duration: number;
}

interface HeadMovements {
  left: number;
  right: number;
  up: number;
  down: number;
  tilt_left: number;
  tilt_right: number;
  no_face: number;
  multiple_faces: number;
  total: number;
  cheating_detected: boolean;
  cheating_directions: string[];
}

interface ExamResult {
  _id: string;
  examId: {
    _id: string;
    examTitle: string;
    totalMarks: number;
    duration: number;
  } | null;
  score: number;
  totalMarks: number;
  violationCount: number;
  status: string;
  submittedAt: string;
  tabSwitches: TabSwitch[];
  proctorEvents: any[];
  headMovements?: HeadMovements;
}

interface ViolationDetail {
  examTitle: string;
  examResultId: string;
  type: "tab_switch" | "head_movement";
  timestamp: string;
  duration?: number;
  severity: "low" | "medium" | "high";
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
  violations: ViolationDetail[];
}

// ── Constants ─────────────────────────────────────────────────────────────────

const API_BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

// ── Helpers ───────────────────────────────────────────────────────────────────

function getInitials(name?: string) {
  if (!name) return "??";
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatDateTime(dateString: string) {
  return new Date(dateString).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function buildViolations(results: ExamResult[]): ViolationDetail[] {
  const violations: ViolationDetail[] = [];

  results.forEach((result) => {
    const examTitle = result.examId?.examTitle ?? "Deleted Exam";

    // Tab switches
    result.tabSwitches?.forEach((ts) => {
      const dur = ts.duration ?? 0;
      violations.push({
        examTitle,
        examResultId: result._id,
        type: "tab_switch",
        timestamp: ts.timestamp,
        duration: dur,
        severity: dur > 30 ? "high" : dur > 10 ? "medium" : "low",
        description: `Switched away from exam tab for ${dur}s`,
      });
    });

    // Head movements — only flag if cheating detected
    if (result.headMovements?.cheating_detected) {
      violations.push({
        examTitle,
        examResultId: result._id,
        type: "head_movement",
        timestamp: result.submittedAt,
        severity: result.headMovements.total > 15 ? "high" : "medium",
        description: `Suspicious head movements — directions: ${result.headMovements.cheating_directions.join(", ")} (${result.headMovements.total} total)`,
      });
    }
  });

  violations.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return violations;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function StudentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const studentId = params.id as string;
  const { toast } = useToast();

  const [student, setStudent] = useState<StudentData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudentDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentId]);

  const fetchStudentDetails = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast({ title: "Authentication Required", description: "Please login as admin", variant: "destructive" });
        router.push("/admin/dashboard");
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/result/student/${studentId}`, {
        method: "GET",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      });

      const data = await response.json();

      if (data.success && data.data.length > 0) {
        const studentInfo = data.data[0].studentId;
        setStudent({
          studentId: studentInfo._id,
          fullName: studentInfo.fullName,
          email: studentInfo.email,
          studentIdNumber: studentInfo.studentId || "N/A",
          institution: studentInfo.institution,
          program: studentInfo.program,
          semester: studentInfo.semester,
          results: data.data,
          violations: buildViolations(data.data),
        });
      } else {
        toast({ title: "Student Not Found", description: "No results found for this student", variant: "destructive" });
        router.push("/admin/students");
      }
    } catch (error) {
      console.error("Error fetching student details:", error);
      toast({ title: "Error", description: "Failed to fetch student details", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  // ── Derived stats ──────────────────────────────────────────────────────────

  const stats = (() => {
    if (!student || student.results.length === 0)
      return { totalExams: 0, averageScore: 0, totalViolations: 0, tabSwitchCount: 0, totalHeadMovements: 0, cheatingDetectedCount: 0 };

    const totalExams = student.results.length;
    const averageScore = student.results.reduce((sum, r) => sum + (r.score / r.totalMarks) * 100, 0) / totalExams;
    const totalViolations = student.results.reduce((sum, r) => sum + r.violationCount, 0);
    const tabSwitchCount = student.results.reduce((sum, r) => sum + (r.tabSwitches?.length ?? 0), 0);
    const totalHeadMovements = student.results.reduce((sum, r) => sum + (r.headMovements?.total ?? 0), 0);
    const cheatingDetectedCount = student.results.filter((r) => r.headMovements?.cheating_detected).length;

    return { totalExams, averageScore, totalViolations, tabSwitchCount, totalHeadMovements, cheatingDetectedCount };
  })();

  const performanceData = student?.results.map((r, i) => ({
    exam: r.examId?.examTitle
      ? r.examId.examTitle.length > 14 ? r.examId.examTitle.slice(0, 14) + "…" : r.examId.examTitle
      : `Exam ${i + 1}`,
    score: parseFloat(((r.score / r.totalMarks) * 100).toFixed(1)),
  })) ?? [];

  const riskBorder =
    stats.cheatingDetectedCount > 0 || stats.totalViolations > 5
      ? "border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950"
      : stats.totalViolations > 2
      ? "border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950"
      : "border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950";

  const riskLabel =
    stats.cheatingDetectedCount > 0 || stats.totalViolations > 5
      ? "🚩 Flagged"
      : stats.totalViolations > 2
      ? "⚠️ Warning"
      : "✓ Active";

  // ── Loading / not-found ────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
        <div className="text-center">
          <div className="inline-block p-4 bg-white dark:bg-slate-800 rounded-full mb-4 shadow-lg">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400" />
          </div>
          <p className="text-slate-600 dark:text-slate-300 font-medium">Loading student details…</p>
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
            <p className="text-slate-600 dark:text-slate-300 mb-6">Unable to load the requested student information.</p>
            <Button onClick={() => router.push("/admin/students")} className="w-full">Back to Students</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── Main render ────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* Back */}
        <Button
          variant="ghost"
          onClick={() => router.push("/admin/student")}
          className="gap-2 text-slate-700 dark:text-slate-300 hover:bg-white/50 dark:hover:bg-slate-800/50"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Students
        </Button>

        {/* ── Profile Header ─────────────────────────────────────────────── */}
        <div className={`rounded-2xl border-2 p-8 transition-colors ${riskBorder}`}>
          <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex gap-6 items-start flex-1">
              <Avatar className="h-24 w-24 flex-shrink-0 shadow-lg ring-4 ring-white dark:ring-slate-800">
                <AvatarFallback className="bg-gradient-to-br from-blue-600 to-blue-700 text-white text-2xl font-bold">
                  {getInitials(student.fullName)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">{student.fullName}</h1>
                <p className="text-sm font-mono text-slate-600 dark:text-slate-400 mb-4">ID: {student.studentIdNumber}</p>
                <div className="flex flex-wrap gap-2">
                  <Badge className="px-3 py-1">{riskLabel}</Badge>
                  {student.program && <Badge variant="secondary" className="px-3 py-1">{student.program}</Badge>}
                </div>
              </div>
            </div>
            <div className="space-y-3 lg:text-right">
              <div className="flex items-center gap-2 lg:justify-end">
                <Mail className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                <span className="text-slate-700 dark:text-slate-300">{student.email}</span>
              </div>
              {student.institution && (
                <div className="flex items-center gap-2 lg:justify-end">
                  <BookOpen className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                  <span className="text-slate-700 dark:text-slate-300">{student.institution}</span>
                </div>
              )}
              {student.semester && (
                <div className="flex items-center gap-2 lg:justify-end">
                  <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                  <span className="text-slate-700 dark:text-slate-300">{student.semester}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Stats Grid ─────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">

          <Card className="shadow-lg hover:shadow-xl transition-shadow border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Exams</p>
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <BookOpen className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <p className="text-4xl font-bold text-slate-900 dark:text-white">{stats.totalExams}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">Submitted</p>
            </CardContent>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition-shadow border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Avg Score</p>
                <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                  <TrendingUp className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
              <p className={`text-4xl font-bold ${
                stats.averageScore >= 80 ? "text-emerald-600 dark:text-emerald-400"
                : stats.averageScore >= 60 ? "text-amber-600 dark:text-amber-400"
                : "text-red-600 dark:text-red-400"
              }`}>
                {stats.averageScore.toFixed(1)}%
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                {stats.averageScore >= 80 ? "Excellent" : stats.averageScore >= 60 ? "Good" : "Needs Improvement"}
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition-shadow border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Tab Switches</p>
                <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                  <MonitorX className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
              <p className={`text-4xl font-bold ${
                stats.tabSwitchCount > 0 ? "text-orange-600 dark:text-orange-400" : "text-emerald-600 dark:text-emerald-400"
              }`}>
                {stats.tabSwitchCount}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">Focus lost events</p>
            </CardContent>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition-shadow border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Head Movements</p>
                <div className="p-2 bg-rose-100 dark:bg-rose-900 rounded-lg">
                  <Activity className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                </div>
              </div>
              <p className={`text-4xl font-bold ${
                stats.totalHeadMovements > 0 ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"
              }`}>
                {stats.totalHeadMovements}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                {stats.cheatingDetectedCount > 0
                  ? `⚠️ Cheating in ${stats.cheatingDetectedCount} exam${stats.cheatingDetectedCount > 1 ? "s" : ""}`
                  : "No cheating detected"}
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition-shadow border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Violations</p>
                <div className={`p-2 rounded-lg ${
                  stats.totalViolations > 5 ? "bg-red-100 dark:bg-red-900"
                  : stats.totalViolations > 0 ? "bg-amber-100 dark:bg-amber-900"
                  : "bg-emerald-100 dark:bg-emerald-900"
                }`}>
                  <ShieldAlert className={`h-4 w-4 ${
                    stats.totalViolations > 5 ? "text-red-600 dark:text-red-400"
                    : stats.totalViolations > 0 ? "text-amber-600 dark:text-amber-400"
                    : "text-emerald-600 dark:text-emerald-400"
                  }`} />
                </div>
              </div>
              <p className={`text-4xl font-bold ${
                stats.totalViolations > 5 ? "text-red-600 dark:text-red-400"
                : stats.totalViolations > 0 ? "text-amber-600 dark:text-amber-400"
                : "text-emerald-600 dark:text-emerald-400"
              }`}>
                {stats.totalViolations}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                {stats.totalViolations === 0 ? "Clean Record" : stats.totalViolations > 5 ? "High Risk" : "Low Risk"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* ── Performance Chart ───────────────────────────────────────────── */}
        {performanceData.length > 0 && (
          <Card className="shadow-lg border-0">
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl">Performance Trend</CardTitle>
              <CardDescription>Score progression across all exams</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="w-full h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="opacity-20" />
                    <XAxis dataKey="exam" stroke="currentColor" className="text-sm" />
                    <YAxis stroke="currentColor" className="text-sm" domain={[0, 100]} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--background))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                      formatter={(value: any) => [`${value}%`, "Score"]}
                    />
                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke="hsl(217 91% 60%)"
                      strokeWidth={3}
                      dot={{ fill: "hsl(217 91% 60%)", r: 5 }}
                      activeDot={{ r: 7 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ── Tabs ────────────────────────────────────────────────────────── */}
        <Tabs defaultValue="exams" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid bg-slate-200/50 dark:bg-slate-800/50 p-1 rounded-xl">
            <TabsTrigger value="exams" className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-md">
              <BookOpen className="h-4 w-4 mr-2" />
              Exam History
            </TabsTrigger>
            <TabsTrigger value="headmovements" className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-md">
              <Activity className="h-4 w-4 mr-2" />
              Head Movements
              {stats.cheatingDetectedCount > 0 && (
                <Badge variant="destructive" className="ml-2 h-5 px-1.5 text-xs">{stats.cheatingDetectedCount}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="violations" className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-md">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Violations
              {student.violations.length > 0 && (
                <Badge variant="destructive" className="ml-2 h-5 px-1.5 text-xs">{student.violations.length}</Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* ── Exam History Tab ──────────────────────────────────────────── */}
          <TabsContent value="exams">
            <Card className="shadow-lg border-0 overflow-hidden">
              <CardHeader className="pb-4">
                <CardTitle className="text-2xl">Exam History</CardTitle>
                <CardDescription>Detailed records of all submitted exams</CardDescription>
              </CardHeader>
              <CardContent>
                {student.results.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="hover:bg-transparent border-b-2 border-slate-200 dark:border-slate-700">
                          <TableHead className="font-semibold text-slate-900 dark:text-white">Exam Title</TableHead>
                          <TableHead className="font-semibold text-slate-900 dark:text-white">Date</TableHead>
                          <TableHead className="text-center font-semibold text-slate-900 dark:text-white">Score</TableHead>
                          <TableHead className="text-center font-semibold text-slate-900 dark:text-white">Percentage</TableHead>
                          <TableHead className="text-center font-semibold text-slate-900 dark:text-white">Tab Switches</TableHead>
                          <TableHead className="text-center font-semibold text-slate-900 dark:text-white">Head Movements</TableHead>
                          <TableHead className="font-semibold text-slate-900 dark:text-white">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {student.results.map((result) => {
                          const pct = (result.score / result.totalMarks) * 100;
                          const hm = result.headMovements;
                          return (
                            <TableRow key={result._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                              <TableCell className="font-semibold text-slate-900 dark:text-white">
                                {result.examId?.examTitle ?? <span className="text-slate-400 italic">Deleted Exam</span>}
                              </TableCell>
                              <TableCell className="text-slate-600 dark:text-slate-400">{formatDate(result.submittedAt)}</TableCell>
                              <TableCell className="text-center font-semibold text-slate-900 dark:text-white">
                                {result.score}/{result.totalMarks}
                              </TableCell>
                              <TableCell className="text-center">
                                <span className={`font-bold px-2 py-1 rounded ${
                                  pct >= 80 ? "text-emerald-600 dark:text-emerald-400"
                                  : pct >= 60 ? "text-amber-600 dark:text-amber-400"
                                  : "text-red-600 dark:text-red-400"
                                }`}>
                                  {pct.toFixed(1)}%
                                </span>
                              </TableCell>
                              <TableCell className="text-center">
                                {result.tabSwitches?.length > 0 ? (
                                  <div className="flex items-center justify-center gap-1">
                                    <MonitorX className="h-4 w-4 text-orange-500" />
                                    <span className="font-bold text-orange-600 dark:text-orange-400">{result.tabSwitches.length}</span>
                                  </div>
                                ) : (
                                  <CheckCircle2 className="h-5 w-5 text-emerald-500 mx-auto" />
                                )}
                              </TableCell>
                              <TableCell className="text-center">
                                {hm && hm.total > 0 ? (
                                  <div className="flex items-center justify-center gap-1">
                                    <Activity className="h-4 w-4 text-rose-500" />
                                    <span className={`font-bold ${hm.cheating_detected ? "text-red-600 dark:text-red-400" : "text-slate-600 dark:text-slate-400"}`}>
                                      {hm.total}
                                    </span>
                                    {hm.cheating_detected && (
                                      <Badge variant="destructive" className="text-xs px-1 py-0 h-4 ml-1">cheat</Badge>
                                    )}
                                  </div>
                                ) : (
                                  <CheckCircle2 className="h-5 w-5 text-emerald-500 mx-auto" />
                                )}
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant={
                                    result.status === "passed" ? "default"
                                    : result.status === "flagged" ? "destructive"
                                    : "secondary"
                                  }
                                  className="capitalize"
                                >
                                  {result.status}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <div className="inline-block p-4 bg-slate-100 dark:bg-slate-800 rounded-full mb-4">
                      <BookOpen className="h-8 w-8 text-slate-400" />
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 font-medium">No exams submitted yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Head Movements Tab ────────────────────────────────────────── */}
          <TabsContent value="headmovements">
            <div className="space-y-4">
              {student.results.map((result) => {
                const hm = result.headMovements;
                if (!hm) return null;

                const movementRows = [
                  { label: "Left",           value: hm.left,           suspicious: hm.cheating_directions.includes("left") },
                  { label: "Right",          value: hm.right,          suspicious: hm.cheating_directions.includes("right") },
                  { label: "Up",             value: hm.up,             suspicious: hm.cheating_directions.includes("up") },
                  { label: "Down",           value: hm.down,           suspicious: hm.cheating_directions.includes("down") },
                  { label: "Tilt Left",      value: hm.tilt_left,      suspicious: hm.cheating_directions.includes("tilt_left") },
                  { label: "Tilt Right",     value: hm.tilt_right,     suspicious: hm.cheating_directions.includes("tilt_right") },
                  { label: "No Face",        value: hm.no_face,        suspicious: false },
                  { label: "Multiple Faces", value: hm.multiple_faces, suspicious: false },
                ];

                return (
                  <Card
                    key={result._id}
                    className={`shadow-lg border-0 overflow-hidden ${hm.cheating_detected ? "ring-2 ring-red-400 dark:ring-red-600" : ""}`}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between flex-wrap gap-3">
                        <div>
                          <CardTitle className="text-lg">
                            {result.examId?.examTitle ?? <span className="italic text-slate-400">Deleted Exam</span>}
                          </CardTitle>
                          <CardDescription>{formatDateTime(result.submittedAt)}</CardDescription>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          {hm.cheating_detected ? (
                            <Badge variant="destructive" className="gap-1">
                              <AlertTriangle className="h-3 w-3" />
                              Cheating Detected
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="gap-1">
                              <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                              No Cheating
                            </Badge>
                          )}
                          <Badge variant="outline" className="gap-1">
                            <Activity className="h-3 w-3" />
                            {hm.total} total movements
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {/* Direction tiles */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 mb-4">
                        {movementRows.map(({ label, value, suspicious }) => (
                          <div
                            key={label}
                            className={`rounded-xl p-3 text-center border ${
                              suspicious && value > 0
                                ? "bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800"
                                : value > 0
                                ? "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                                : "bg-slate-50/50 dark:bg-slate-900 border-slate-100 dark:border-slate-800"
                            }`}
                          >
                            <p className={`text-2xl font-bold ${
                              suspicious && value > 0 ? "text-red-600 dark:text-red-400"
                              : value > 0 ? "text-slate-800 dark:text-slate-200"
                              : "text-slate-400 dark:text-slate-600"
                            }`}>
                              {value}
                            </p>
                            <p className={`text-xs mt-1 font-medium ${
                              suspicious && value > 0 ? "text-red-500 dark:text-red-400" : "text-slate-500 dark:text-slate-400"
                            }`}>
                              {label}{suspicious && value > 0 && " ⚠️"}
                            </p>
                          </div>
                        ))}
                      </div>

                      {/* Progress bars */}
                      {hm.total > 0 && (
                        <div className="space-y-2 mt-4">
                          {movementRows.filter((r) => r.value > 0).map(({ label, value, suspicious }) => (
                            <div key={label} className="flex items-center gap-3">
                              <span className={`text-xs font-medium w-24 flex-shrink-0 ${suspicious ? "text-red-600 dark:text-red-400" : "text-slate-600 dark:text-slate-400"}`}>
                                {label}
                              </span>
                              <div className="flex-1 bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                                <div
                                  className={`h-2 rounded-full transition-all ${suspicious ? "bg-red-500" : "bg-blue-500"}`}
                                  style={{ width: `${(value / hm.total) * 100}%` }}
                                />
                              </div>
                              <span className={`text-xs font-bold w-16 text-right ${suspicious ? "text-red-600 dark:text-red-400" : "text-slate-700 dark:text-slate-300"}`}>
                                {value} ({((value / hm.total) * 100).toFixed(0)}%)
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      {hm.total === 0 && (
                        <div className="text-center py-6 text-slate-400 dark:text-slate-500 text-sm">
                          No head movements recorded for this exam
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* ── Violations Tab ────────────────────────────────────────────── */}
          <TabsContent value="violations">
            <Card className="shadow-lg border-0 overflow-hidden">
              <CardHeader className="pb-4">
                <CardTitle className="text-2xl">Violation Records</CardTitle>
                <CardDescription>Tab switches and suspicious head movements detected during exams</CardDescription>
              </CardHeader>
              <CardContent>
                {student.violations.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="hover:bg-transparent border-b-2 border-slate-200 dark:border-slate-700">
                          <TableHead className="font-semibold text-slate-900 dark:text-white">Exam</TableHead>
                          <TableHead className="font-semibold text-slate-900 dark:text-white">Type</TableHead>
                          <TableHead className="font-semibold text-slate-900 dark:text-white">Timestamp</TableHead>
                          <TableHead className="text-center font-semibold text-slate-900 dark:text-white">Duration</TableHead>
                          <TableHead className="font-semibold text-slate-900 dark:text-white">Severity</TableHead>
                          <TableHead className="font-semibold text-slate-900 dark:text-white">Description</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {student.violations.map((v, i) => (
                          <TableRow key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                            <TableCell className="font-semibold text-slate-900 dark:text-white max-w-[160px] truncate">
                              {v.examTitle}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {v.type === "tab_switch"
                                  ? <MonitorX className="h-4 w-4 text-orange-500 flex-shrink-0" />
                                  : <Activity className="h-4 w-4 text-rose-500 flex-shrink-0" />
                                }
                                <span className="text-slate-700 dark:text-slate-300 text-sm">
                                  {v.type === "tab_switch" ? "Tab Switch" : "Head Movement"}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="font-mono text-xs text-slate-600 dark:text-slate-400">
                              {formatDateTime(v.timestamp)}
                            </TableCell>
                            <TableCell className="text-center">
                              {v.duration !== undefined ? (
                                <div className="flex items-center justify-center gap-1 text-sm font-semibold text-slate-700 dark:text-slate-300">
                                  <Clock className="h-3.5 w-3.5 text-slate-400" />
                                  {v.duration}s
                                </div>
                              ) : (
                                <span className="text-slate-400">—</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={v.severity === "high" ? "destructive" : v.severity === "medium" ? "secondary" : "outline"}
                                className="capitalize"
                              >
                                {v.severity}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-slate-700 dark:text-slate-300 text-sm max-w-[300px]">
                              {v.description}
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
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No Violations</h3>
                    <p className="text-slate-600 dark:text-slate-400">This student has a clean record</p>
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