"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, Eye, Loader2 } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/components/ui/use-toast";

interface StudentResult {
  studentMongoId: string; // MongoDB ObjectId
  studentId: string; // Student ID number (LC00017002053)
  studentName: string;
  studentEmail: string;
  enrolledExams: number;
  completedExams: number;
  totalViolations: number;
  averageScore: number;
  status: "active" | "warning" | "flagged";
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

export default function StudentsPage() {
  const [students, setStudents] = useState<StudentResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        toast({
          title: "Authentication Required",
          description: "Please login as admin",
          variant: "destructive",
        });
        return;
      }

      // Fetch all results to get student statistics
      const response = await fetch(`${API_BASE_URL}/api/result/all-students`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setStudents(data.data);
      } else {
        toast({
          title: "Failed to Load Students",
          description: data.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching students:", error);
      toast({
        title: "Error",
        description: "Failed to fetch student data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter((student) => {
    const search = searchTerm.toLowerCase();
    return (
      student.studentName.toLowerCase().includes(search) ||
      student.studentEmail.toLowerCase().includes(search) ||
      student.studentId.toLowerCase().includes(search)
    );
  });

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "active":
        return "default";
      case "warning":
        return "secondary";
      case "flagged":
        return "destructive";
      default:
        return "outline";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
          <p className="mt-4 text-muted-foreground">Loading students...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:w-7xl">
      <div className="flex-1 space-y-6 p-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Students</h1>
            <p className="text-muted-foreground">
              Manage and monitor student performance
            </p>
          </div>
          <Badge variant="outline" className="text-lg px-4 py-2">
            {students.length} Total Students
          </Badge>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search by name, ID, or email..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Students Table */}
        <Card>
          <CardContent className="p-0">
            {filteredStudents.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  {searchTerm
                    ? "No students found matching your search"
                    : "No students have submitted exams yet"}
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead className="text-center">
                      Exams Enrolled
                    </TableHead>
                    <TableHead className="text-center">Completed</TableHead>
                    <TableHead className="text-center">Avg Score</TableHead>
                    <TableHead className="text-center">Violations</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.map((student) => (
                    <TableRow key={student.studentId}>
                      <TableCell className="font-mono text-sm">
                        {student.studentId}
                      </TableCell>
                      <TableCell className="font-medium">
                        {student.studentName}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {student.studentEmail}
                      </TableCell>
                      <TableCell className="text-center">
                        {student.enrolledExams}
                      </TableCell>
                      <TableCell className="text-center">
                        {student.completedExams}
                      </TableCell>
                      <TableCell className="text-center">
                        <span
                          className={`font-semibold ${
                            student.averageScore >= 80
                              ? "text-green-600"
                              : student.averageScore >= 60
                                ? "text-orange-600"
                                : "text-red-600"
                          }`}
                        >
                          {student.averageScore.toFixed(1)}%
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span
                          className={`font-medium ${
                            student.totalViolations > 5
                              ? "text-destructive"
                              : student.totalViolations > 0
                                ? "text-yellow-600"
                                : "text-green-600"
                          }`}
                        >
                          {student.totalViolations}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(student.status)}>
                          {student.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Link href={`/admin/student/${student.studentMongoId}`}>
                          <Button variant="ghost" size="sm">
                            <Eye className="mr-2 h-4 w-4" />
                            View
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
