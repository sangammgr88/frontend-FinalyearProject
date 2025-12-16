"use client";

import React from "react";

type QuestionType = "MCQ" | "TEXT";

interface Question {
  id: number;
  question: string;
  type: QuestionType;
  options?: string[];
  correctAnswer?: string;
  givenAnswer: string;
}

const mockAnswers: Question[] = [
  {
    id: 1,
    question: "What is React?",
    type: "TEXT",
    givenAnswer:
      "React is a JavaScript library used for building user interfaces, especially single-page applications.",
  },
  {
    id: 2,
    question: "Which of the following is a JavaScript framework?",
    type: "MCQ",
    options: ["Laravel", "Django", "React", "Flask"],
    correctAnswer: "React",
    givenAnswer: "React",
  },
  {
    id: 3,
    question: "What does JSX stand for?",
    type: "MCQ",
    options: [
      "Java Syntax Extension",
      "JavaScript XML",
      "JSON XML",
      "Java Source X",
    ],
    correctAnswer: "JavaScript XML",
    givenAnswer: "JavaScript XML",
  },
];

const AnswerDetails = () => {
  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-semibold mb-6">Answer Details</h1>

      <div className="space-y-6">
        {mockAnswers.map((item, index) => (
          <div
            key={item.id}
            className="border rounded-lg p-4 bg-white shadow-sm"
          >
            <h2 className="font-medium text-lg mb-2">
              Q{index + 1}. {item.question}
            </h2>

            {/* TEXT ANSWER */}
            {item.type === "TEXT" && (
              <div className="bg-gray-50 p-3 rounded border">
                <p className="text-gray-800">{item.givenAnswer}</p>
              </div>
            )}

            {/* MCQ ANSWER */}
            {item.type === "MCQ" && (
              <ul className="space-y-2 mt-2">
                {item.options?.map((option, i) => {
                  const isSelected = option === item.givenAnswer;
                  const isCorrect = option === item.correctAnswer;

                  return (
                    <li
                      key={i}
                      className={`p-2 rounded border flex items-center justify-between
                        ${
                          isCorrect
                            ? "border-green-500 bg-green-50"
                            : isSelected
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200"
                        }
                      `}
                    >
                      <span>{option}</span>

                      {isCorrect && (
                        <span className="text-green-600 text-sm font-medium">
                          Correct
                        </span>
                      )}

                      {isSelected && !isCorrect && (
                        <span className="text-blue-600 text-sm font-medium">
                          Selected
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AnswerDetails;
