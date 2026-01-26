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
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import {
  BookOpen,
  Clock,
  Play,
  Calendar,
  Target,
  Award,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

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
}

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

const StudentExamList = () => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [userName, setUserName] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    // Get user name
    const name = localStorage.getItem("userName");
    setUserName(name || "Student");
    
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
        // Filter only active exams for students
        const activeExams = data.data.filter((exam: Exam) => exam.isActive);
        setExams(activeExams);
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

  const handleViewExam = async (examId: string) => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`${API_BASE_URL}/api/exam/${examId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setSelectedExam(data.data);
        setViewDialogOpen(true);
      }
    } catch (error) {
      console.error("Error fetching exam details:", error);
      toast({
        title: "Error",
        description: "Failed to load exam details",
        variant: "destructive",
      });
    }
  };

  const handleStartExam = (examId: string) => {
  window.location.href = `/user/ExamPage/${examId}`;
};


  const formatDate = (dateString?: string) => {
    if (!dateString) return "Anytime";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isExamAvailable = (exam: Exam) => {
    if (!exam.startDate && !exam.endDate) return true;
    
    const now = new Date();
    const start = exam.startDate ? new Date(exam.startDate) : null;
    const end = exam.endDate ? new Date(exam.endDate) : null;

    if (start && now < start) return false;
    if (end && now > end) return false;
    
    return true;
  };

  const getExamStatus = (exam: Exam) => {
    if (!exam.startDate && !exam.endDate) return "available";
    
    const now = new Date();
    const start = exam.startDate ? new Date(exam.startDate) : null;
    const end = exam.endDate ? new Date(exam.endDate) : null;

    if (start && now < start) return "upcoming";
    if (end && now > end) return "expired";
    
    return "available";
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Welcome, {userName}!</h1>
        <p className="text-muted-foreground mt-2">
          Select an exam to begin your assessment
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Available Exams</p>
                <p className="text-2xl font-bold">
                  {exams.filter((e) => isExamAvailable(e)).length}
                </p>
              </div>
              <BookOpen className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Exams</p>
                <p className="text-2xl font-bold">{exams.length}</p>
              </div>
              <Target className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">0</p>
              </div>
              <Award className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Exams Grid */}
      {exams.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No exams available at the moment</p>
            <p className="text-sm text-muted-foreground mt-2">
              Check back later for new examinations
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exams.map((exam) => {
            const status = getExamStatus(exam);
            const available = isExamAvailable(exam);

            return (
              <Card
                key={exam._id}
                className={`hover:shadow-lg transition-shadow ${
                  !available ? "opacity-60" : ""
                }`}
              >
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <CardTitle className="text-lg line-clamp-2">
                      {exam.examTitle}
                    </CardTitle>
                    {status === "available" && (
                      <Badge variant="default" className="ml-2">
                        <CheckCircle size={12} className="mr-1" />
                        Available
                      </Badge>
                    )}
                    {status === "upcoming" && (
                      <Badge variant="secondary" className="ml-2">
                        <Clock size={12} className="mr-1" />
                        Upcoming
                      </Badge>
                    )}
                    {status === "expired" && (
                      <Badge variant="destructive" className="ml-2">
                        <AlertCircle size={12} className="mr-1" />
                        Expired
                      </Badge>
                    )}
                  </div>
                  <CardDescription className="line-clamp-2">
                    {exam.description || "No description provided"}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Exam Info */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <BookOpen size={16} className="text-muted-foreground" />
                      <span>{exam.questions.length} Questions</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={16} className="text-muted-foreground" />
                      <span>{exam.duration} min</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Target size={16} className="text-muted-foreground" />
                      <span>{exam.totalMarks} Marks</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Award size={16} className="text-muted-foreground" />
                      <span>{exam.passingMarks || "N/A"} Pass</span>
                    </div>
                  </div>

                  {/* Subject Badge */}
                  {exam.subject && (
                    <Badge variant="outline" className="w-fit">
                      {exam.subject}
                    </Badge>
                  )}

                  {/* Dates */}
                  {(exam.startDate || exam.endDate) && (
                    <div className="text-xs text-muted-foreground space-y-1">
                      {exam.startDate && (
                        <div className="flex items-center gap-2">
                          <Calendar size={12} />
                          <span>Start: {formatDate(exam.startDate)}</span>
                        </div>
                      )}
                      {exam.endDate && (
                        <div className="flex items-center gap-2">
                          <Calendar size={12} />
                          <span>End: {formatDate(exam.endDate)}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleViewExam(exam._id)}
                    >
                      View Details
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={() => handleStartExam(exam._id)}
                      disabled={!available}
                    >
                      <Play size={16} className="mr-1" />
                      {available ? "Start Exam" : "Not Available"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* View Exam Details Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedExam?.examTitle}</DialogTitle>
            <DialogDescription>
              {selectedExam?.description || "No description provided"}
            </DialogDescription>
          </DialogHeader>

          {selectedExam && (
            <div className="space-y-6">
              {/* Exam Overview */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">Duration</p>
                  <p className="font-medium text-lg">
                    {selectedExam.duration} minutes
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Marks</p>
                  <p className="font-medium text-lg">{selectedExam.totalMarks}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Passing Marks</p>
                  <p className="font-medium text-lg">
                    {selectedExam.passingMarks || "Not set"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Questions</p>
                  <p className="font-medium text-lg">
                    {selectedExam.questions.length}
                  </p>
                </div>
              </div>

              {/* Instructions */}
              <div className="space-y-2">
                <h3 className="font-semibold">Instructions</h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>Read each question carefully before answering</li>
                  <li>You have {selectedExam.duration} minutes to complete the exam</li>
                  <li>You need {selectedExam.passingMarks || "a minimum score"} to pass</li>
                  <li>All questions must be answered</li>
                  <li>Click "Submit" when you're done</li>
                </ul>
              </div>

              {/* Question Distribution */}
              <div className="space-y-2">
                <h3 className="font-semibold">Question Distribution</h3>
                <div className="grid grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="pt-4">
                      <p className="text-sm text-muted-foreground">Easy</p>
                      <p className="text-xl font-bold text-green-600">
                        {
                          selectedExam.questions.filter(
                            (q) => q.difficulty === "easy"
                          ).length
                        }
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4">
                      <p className="text-sm text-muted-foreground">Medium</p>
                      <p className="text-xl font-bold text-orange-600">
                        {
                          selectedExam.questions.filter(
                            (q) => q.difficulty === "medium"
                          ).length
                        }
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4">
                      <p className="text-sm text-muted-foreground">Hard</p>
                      <p className="text-xl font-bold text-red-600">
                        {
                          selectedExam.questions.filter(
                            (q) => q.difficulty === "hard"
                          ).length
                        }
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Start Button */}
              <Button
                className="w-full"
                size="lg"
                onClick={() => handleStartExam(selectedExam._id)}
                disabled={!isExamAvailable(selectedExam)}
              >
                <Play size={18} className="mr-2" />
                {isExamAvailable(selectedExam)
                  ? "Start Exam Now"
                  : "Exam Not Available"}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudentExamList;