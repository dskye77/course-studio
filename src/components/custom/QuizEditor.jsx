// src/components/custom/QuizEditor.jsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Trash2, Save, X, AlertCircle } from "lucide-react";
import { QUIZ_TYPES } from "@/lib/firebaseQuizzes";

export default function QuizEditor({ quiz: initialQuiz, onSave, onCancel }) {
  const [quizTitle, setQuizTitle] = useState(initialQuiz?.title || "");
  const [passingScore, setPassingScore] = useState(
    initialQuiz?.passingScore || 70
  );
  const [questions, setQuestions] = useState(initialQuiz?.questions || []);
  const [errors, setErrors] = useState({});

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        id: `q_${Date.now()}`,
        type: QUIZ_TYPES.MULTIPLE_CHOICE,
        question: "",
        options: ["", "", "", ""],
        correctAnswer: "",
        explanation: "",
      },
    ]);
  };

  const updateQuestion = (index, field, value) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], [field]: value };
    setQuestions(updated);
  };

  const updateOption = (qIndex, optIndex, value) => {
    const updated = [...questions];
    updated[qIndex].options[optIndex] = value;
    setQuestions(updated);
  };

  const deleteQuestion = (index) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const validate = () => {
    const newErrors = {};

    if (!quizTitle.trim()) {
      newErrors.title = "Quiz title is required";
    }

    if (questions.length === 0) {
      newErrors.questions = "Add at least one question";
    }

    questions.forEach((q, i) => {
      if (!q.question.trim()) {
        newErrors[`q${i}_question`] = "Question text is required";
      }

      if (q.type === QUIZ_TYPES.MULTIPLE_CHOICE) {
        const validOptions = q.options.filter((opt) => opt.trim());
        if (validOptions.length < 2) {
          newErrors[`q${i}_options`] = "At least 2 options required";
        }
        if (!q.correctAnswer || !q.correctAnswer.trim()) {
          newErrors[`q${i}_answer`] = "Select correct answer";
        }
      } else if (q.type === QUIZ_TYPES.TRUE_FALSE) {
        if (!q.correctAnswer) {
          newErrors[`q${i}_answer`] = "Select correct answer";
        }
      } else if (q.type === QUIZ_TYPES.FILL_BLANK) {
        if (!q.correctAnswer || !q.correctAnswer.trim()) {
          newErrors[`q${i}_answer`] = "Enter correct answer";
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) {
      toast.error("Please fix all errors before saving");
      return;
    }

    const quiz = {
      title: quizTitle.trim(),
      passingScore: Number(passingScore),
      questions: questions.map((q) => ({
        ...q,
        question: q.question.trim(),
        options:
          q.type === QUIZ_TYPES.MULTIPLE_CHOICE
            ? q.options.filter((opt) => opt.trim())
            : [],
        correctAnswer: q.correctAnswer,
        explanation: q.explanation?.trim() || "",
      })),
    };

    onSave(quiz);
  };

  return (
    <div className="space-y-6 p-6 bg-gray-50 dark:bg-gray-950 rounded-xl">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Quiz Editor</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onCancel}>
            <X size={16} /> Cancel
          </Button>
          <Button onClick={handleSave}>
            <Save size={16} /> Save Quiz
          </Button>
        </div>
      </div>

      {errors.questions && (
        <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <p className="text-sm text-red-800 dark:text-red-200">
            {errors.questions}
          </p>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Quiz Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Quiz Title</Label>
            <Input
              value={quizTitle}
              onChange={(e) => setQuizTitle(e.target.value)}
              placeholder="e.g. Chapter 1 Quiz"
              className={errors.title ? "border-red-500" : ""}
            />
            {errors.title && (
              <p className="text-sm text-red-500">{errors.title}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Passing Score (%)</Label>
            <Input
              type="number"
              min="0"
              max="100"
              value={passingScore}
              onChange={(e) => setPassingScore(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Students must score at least {passingScore}% to pass
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">
          Questions ({questions.length})
        </h3>
        <Button onClick={addQuestion} className="gap-2">
          <Plus size={16} /> Add Question
        </Button>
      </div>

      <div className="space-y-4">
        {questions.map((question, qIndex) => (
          <Card key={question.id}>
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-4">
                  {/* Question Type */}
                  <div className="space-y-2">
                    <Label>Question Type</Label>
                    <Select
                      value={question.type}
                      onValueChange={(value) => {
                        updateQuestion(qIndex, "type", value);
                        updateQuestion(qIndex, "correctAnswer", "");
                        if (value !== QUIZ_TYPES.MULTIPLE_CHOICE) {
                          updateQuestion(qIndex, "options", []);
                        } else {
                          updateQuestion(qIndex, "options", ["", "", "", ""]);
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={QUIZ_TYPES.MULTIPLE_CHOICE}>
                          Multiple Choice
                        </SelectItem>
                        <SelectItem value={QUIZ_TYPES.TRUE_FALSE}>
                          True/False
                        </SelectItem>
                        <SelectItem value={QUIZ_TYPES.FILL_BLANK}>
                          Fill in the Blank
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Question Text */}
                  <div className="space-y-2">
                    <Label>Question {qIndex + 1}</Label>
                    <Textarea
                      value={question.question}
                      onChange={(e) =>
                        updateQuestion(qIndex, "question", e.target.value)
                      }
                      placeholder="Enter your question here"
                      rows={3}
                      className={
                        errors[`q${qIndex}_question`] ? "border-red-500" : ""
                      }
                    />
                    {errors[`q${qIndex}_question`] && (
                      <p className="text-sm text-red-500">
                        {errors[`q${qIndex}_question`]}
                      </p>
                    )}
                  </div>

                  {/* Multiple Choice Options */}
                  {question.type === QUIZ_TYPES.MULTIPLE_CHOICE && (
                    <div className="space-y-2">
                      <Label>Options</Label>
                      {question.options.map((option, optIndex) => (
                        <div key={optIndex} className="flex items-center gap-2">
                          <span className="text-sm font-medium w-8">
                            {String.fromCharCode(65 + optIndex)}.
                          </span>
                          <Input
                            value={option}
                            onChange={(e) =>
                              updateOption(qIndex, optIndex, e.target.value)
                            }
                            placeholder={`Option ${String.fromCharCode(
                              65 + optIndex
                            )}`}
                          />
                        </div>
                      ))}
                      {errors[`q${qIndex}_options`] && (
                        <p className="text-sm text-red-500">
                          {errors[`q${qIndex}_options`]}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Correct Answer */}
                  <div className="space-y-2">
                    <Label>Correct Answer</Label>
                    {question.type === QUIZ_TYPES.MULTIPLE_CHOICE && (
                      <Select
                        value={question.correctAnswer}
                        onValueChange={(value) =>
                          updateQuestion(qIndex, "correctAnswer", value)
                        }
                      >
                        <SelectTrigger
                          className={
                            errors[`q${qIndex}_answer`] ? "border-red-500" : ""
                          }
                        >
                          <SelectValue placeholder="Select correct answer" />
                        </SelectTrigger>
                        <SelectContent>
                          {question.options
                            .filter((opt) => opt.trim())
                            .map((option, i) => (
                              <SelectItem key={i} value={option}>
                                {String.fromCharCode(65 + i)}. {option}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    )}

                    {question.type === QUIZ_TYPES.TRUE_FALSE && (
                      <Select
                        value={question.correctAnswer}
                        onValueChange={(value) =>
                          updateQuestion(qIndex, "correctAnswer", value)
                        }
                      >
                        <SelectTrigger
                          className={
                            errors[`q${qIndex}_answer`] ? "border-red-500" : ""
                          }
                        >
                          <SelectValue placeholder="Select correct answer" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="true">True</SelectItem>
                          <SelectItem value="false">False</SelectItem>
                        </SelectContent>
                      </Select>
                    )}

                    {question.type === QUIZ_TYPES.FILL_BLANK && (
                      <Input
                        value={question.correctAnswer}
                        onChange={(e) =>
                          updateQuestion(
                            qIndex,
                            "correctAnswer",
                            e.target.value
                          )
                        }
                        placeholder="Enter the correct answer"
                        className={
                          errors[`q${qIndex}_answer`] ? "border-red-500" : ""
                        }
                      />
                    )}
                    {errors[`q${qIndex}_answer`] && (
                      <p className="text-sm text-red-500">
                        {errors[`q${qIndex}_answer`]}
                      </p>
                    )}
                  </div>

                  {/* Explanation */}
                  <div className="space-y-2">
                    <Label>Explanation (Optional)</Label>
                    <Textarea
                      value={question.explanation}
                      onChange={(e) =>
                        updateQuestion(qIndex, "explanation", e.target.value)
                      }
                      placeholder="Explain why this is the correct answer"
                      rows={2}
                    />
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteQuestion(qIndex)}
                >
                  <Trash2 size={18} className="text-red-600" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {questions.length === 0 && (
        <Card className="p-12">
          <div className="text-center text-muted-foreground">
            <p className="mb-4">No questions yet</p>
            <Button onClick={addQuestion} className="gap-2">
              <Plus size={16} /> Add Your First Question
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
