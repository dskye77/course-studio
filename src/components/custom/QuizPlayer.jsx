// src/components/custom/QuizPlayer.jsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle,
  XCircle,
  Trophy,
  RotateCcw,
  ArrowRight,
  AlertCircle,
} from "lucide-react";
import { QUIZ_TYPES, validateQuizAnswers } from "@/lib/firebaseQuizzes";

export default function QuizPlayer({ quiz, onComplete, previousScore = null }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState(null);

  const question = quiz.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / quiz.questions.length) * 100;

  const handleAnswer = (answer) => {
    setUserAnswers({
      ...userAnswers,
      [currentQuestion]: answer,
    });
  };

  const handleNext = () => {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = () => {
    const validationResults = validateQuizAnswers(
      quiz,
      Object.values(userAnswers)
    );
    setResults(validationResults);
    setShowResults(true);

    if (onComplete) {
      onComplete({
        score: validationResults.score,
        totalQuestions: validationResults.totalQuestions,
        percentage: validationResults.percentage,
        answers: userAnswers,
      });
    }
  };

  const handleRetry = () => {
    setCurrentQuestion(0);
    setUserAnswers({});
    setShowResults(false);
    setResults(null);
  };

  if (showResults && results) {
    const passed = results.percentage >= quiz.passingScore;

    return (
      <div className="space-y-6">
        {/* Results Summary */}
        <Card
          className={`border-2 ${
            passed ? "border-green-500" : "border-orange-500"
          }`}
        >
          <CardContent className="pt-6 text-center space-y-4">
            <div
              className={`mx-auto w-20 h-20 rounded-full flex items-center justify-center ${
                passed
                  ? "bg-green-100 dark:bg-green-900/20"
                  : "bg-orange-100 dark:bg-orange-900/20"
              }`}
            >
              {passed ? (
                <Trophy className="w-10 h-10 text-green-600" />
              ) : (
                <AlertCircle className="w-10 h-10 text-orange-600" />
              )}
            </div>

            <div>
              <h2 className="text-3xl font-bold mb-2">
                {passed ? "Congratulations!" : "Keep Practicing!"}
              </h2>
              <p className="text-muted-foreground">
                You scored {results.score} out of {results.totalQuestions}
              </p>
            </div>

            <div className="space-y-2">
              <div className="text-5xl font-bold text-primary">
                {results.percentage}%
              </div>
              <Progress value={results.percentage} className="h-3" />
              <p className="text-sm text-muted-foreground">
                Passing score: {quiz.passingScore}%
              </p>
            </div>

            {previousScore && (
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm">
                  Previous attempt: {previousScore.percentage}%
                  {results.percentage > previousScore.percentage && (
                    <span className="text-green-600 ml-2">
                      +{results.percentage - previousScore.percentage}%
                    </span>
                  )}
                </p>
              </div>
            )}

            <Button onClick={handleRetry} className="gap-2">
              <RotateCcw size={16} />
              Try Again
            </Button>
          </CardContent>
        </Card>

        {/* Detailed Results */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Review Answers</h3>
          {results.results.map((result, index) => (
            <Card
              key={index}
              className={`border-l-4 ${
                result.isCorrect ? "border-l-green-500" : "border-l-red-500"
              }`}
            >
              <CardContent className="pt-6 space-y-3">
                <div className="flex items-start gap-3">
                  {result.isCorrect ? (
                    <CheckCircle className="w-6 h-6 text-green-600 shrink-0 mt-1" />
                  ) : (
                    <XCircle className="w-6 h-6 text-red-600 shrink-0 mt-1" />
                  )}
                  <div className="flex-1 space-y-2">
                    <p className="font-semibold">
                      Question {index + 1}: {result.question}
                    </p>

                    <div className="space-y-1 text-sm">
                      <p>
                        <span className="text-muted-foreground">
                          Your answer:
                        </span>{" "}
                        <span
                          className={
                            result.isCorrect ? "text-green-600" : "text-red-600"
                          }
                        >
                          {String(result.userAnswer || "Not answered")}
                        </span>
                      </p>

                      {!result.isCorrect && (
                        <p>
                          <span className="text-muted-foreground">
                            Correct answer:
                          </span>{" "}
                          <span className="text-green-600">
                            {String(result.correctAnswer)}
                          </span>
                        </p>
                      )}
                    </div>

                    {result.explanation && (
                      <div className="p-3 bg-muted rounded-lg text-sm">
                        <p className="font-medium mb-1">Explanation:</p>
                        <p className="text-muted-foreground">
                          {result.explanation}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="font-medium">
            Question {currentQuestion + 1} of {quiz.questions.length}
          </span>
          <span className="text-muted-foreground">
            {Math.round(progress)}% Complete
          </span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Question Card */}
      <Card>
        <CardContent className="pt-6 space-y-6">
          <div>
            <h3 className="text-xl font-semibold mb-4">{question.question}</h3>

            {/* Multiple Choice */}
            {question.type === QUIZ_TYPES.MULTIPLE_CHOICE && (
              <div className="space-y-3">
                {question.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswer(option)}
                    className={`w-full text-left p-4 rounded-lg border-2 transition ${
                      userAnswers[currentQuestion] === option
                        ? "border-primary bg-primary/10"
                        : "border-gray-200 dark:border-gray-800 hover:border-primary/50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                          userAnswers[currentQuestion] === option
                            ? "border-primary bg-primary"
                            : "border-gray-300"
                        }`}
                      >
                        {userAnswers[currentQuestion] === option && (
                          <CheckCircle className="w-4 h-4 text-white" />
                        )}
                      </div>
                      <span className="font-medium">
                        {String.fromCharCode(65 + index)}.
                      </span>
                      <span>{option}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* True/False */}
            {question.type === QUIZ_TYPES.TRUE_FALSE && (
              <div className="grid grid-cols-2 gap-4">
                {["true", "false"].map((option) => (
                  <button
                    key={option}
                    onClick={() => handleAnswer(option)}
                    className={`p-6 rounded-lg border-2 transition ${
                      userAnswers[currentQuestion] === option
                        ? "border-primary bg-primary/10"
                        : "border-gray-200 dark:border-gray-800 hover:border-primary/50"
                    }`}
                  >
                    <div className="text-center">
                      <div
                        className={`mx-auto w-12 h-12 rounded-full border-2 flex items-center justify-center mb-2 ${
                          userAnswers[currentQuestion] === option
                            ? "border-primary bg-primary"
                            : "border-gray-300"
                        }`}
                      >
                        {userAnswers[currentQuestion] === option && (
                          <CheckCircle className="w-6 h-6 text-white" />
                        )}
                      </div>
                      <span className="font-semibold capitalize">{option}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Fill in the Blank */}
            {question.type === QUIZ_TYPES.FILL_BLANK && (
              <div className="space-y-2">
                <Label>Your Answer</Label>
                <Input
                  value={userAnswers[currentQuestion] || ""}
                  onChange={(e) => handleAnswer(e.target.value)}
                  placeholder="Type your answer here"
                  className="text-lg"
                />
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between pt-4 border-t">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
            >
              Previous
            </Button>

            <div className="text-sm text-muted-foreground">
              {Object.keys(userAnswers).length} of {quiz.questions.length}{" "}
              answered
            </div>

            <Button
              onClick={handleNext}
              disabled={userAnswers[currentQuestion] === undefined}
              className="gap-2"
            >
              {currentQuestion === quiz.questions.length - 1 ? (
                <>Submit</>
              ) : (
                <>
                  Next <ArrowRight size={16} />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
