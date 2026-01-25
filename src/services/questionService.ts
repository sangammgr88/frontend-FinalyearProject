type CreateQuestionData = {
  subject: string;
  customSubject?: string;
  questionType: "mcq" | "text";
  questionText: string;
  points: number;
  difficulty: "easy" | "medium" | "hard";
  options: { text: string; isCorrect: boolean }[];
  textAnswer?: string;
  examId: string | string[];
};

export const createQuestion = async (data: CreateQuestionData) => {
  const response = await fetch("http://localhost:5000/api/questions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to create question");
  }

  return response.json();
};