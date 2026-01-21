// A program that administers and grades an electronic exam.
// (Functional style)

import PromptSync from "prompt-sync";
import { readFileSync } from "fs";
import { Randomizer } from "../util/randomization";

interface Question {
  readonly title: string;
  readonly text: string;
  readonly answer: string;
  readonly pointsWorth: number;
};

interface AnsweredQuestion extends Question {
  readonly submission: string;
};

interface GradedQuestion extends AnsweredQuestion {
  readonly score: number;
};

function gradeQuestion(question: AnsweredQuestion): GradedQuestion {
  const score = question.submission === question.answer ? question.pointsWorth : 0;
  return { ...question, score };
}

function promptQuestion(prompt: PromptSync.Prompt, question: Question): AnsweredQuestion {
  console.log(`Question: ${question.title} (${question.pointsWorth} points)`);
  console.log(question.text);
  const submission = prompt("Your answer: ") ?? "";
  return { ...question, submission };
}

function printQuestionReport(question: GradedQuestion): void {
  console.log(`Question: ${question.text}`);
  console.log(`Submitted answer: ${question.submission}`);
  console.log(`Correct answer: ${question.answer}`);
  console.log(`Score: ${question.score} / ${question.pointsWorth}`);
}



function calculateTotalPoints(questions: readonly Question[]): number {
  return questions.reduce((total, q) => total + q.pointsWorth, 0);
}

function calculateTotalScore(questions: readonly GradedQuestion[]): number {
  return questions.reduce((total, q) => total + q.score, 0);
}

function printExamReport(gradedQuestions: readonly GradedQuestion[]): void {
  console.log("Exam Report:");
  const totalPoints = calculateTotalPoints(gradedQuestions);
  const totalScore = calculateTotalScore(gradedQuestions);

  gradedQuestions.forEach(question => {
    printQuestionReport(question);
    console.log("---");
  });

  console.log(`Total Score: ${totalScore} / ${totalPoints}`);
}

// Function to administer an exam: prompt all questions, then grade them
function administerExam(prompt: PromptSync.Prompt, questions: readonly Question[]): readonly GradedQuestion[] {
  // Prompt all questions (map over questions to get answered questions)
  const answeredQuestions = questions.map(q => promptQuestion(prompt, q));

  // Grade all questions (map over answered questions to get graded questions)
  const gradedQuestions = answeredQuestions.map(gradeQuestion);

  return gradedQuestions;
}

// Pure function to load and parse questions from file
function loadQuestions(filePath: string): readonly Question[] {
  const data = readFileSync(filePath, "utf-8");
  const questionData: Question[] = JSON.parse(data);
  return questionData;
}

// Pure function to select random questions
function selectRandomQuestions(questions: readonly Question[], count: number): readonly Question[] {
  const rand = Randomizer.create_autoseeded();
  return rand.choose_n([...questions], count);
}

function main() {
  const prompt = PromptSync({ sigint: true });

  // Load questions from file
  const allQuestions = loadQuestions("questions.json");

  // Select 5 random questions
  const selectedQuestions = selectRandomQuestions(allQuestions, 5);

  // Administer the exam (prompt and grade)
  const gradedQuestions = administerExam(prompt, selectedQuestions);

  // Print the report
  printExamReport(gradedQuestions);
}

main();
