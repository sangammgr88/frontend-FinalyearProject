import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "@/components/user/Header";
import { AlertCircle, BookOpen, Calendar, CheckCircle, Clock, Eye } from "lucide-react";
import React from "react";

const page = () => {
  const stats = [
    {
      label: "Upcoming Exams",
      value: "3",
      icon: BookOpen,
      color: "text-blue-500",
      bgColor: "bg-blue-50 dark:bg-blue-950",
    },
    {
      label: "In Progress",
      value: "1",
      icon: Clock,
      color: "text-amber-500",
      bgColor: "bg-amber-50 dark:bg-amber-950",
    },
    {
      label: "Alerts",
      value: "2",
      icon: AlertCircle,
      color: "text-red-500",
      bgColor: "bg-red-50 dark:bg-red-950",
    },
    {
      label: "Completed",
      value: "12",
      icon: CheckCircle,
      color: "text-green-500",
      bgColor: "bg-green-50 dark:bg-green-950",
    },
  ];

  const exams = [
    {
      id: 1,
      name: "Data Structures & Algorithms",
      date: "Dec 30, 2025",
      time: "10:00 AM - 12:00 PM",
      status: "upcoming",
      duration: "2 hours",
      course: "CS-201",
    },
    {
      id: 2,
      name: "Advanced Java Programming",
      date: "Jan 5, 2026",
      time: "2:00 PM - 4:00 PM",
      status: "upcoming",
      duration: "2 hours",
      course: "CS-305",
    },
    {
      id: 3,
      name: "Database Management Systems",
      date: "Dec 28, 2025",
      time: "9:00 AM - 11:00 AM",
      status: "completed",
      duration: "2 hours",
      course: "CS-210",
    },
    {
      id: 4,
      name: "Web Development Fundamentals",
      date: "Jan 10, 2026",
      time: "3:30 PM - 5:30 PM",
      status: "upcoming",
      duration: "2 hours",
      course: "CS-301",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "upcoming":
        return "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-200";
      case "completed":
        return "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-200";
      case "in-progress":
        return "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-200";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-950 dark:text-gray-200";
    }
  };
  return (
    <div>
      <Header />
      <div>
        <div className="grid gap-4 md:grid-cols-4 mt-6 p-6">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label} className="border-border">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {stat.label}
                      </p>
                      <p className="mt-2 text-2xl font-bold text-foreground">
                        {stat.value}
                      </p>
                    </div>
                    <div className={`${stat.bgColor} rounded-lg p-3`}>
                      <Icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
      <div className="p-6">
        <Card className="border-border ">
        <CardHeader>
          <CardTitle>Your Exams</CardTitle>
          <CardDescription>
            View and manage your upcoming and past examinations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {exams.map((exam) => (
              <div
                key={exam.id}
                className="flex items-start justify-between rounded-lg border border-border p-4 hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-foreground">
                      {exam.name}
                    </h3>
                    <Badge className={getStatusColor(exam.status)}>
                      {exam.status.charAt(0).toUpperCase() +
                        exam.status.slice(1)}
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {exam.course}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {exam.date}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {exam.time}
                    </div>
                  </div>
                </div>
                {exam.status !== "completed" && (
                  <Button variant="ghost" size="sm" className="ml-4">
                    Start Exam
                  </Button>
                )}
                {exam.status === "completed" && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="ml-4 gap-2 bg-transparent"
                  >
                    <Eye className="h-4 w-4" />
                    View Report
                  </Button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
};

export default page;
