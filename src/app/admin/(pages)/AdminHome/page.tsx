"use client";

import React, { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";

import { BookOpen, Plus, Save, Trash2, Upload, Check } from "lucide-react";

const SUBJECTS = ["Math", "Science", "English", "Computer", "Custom"];

type QuestionForm = {
  subject: string;
  customSubject?: string;
  questionType: "mcq" | "text";
  questionText: string;
  points: number;
  difficulty: "easy" | "medium" | "hard";
  options: { text: string; isCorrect: boolean }[];
  textAnswer?: string;
};

type ExamMetadata = {
  examTitle: string;
  description: string;
  duration: number;
  passingMarks: number;
  startDate: string;
  endDate: string;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const Page = () => {
  const [subject, setSubject] = useState<string>("");
  const [type, setType] = useState<"mcq" | "text">("mcq");
  const [saved, setSaved] = useState<QuestionForm[]>([]);
  const [loading, setLoading] = useState(false);
  const [showExamDetails, setShowExamDetails] = useState(false);
  
  const { toast } = useToast();

  const form = useForm<QuestionForm>({
    defaultValues: {
      subject: "",
      questionType: "mcq",
      difficulty: "medium",
      points: 1,
      options: [
        { text: "", isCorrect: false },
        { text: "", isCorrect: false },
      ],
    },
  });

  const examForm = useForm<ExamMetadata>({
    defaultValues: {
      examTitle: "",
      description: "",
      duration: 60,
      passingMarks: 50,
      startDate: "",
      endDate: "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "options",
  });

  // Save question to local state
  const onSubmit = (data: QuestionForm) => {
    // Validation
    if (data.questionType === "mcq") {
      const hasCorrectAnswer = data.options.some(opt => opt.isCorrect);
      if (!hasCorrectAnswer) {
        toast({
          title: "Validation Error",
          description: "Please select at least one correct answer",
          variant: "destructive",
        });
        return;
      }
      
      const allOptionsFilled = data.options.every(opt => opt.text.trim() !== "");
      if (!allOptionsFilled) {
        toast({
          title: "Validation Error",
          description: "Please fill all option fields",
          variant: "destructive",
        });
        return;
      }
    }

    setSaved((prev) => [...prev, data]);
    form.reset();
    setSubject("");
    setType("mcq");
    
    toast({
      title: "Question Added",
      description: "Question saved to exam",
    });
  };

  // Create exam with all questions
  const handleCreateExam = async (examData: ExamMetadata) => {
    if (saved.length === 0) {
      toast({
        title: "No Questions",
        description: "Please add at least one question to the exam",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      
      if (!token) {
        toast({
          title: "Authentication Required",
          description: "Please login to create an exam",
          variant: "destructive",
        });
        return;
      }

      // Prepare questions data
      const questions = saved.map(q => ({
        subject: q.subject === "Custom" ? q.customSubject : q.subject,
        questionType: q.questionType,
        questionText: q.questionText,
        points: q.points,
        difficulty: q.difficulty,
        ...(q.questionType === "mcq" && { options: q.options }),
        ...(q.questionType === "text" && { textAnswer: q.textAnswer }),
      }));

      // Calculate total marks
      const totalMarks = saved.reduce((sum, q) => sum + q.points, 0);

      const response = await fetch(`${API_BASE_URL}/api/exam/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          examTitle: examData.examTitle,
          description: examData.description,
          duration: examData.duration,
          passingMarks: examData.passingMarks,
          startDate: examData.startDate || undefined,
          endDate: examData.endDate || undefined,
          questions,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Exam Created Successfully!",
          description: `${examData.examTitle} with ${saved.length} questions`,
        });

        // Reset all forms
        setSaved([]);
        examForm.reset();
        setShowExamDetails(false);
      } else {
        toast({
          title: "Failed to Create Exam",
          description: data.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Save individual question to backend (optional)
  const saveQuestionToBackend = async (question: QuestionForm) => {
    try {
      const token = localStorage.getItem("token");
      
      const response = await fetch(`${API_BASE_URL}/api/question/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          subject: question.subject === "Custom" ? question.customSubject : question.subject,
          questionType: question.questionType,
          questionText: question.questionText,
          points: question.points,
          difficulty: question.difficulty,
          ...(question.questionType === "mcq" && { options: question.options }),
          ...(question.questionType === "text" && { textAnswer: question.textAnswer }),
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "Question Saved",
          description: "Question saved to database",
        });
      }
    } catch (error) {
      console.error("Error saving question:", error);
    }
  };

  const removeQuestion = (index: number) => {
    setSaved(prev => prev.filter((_, i) => i !== index));
    toast({
      title: "Question Removed",
      description: "Question deleted from exam",
    });
  };

  const totalMarks = saved.reduce((sum, q) => sum + q.points, 0);

  return (
    <div className="px-8 py-6">
      {!showExamDetails ? (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Question Form */}
          <Card className="shadow-lg rounded-xl border-gray-200">
            <CardHeader>
              <CardTitle className="text-lg">Create Question</CardTitle>
              <CardDescription>
                Add questions to the examination question bank
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* SUBJECT */}
                <div className="space-y-2">
                  <Label className="font-medium">Subject</Label>
                  <Select
                    value={subject}
                    onValueChange={(v) => {
                      setSubject(v);
                      form.setValue("subject", v);
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {SUBJECTS.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {subject === "Custom" && (
                    <Input
                      {...form.register("customSubject")}
                      placeholder="Custom subject name"
                      className="mt-2"
                    />
                  )}
                </div>

                {/* QUESTION TYPE */}
                <div className="space-y-2">
                  <Label className="font-medium">Question Type</Label>
                  <RadioGroup
                    value={type}
                    onValueChange={(v) => {
                      setType(v as "mcq" | "text");
                      form.setValue("questionType", v as "mcq" | "text");
                    }}
                    className="flex gap-6"
                  >
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="mcq" />
                      <span>Multiple Choice</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="text" />
                      <span>Text Answer</span>
                    </div>
                  </RadioGroup>
                </div>

                {/* QUESTION */}
                <div className="space-y-2">
                  <Label className="font-medium">Question</Label>
                  <Textarea
                    {...form.register("questionText")}
                    rows={4}
                    placeholder="Write the question clearly..."
                  />
                </div>

                {/* META */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="font-medium">Points</Label>
                    <Input
                      type="number"
                      {...form.register("points", { valueAsNumber: true })}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="font-medium">Difficulty</Label>
                    <Select
                      defaultValue="medium"
                      onValueChange={(v) => form.setValue("difficulty", v as any)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="easy">Easy</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* MCQ OPTIONS */}
                {type === "mcq" && (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <Label className="font-medium">Answer Options</Label>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => append({ text: "", isCorrect: false })}
                      >
                        <Plus size={14} /> Add
                      </Button>
                    </div>

                    {fields.map((f, i) => (
                      <div
                        key={f.id}
                        className="flex items-center gap-3 rounded-lg border p-3 hover:shadow-sm transition"
                      >
                        <input
                          type="checkbox"
                          {...form.register(`options.${i}.isCorrect`)}
                          className="h-4 w-4 accent-blue-500"
                        />
                        <Input
                          {...form.register(`options.${i}.text`)}
                          placeholder={`Option ${i + 1}`}
                        />
                        {fields.length > 2 && (
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            onClick={() => remove(i)}
                          >
                            <Trash2 size={16} />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* TEXT ANSWER */}
                {type === "text" && (
                  <div className="space-y-2">
                    <Label className="font-medium">Expected Answer</Label>
                    <Textarea
                      {...form.register("textAnswer")}
                      placeholder="Evaluation guideline / model answer"
                    />
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2"
                >
                  <Plus size={16} />
                  Add Question
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* PREVIEW */}
          <Card className="shadow-lg rounded-xl border-gray-200 col-span-1 xl:col-span-2">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen size={18} />
                    Saved Questions
                  </CardTitle>
                  <CardDescription>
                    {saved.length} questions | {totalMarks} total marks
                  </CardDescription>
                </div>
                {saved.length > 0 && (
                  <Button onClick={() => setShowExamDetails(true)}>
                    <Upload size={16} className="mr-2" />
                    Create Exam
                  </Button>
                )}
              </div>
            </CardHeader>

            <CardContent className="space-y-3">
              {saved.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-12">
                  No questions added yet
                </p>
              )}

              {saved.map((q, i) => (
                <div
                  key={i}
                  className="rounded-lg border p-4 hover:shadow-sm transition space-y-2"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex justify-between text-sm font-medium mb-1">
                        <span className="text-primary">
                          {q.subject === "Custom" ? q.customSubject : q.subject}
                        </span>
                        <span className="capitalize text-muted-foreground">
                          {q.difficulty}
                        </span>
                      </div>
                      <p className="text-sm font-medium mb-2">{q.questionText}</p>
                      
                      {q.questionType === "mcq" && (
                        <div className="space-y-1">
                          {q.options?.map((opt, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-xs">
                              {opt.isCorrect && <Check size={12} className="text-green-600" />}
                              <span className={opt.isCorrect ? "text-green-600 font-medium" : "text-muted-foreground"}>
                                {opt.text}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      <div className="text-xs text-muted-foreground flex justify-between mt-2">
                        <span>{q.questionType.toUpperCase()}</span>
                        <span>{q.points} pts</span>
                      </div>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => removeQuestion(i)}
                      className="ml-2"
                    >
                      <Trash2 size={16} className="text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      ) : (
        // EXAM DETAILS FORM
        <Card className="max-w-2xl mx-auto shadow-lg">
          <CardHeader>
            <CardTitle>Exam Details</CardTitle>
            <CardDescription>
              Enter exam information to complete creation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={examForm.handleSubmit(handleCreateExam)} className="space-y-4">
              <div className="space-y-2">
                <Label>Exam Title *</Label>
                <Input
                  {...examForm.register("examTitle")}
                  placeholder="Final Examination - Computer Science"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  {...examForm.register("description")}
                  placeholder="Brief description of the exam..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Duration (minutes) *</Label>
                  <Input
                    type="number"
                    {...examForm.register("duration", { valueAsNumber: true })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Passing Marks *</Label>
                  <Input
                    type="number"
                    {...examForm.register("passingMarks", { valueAsNumber: true })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Input
                    type="datetime-local"
                    {...examForm.register("startDate")}
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Input
                    type="datetime-local"
                    {...examForm.register("endDate")}
                  />
                </div>
              </div>

              <div className="bg-muted p-4 rounded-lg space-y-1">
                <p className="text-sm font-medium">Exam Summary</p>
                <p className="text-xs text-muted-foreground">
                  Total Questions: {saved.length}
                </p>
                <p className="text-xs text-muted-foreground">
                  Total Marks: {totalMarks}
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowExamDetails(false)}
                  className="flex-1"
                >
                  Back to Questions
                </Button>
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? "Creating..." : "Create Exam"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Page;