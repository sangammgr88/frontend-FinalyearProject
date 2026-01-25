"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { BookOpen, Clock, Plus, Trash2, Users, Target } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Question {
  _id: string;
  questionText: string;
  questionType: "mcq" | "text";
  points: number;
  difficulty: string;
}

interface Exam {
  _id: string;
  examTitle: string;
  description?: string;
  duration: number;
  totalMarks: number;
  passingMarks?: number;
  subject?: string;
  questions: Question[];
  isActive: boolean;
  startDate?: string;
  endDate?: string;
  createdAt: string;
  createdBy: {
    fullName: string;
    email: string;
  };
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

const AdminExamList = () => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        toast({
          title: "Authentication Required",
          description: "Please login to view exams",
          variant: "destructive",
        });
        window.location.href = "/";
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/exam/list`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setExams(data.data);
        toast({
          title: "Exams Loaded",
          description: `Found ${data.count} exams`,
        });
      } else {
        toast({
          title: "Failed to Load Exams",
          description: data.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching exams:", error);
      toast({
        title: "Error",
        description: "Failed to fetch exams",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewExam = (examId: string) => {
    router.push(`/admin/ExamList/${examId}`);
  };

  const handleDeleteExam = async (examId: string) => {
    if (!confirm("Are you sure you want to delete this exam?")) return;

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${API_BASE_URL}/api/exam/delete/${examId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Exam Deleted",
          description: "Exam deleted successfully",
        });
        fetchExams(); // Refresh list
      } else {
        toast({
          title: "Delete Failed",
          description: data.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error deleting exam:", error);
      toast({
        title: "Error",
        description: "Failed to delete exam",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Not set";
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading exams...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Exam Management</h1>
          <p className="text-muted-foreground mt-2">
            Manage and monitor all examinations
          </p>
        </div>
        <Link href="/admin/create-exam">
          <Button className="flex items-center gap-2">
            <Plus size={18} />
            Create New Exam
          </Button>
        </Link>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Exams</p>
                <p className="text-2xl font-bold">{exams.length}</p>
              </div>
              <BookOpen className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Exams</p>
                <p className="text-2xl font-bold">
                  {exams.filter((e) => e.isActive).length}
                </p>
              </div>
              <Target className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Questions</p>
                <p className="text-2xl font-bold">
                  {exams.reduce((sum, e) => sum + e.questions.length, 0)}
                </p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Duration</p>
                <p className="text-2xl font-bold">
                  {exams.length > 0
                    ? Math.round(
                        exams.reduce((sum, e) => sum + e.duration, 0) /
                          exams.length,
                      )
                    : 0}{" "}
                  min
                </p>
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Exams Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Examinations</CardTitle>
          <CardDescription>View and manage all created exams</CardDescription>
        </CardHeader>
        <CardContent>
          {exams.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No exams created yet</p>
              <Link href="/admin/create-exam">
                <Button className="mt-4">Create Your First Exam</Button>
              </Link>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Exam Title</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Questions</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Total Marks</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {exams.map((exam) => (
                  <TableRow key={exam._id}>
                    <TableCell className="font-medium">
                      {exam.examTitle}
                    </TableCell>
                    <TableCell>
                      {exam.subject || (
                        <span className="text-muted-foreground">N/A</span>
                      )}
                    </TableCell>
                    <TableCell>{exam.questions.length}</TableCell>
                    <TableCell>{exam.duration} min</TableCell>
                    <TableCell>{exam.totalMarks}</TableCell>
                    <TableCell>
                      <Badge variant={exam.isActive ? "default" : "secondary"}>
                        {exam.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(exam.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleViewExam(exam._id)}
                        >
                          <BookOpen size={16} />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteExam(exam._id)}
                        >
                          <Trash2 size={16} className="text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminExamList;
