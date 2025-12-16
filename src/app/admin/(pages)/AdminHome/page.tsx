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

import { BookOpen, Plus, Save, Trash2 } from "lucide-react";

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

const Page = () => {
  const [subject, setSubject] = useState<string>("");
  const [type, setType] = useState<"mcq" | "text">("mcq");
  const [saved, setSaved] = useState<QuestionForm[]>([]);

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

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "options",
  });

  const onSubmit = (data: QuestionForm) => {
    setSaved((prev) => [...prev, data]);
    form.reset();
    setSubject("");
    setType("mcq");
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 px-8 py-6">
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
              <Save size={16} />
              Save Question
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* ================= PREVIEW ================= */}
      <Card className="shadow-lg rounded-xl border-gray-200 col-span-1 xl:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen size={18} />
            Saved Questions
          </CardTitle>
          <CardDescription>{saved.length} total</CardDescription>
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
              className="rounded-lg border p-4 hover:shadow-sm transition space-y-1"
            >
              <div className="flex justify-between text-sm font-medium">
                <span>
                  {q.subject === "Custom" ? q.customSubject : q.subject}
                </span>
                <span className="capitalize">{q.difficulty}</span>
              </div>
              <p className="text-sm line-clamp-2">{q.questionText}</p>
              <div className="text-xs text-muted-foreground flex justify-between">
                <span>{q.questionType.toUpperCase()}</span>
                <span>{q.points} pts</span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default Page;
