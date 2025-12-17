"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Users,
  FileText,
  Eye,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import {
  Bar,
  BarChart,
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

const statsData = [
  {
    title: "Total Students",
    value: "2,543",
    change: "+12.5%",
    trend: "up",
    icon: Users,
  },
  {
    title: "Active Exams",
    value: "18",
    change: "+4",
    trend: "up",
    icon: FileText,
  },
  {
    title: "Live Monitoring",
    value: "156",
    change: "Active",
    trend: "neutral",
    icon: Eye,
  },
  {
    title: "Violations Today",
    value: "12",
    change: "-8.3%",
    trend: "down",
    icon: AlertTriangle,
  },
];

const examActivityData = [
  { name: "Mon", exams: 24, violations: 3 },
  { name: "Tue", exams: 32, violations: 5 },
  { name: "Wed", exams: 28, violations: 2 },
  { name: "Thu", exams: 35, violations: 7 },
  { name: "Fri", exams: 42, violations: 4 },
  { name: "Sat", exams: 18, violations: 1 },
  { name: "Sun", exams: 12, violations: 2 },
];

const recentViolations = [
  {
    student: "John Doe",
    exam: "Mathematics Final",
    type: "Tab Switch",
    time: "2 mins ago",
    severity: "medium",
  },
  {
    student: "Sarah Smith",
    exam: "Physics Midterm",
    type: "Multiple Faces",
    time: "5 mins ago",
    severity: "high",
  },
  {
    student: "Mike Johnson",
    exam: "Chemistry Test",
    type: "Head Movement",
    time: "8 mins ago",
    severity: "low",
  },
  {
    student: "Emily Brown",
    exam: "Biology Quiz",
    type: "No Face Detected",
    time: "12 mins ago",
    severity: "high",
  },
];

export default function HomePage() {
  return (
    <div className="flex flex-col">

      <div className="flex-1 space-y-6 p-6">
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {statsData.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p
                    className={`flex items-center gap-1 text-xs ${
                      stat.trend === "up"
                        ? "text-green-600"
                        : stat.trend === "down"
                        ? "text-red-600"
                        : "text-muted-foreground"
                    }`}
                  >
                    {stat.trend === "up" && <TrendingUp className="h-3 w-3" />}
                    {stat.trend === "down" && (
                      <TrendingDown className="h-3 w-3" />
                    )}
                    {stat.change}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Charts */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Exam Activity</CardTitle>
              <CardDescription>
                Number of exams conducted this week
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  exams: {
                    label: "Exams",
                    color: "hsl(var(--chart-1))",
                  },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={examActivityData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      className="stroke-muted"
                    />
                    <XAxis dataKey="name" className="text-xs" />
                    <YAxis className="text-xs" />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar
                      dataKey="exams"
                      fill="var(--color-exams)"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Violations Trend</CardTitle>
              <CardDescription>
                Cheating detection over the past week
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  violations: {
                    label: "Violations",
                    color: "hsl(var(--chart-5))",
                  },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={examActivityData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      className="stroke-muted"
                    />
                    <XAxis dataKey="name" className="text-xs" />
                    <YAxis className="text-xs" />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line
                      type="monotone"
                      dataKey="violations"
                      stroke="var(--color-violations)"
                      strokeWidth={2}
                      dot={{ fill: "var(--color-violations)" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        {/* Recent Violations Table */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Violations</CardTitle>
            <CardDescription>Latest cheating attempts detected</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentViolations.map((violation, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between border-b border-border pb-4 last:border-0 last:pb-0"
                >
                  <div className="flex-1">
                    <p className="font-medium">{violation.student}</p>
                    <p className="text-sm text-muted-foreground">
                      {violation.exam}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        violation.severity === "high"
                          ? "bg-destructive/10 text-destructive"
                          : violation.severity === "medium"
                          ? "bg-yellow-500/10 text-yellow-600"
                          : "bg-blue-500/10 text-blue-600"
                      }`}
                    >
                      {violation.type}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {violation.time}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
