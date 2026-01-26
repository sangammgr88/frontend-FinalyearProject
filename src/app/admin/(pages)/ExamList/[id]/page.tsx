"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";

interface Option {
  text: string;
  isCorrect: boolean;
}

interface Question {
  _id: string;
  questionText: string;
  questionType: "mcq" | "text";
  points: number;
  difficulty: string;
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
  questions: Question[];
  createdAt: string;
  createdBy: {
    fullName: string;
    email: string;
  };
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

const AdminExamQuestionsPage = () => {
  const { id } = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [exam, setExam] = useState<Exam | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) fetchExam();
  }, [id]);

  const fetchExam = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast({
          title: "Authentication Required",
          description: "Please login to view this exam",
          variant: "destructive",
        });
        router.push("/admin");
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/exam/${id}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setExam(data.data);
      } else {
        toast({
          title: "Failed to Load Exam",
          description: data.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching exam:", error);
      toast({
        title: "Error",
        description: "Failed to fetch exam",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading exam questions...</p>
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Exam not found</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Exam Header */}
      <div>
        <h1 className="text-3xl font-bold">{exam.examTitle}</h1>
        <p className="text-muted-foreground mt-2">
          {exam.description || "No description provided"}
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          Duration: {exam.duration} minutes | Total Marks: {exam.totalMarks} |
          Passing Marks: {exam.passingMarks || "Not set"}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Questions: {exam.questions.length}
        </p>
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        {exam.questions.map((q, index) => (
          <Card key={q._id} className="bg-muted">
            <CardContent className="space-y-2">
              <p className="font-semibold">
                Q{index + 1}: {q.questionText}
              </p>
              <p className="text-sm text-muted-foreground">
                Type: {q.questionType.toUpperCase()} | Points: {q.points} |
                Difficulty:{" "}
                {q.difficulty.charAt(0).toUpperCase() + q.difficulty.slice(1)}
              </p>

              {/* MCQ Options */}
              {q.questionType === "mcq" && q.options && (
                <div className="mt-2 space-y-1">
                  <p className="font-medium">Options:</p>
                  {q.options.map((opt, i) => (
                    <p
                      key={i}
                      className={`px-2 py-1 rounded ${
                        opt.isCorrect
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {opt.text} {opt.isCorrect ? "✔️ Correct" : "❌ Incorrect"}
                    </p>
                  ))}
                </div>
              )}

              {/* Text Answer */}
              {q.questionType === "text" && q.textAnswer && (
                <div className="mt-2">
                  <p className="font-medium">Answer:</p>
                  <p className="text-blue-600 px-2 py-1 bg-blue-50 rounded">
                    {q.textAnswer}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminExamQuestionsPage;
