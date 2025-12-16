"use client";

import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { BookOpen } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Example data structure
type UserAnswer = {
  id: number;
  name: string;
  email: string;
  answer: string;
};

const sampleData: UserAnswer[] = [
  {
    id: 1,
    name: "John Doe",
    email: "john@example.com",
    answer: "The capital of France is Paris.",
  },
  { id: 2, name: "Jane Smith", email: "jane@example.com", answer: "2 + 2 = 4" },
  {
    id: 3,
    name: "Bob Johnson",
    email: "bob@example.com",
    answer: "Water freezes at 0°C",
  },
];

const UserAnswersPage = () => {
  const [answers, setAnswers] = useState<UserAnswer[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    // Replace with API fetch
    setAnswers(sampleData);
  }, []);

  const filteredAnswers = answers.filter(
    (a) =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.email.toLowerCase().includes(search.toLowerCase()) ||
      a.answer.toLowerCase().includes(search.toLowerCase())
  );
  const router = useRouter();

  const handleClick = () => {
    router.push("/admin/AnswerDetails");
  };
  return (
    <div className="px-4 md:px-8 py-6 max-w-7xl mx-auto">
      <Card className="shadow-lg rounded-xl border-gray-200">
        <CardHeader>
          <CardTitle>User Answers</CardTitle>
          <CardDescription>View submitted answers from users</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Search input */}
          <Input
            placeholder="Search by name, email, or answer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="mb-4 max-w-md"
          />

          {/* Scrollable Table */}
          <div className="overflow-x-auto">
            <table className="min-w-150 border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-3 text-left">S.N</th>
                  <th className="p-3 text-left">Name</th>
                  <th className="p-3 text-left">Email</th>
                  <th className="p-3 text-left">Answer</th>
                  <th className="p-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredAnswers.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="text-center text-muted-foreground py-4"
                    >
                      No answers found
                    </td>
                  </tr>
                )}
                {filteredAnswers.map((user, idx) => (
                  <tr
                    key={user.id}
                    className="hover:bg-gray-50 transition border-b"
                  >
                    <td className="p-3">{idx + 1}</td>
                    <td className="p-3">{user.name}</td>
                    <td className="p-3">{user.email}</td>
                    <td className="p-3 line-clamp-1">{user.answer}</td>
                    <td className="p-3 text-center">
                      <button
                        onClick={handleClick}
                        className="px-4 py-2 bg-blue-600 text-white rounded"
                      >
                        View Answer Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserAnswersPage;
