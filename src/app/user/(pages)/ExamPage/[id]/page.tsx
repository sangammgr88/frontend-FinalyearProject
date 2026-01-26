"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

import { AlertCircle, CheckCircle, ChevronLeft, ChevronRight, Clock, Flag } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";


interface Option {
  text: string;
  isCorrect: boolean;
}

interface Question {
  _id: string;
  questionText: string;
  questionType: "mcq" | "text";
  points: number;
  difficulty: "easy" | "medium" | "hard";
  options?: Option[];
  textAnswer?: string;
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
}

interface Answer {
  questionId: string;
  answer: string | string[]; // string for text, string[] for MCQ (can be multiple correct)
  flagged: boolean;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

const TakeExamPage = () => {
  const params = useParams();
  const router = useRouter();
  const examId = params.id as string;
  const { toast } = useToast();

  // Exam state
  const [exam, setExam] = useState<Exam | null>(null);
  const [loading, setLoading] = useState(true);
  const [examStarted, setExamStarted] = useState(false);

  // Timer state
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [timerActive, setTimerActive] = useState(false);

  // Questions & Answers
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);

  // Submit dialog
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchExamDetails();
  }, [examId]);

  // Timer countdown
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (timerActive && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            handleAutoSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [timerActive, timeRemaining]);

  const fetchExamDetails = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        toast({
          title: "Authentication Required",
          description: "Please login to take the exam",
          variant: "destructive",
        });
        router.push("/");
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/exam/${examId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        if (!data.data.isActive) {
          toast({
            title: "Exam Not Available",
            description: "This exam is currently inactive",
            variant: "destructive",
          });
          router.push("/user/userDashboard");
          return;
        }

        setExam(data.data);
        setTimeRemaining(data.data.duration * 60); // Convert to seconds

        // Initialize answers array
        const initialAnswers: Answer[] = data.data.questions.map((q: Question) => ({
          questionId: q._id,
          answer: q.questionType === "mcq" ? "" : "",
          flagged: false,
        }));
        setAnswers(initialAnswers);
      } else {
        toast({
          title: "Failed to Load Exam",
          description: data.message,
          variant: "destructive",
        });
        router.push("/user/userDashboard");
      }
    } catch (error) {
      console.error("Error fetching exam:", error);
      toast({
        title: "Error",
        description: "Failed to fetch exam details",
        variant: "destructive",
      });
      router.push("/user/userDashboard");
    } finally {
      setLoading(false);
    }
  };

  const handleStartExam = () => {
    setExamStarted(true);
    setTimerActive(true);
    toast({
      title: "Exam Started!",
      description: `You have ${exam?.duration} minutes. Good luck!`,
    });
  };

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers((prev) =>
      prev.map((a) =>
        a.questionId === questionId ? { ...a, answer } : a
      )
    );
  };

  const toggleFlag = (questionId: string) => {
    setAnswers((prev) =>
      prev.map((a) =>
        a.questionId === questionId ? { ...a, flagged: !a.flagged } : a
      )
    );
  };

  const getCurrentAnswer = () => {
    if (!exam) return null;
    const currentQuestion = exam.questions[currentQuestionIndex];
    return answers.find((a) => a.questionId === currentQuestion._id);
  };

  const goToNextQuestion = () => {
    if (exam && currentQuestionIndex < exam.questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleAutoSubmit = () => {
    toast({
      title: "Time's Up!",
      description: "Auto-submitting your exam...",
      variant: "destructive",
    });
    setTimerActive(false);
    submitExam();
  };

  const submitExam = async () => {
    setSubmitting(true);

    try {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");

      // Calculate score (simplified - in production, do this on backend)
      let score = 0;
      answers.forEach((answer) => {
        const question = exam?.questions.find((q) => q._id === answer.questionId);
        if (!question) return;

        if (question.questionType === "mcq") {
          const correctOption = question.options?.find((opt) => opt.isCorrect);
          if (correctOption && correctOption.text === answer.answer) {
            score += question.points;
          }
        }
        // Text answers would need manual grading
      });

      // Submit result to backend
      const response = await fetch(`${API_BASE_URL}/api/result/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          examId: exam?._id,
          studentId: userId,
          answers: answers,
          score: score,
          totalMarks: exam?.totalMarks,
          submittedAt: new Date().toISOString(),
        }),
      });

      const data = await response.json();

      if (data.success || response.ok) {
        toast({
          title: "Exam Submitted Successfully!",
          description: `Your score: ${score}/${exam?.totalMarks}`,
        });

        // Redirect to results
        setTimeout(() => {
          router.push("/user");
        }, 2000);
      } else {
        toast({
          title: "Submission Failed",
          description: data.message || "Please try again",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error submitting exam:", error);
      toast({
        title: "Submission Error",
        description: "Failed to submit exam. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
      setShowSubmitDialog(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const getProgressPercentage = () => {
    if (!exam) return 0;
    const answered = answers.filter((a) => a.answer !== "").length;
    return (answered / exam.questions.length) * 100;
  };

  const getAnsweredCount = () => {
    return answers.filter((a) => a.answer !== "").length;
  };

  const getFlaggedCount = () => {
    return answers.filter((a) => a.flagged).length;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading exam...</p>
        </div>
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Exam not found</p>
            <Button className="mt-4" onClick={() => router.push("/user/userDashboard")}>
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Exam Instructions Screen (before starting)
  if (!examStarted) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{exam.examTitle}</CardTitle>
            <CardDescription>{exam.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Exam Info */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground">Questions</p>
                <p className="text-2xl font-bold">{exam.questions.length}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Duration</p>
                <p className="text-2xl font-bold">{exam.duration} min</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Marks</p>
                <p className="text-2xl font-bold">{exam.totalMarks}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pass Marks</p>
                <p className="text-2xl font-bold">{exam.passingMarks || "N/A"}</p>
              </div>
            </div>

            {/* Instructions */}
            <div className="space-y-3">
              <h3 className="font-semibold">Instructions:</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <span>You have {exam.duration} minutes to complete this exam</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <span>Answer all questions to the best of your ability</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <span>Once submitted, you cannot change your answers</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <span>The exam will auto-submit when time runs out</span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-orange-500 mt-0.5" />
                  <span>Make sure you have a stable internet connection</span>
                </li>
              </ul>
            </div>

            <Button size="lg" className="w-full" onClick={handleStartExam}>
              Start Exam
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQuestion = exam.questions[currentQuestionIndex];
  const currentAnswer = getCurrentAnswer();

  // Exam Taking Screen
  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header with Timer */}
      <div className="sticky top-0 z-50 bg-background border-b shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold">{exam.examTitle}</h1>
              <p className="text-sm text-muted-foreground">
                Question {currentQuestionIndex + 1} of {exam.questions.length}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Time Remaining</p>
                <div className="flex items-center gap-2">
                  <Clock className={`h-5 w-5 ${timeRemaining < 300 ? "text-red-500" : "text-primary"}`} />
                  <span className={`text-2xl font-mono font-bold ${timeRemaining < 300 ? "text-red-500" : ""}`}>
                    {formatTime(timeRemaining)}
                  </span>
                </div>
              </div>
              <Button
                variant="destructive"
                onClick={() => setShowSubmitDialog(true)}
                disabled={submitting}
              >
                Submit Exam
              </Button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress: {getAnsweredCount()}/{exam.questions.length} answered</span>
              <span>{getFlaggedCount()} flagged for review</span>
            </div>
            <progress value={getProgressPercentage()} />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Question Area */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline">
                        Question {currentQuestionIndex + 1}
                      </Badge>
                      <Badge variant={
                        currentQuestion.difficulty === "easy" ? "default" :
                        currentQuestion.difficulty === "medium" ? "secondary" : "destructive"
                      }>
                        {currentQuestion.difficulty}
                      </Badge>
                      <Badge variant="outline">{currentQuestion.points} pts</Badge>
                    </div>
                    <CardTitle className="text-lg leading-relaxed">
                      {currentQuestion.questionText}
                    </CardTitle>
                  </div>
                  <Button
                    variant={currentAnswer?.flagged ? "destructive" : "outline"}
                    size="sm"
                    onClick={() => toggleFlag(currentQuestion._id)}
                  >
                    <Flag size={16} />
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* MCQ Options */}
                {currentQuestion.questionType === "mcq" && currentQuestion.options && (
                  <RadioGroup
                    value={currentAnswer?.answer as string}
                    onValueChange={(value) => handleAnswerChange(currentQuestion._id, value)}
                  >
                    {currentQuestion.options.map((option, index) => (
                      <div
                        key={index}
                        className="flex items-center space-x-3 border rounded-lg p-4 hover:bg-muted/50 cursor-pointer"
                      >
                        <RadioGroupItem value={option.text} id={`option-${index}`} />
                        <Label
                          htmlFor={`option-${index}`}
                          className="flex-1 cursor-pointer"
                        >
                          {option.text}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                )}

                {/* Text Answer */}
                {currentQuestion.questionType === "text" && (
                  <Textarea
                    placeholder="Type your answer here..."
                    rows={8}
                    value={currentAnswer?.answer as string || ""}
                    onChange={(e) => handleAnswerChange(currentQuestion._id, e.target.value)}
                    className="resize-none"
                  />
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between pt-4">
                  <Button
                    variant="outline"
                    onClick={goToPreviousQuestion}
                    disabled={currentQuestionIndex === 0}
                  >
                    <ChevronLeft size={18} />
                    Previous
                  </Button>
                  <Button
                    onClick={goToNextQuestion}
                    disabled={currentQuestionIndex === exam.questions.length - 1}
                  >
                    Next
                    <ChevronRight size={18} />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Question Navigator Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="text-base">Questions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-5 lg:grid-cols-4 gap-2">
                  {exam.questions.map((question, index) => {
                    const answer = answers.find((a) => a.questionId === question._id);
                    const isAnswered = answer?.answer !== "";
                    const isFlagged = answer?.flagged;
                    const isCurrent = index === currentQuestionIndex;

                    return (
                      <button
                        key={question._id}
                        onClick={() => setCurrentQuestionIndex(index)}
                        className={`
                          aspect-square rounded-md text-sm font-medium transition-all
                          ${isCurrent ? "ring-2 ring-primary ring-offset-2" : ""}
                          ${isAnswered ? "bg-green-500 text-white hover:bg-green-600" : "bg-muted hover:bg-muted/80"}
                          ${isFlagged ? "border-2 border-orange-500" : ""}
                        `}
                      >
                        {index + 1}
                      </button>
                    );
                  })}
                </div>

                {/* Legend */}
                <div className="mt-4 space-y-2 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded bg-green-500"></div>
                    <span>Answered</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded bg-muted border-2 border-orange-500"></div>
                    <span>Flagged</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded bg-muted"></div>
                    <span>Not Answered</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Submit Confirmation Dialog */}
      <AlertDialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Submit Exam?</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>Are you sure you want to submit your exam?</p>
              <div className="p-3 bg-muted rounded-lg space-y-1 text-sm">
                <p>Answered: {getAnsweredCount()}/{exam.questions.length}</p>
                <p>Flagged: {getFlaggedCount()}</p>
                <p>Time Remaining: {formatTime(timeRemaining)}</p>
              </div>
              <p className="text-destructive">
                Once submitted, you cannot change your answers.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={submitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={submitExam}
              disabled={submitting}
              className="bg-primary"
            >
              {submitting ? "Submitting..." : "Submit Exam"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default TakeExamPage;