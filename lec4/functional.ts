// A program that administers and grades an electronic exam.
// (Functional style)

import { createInterface, Interface} from "node:readline/promises";
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

async function promptQuestion(rl: Interface, question: Question): Promise<AnsweredQuestion> {
  console.log(`Question: ${question.title} (${question.pointsWorth} points)`);
  console.log(question.text);
  const submission = await rl.question("Your answer: ");
  return { // new object with a submission added
    ...question,
    submission: submission ?? ""
  };
}

function gradeQuestion(question: AnsweredQuestion): GradedQuestion {
  return { // new object with a score added
    ...question,
    score: question.submission === question.answer ? question.pointsWorth : 0
  };
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

  gradedQuestions.forEach(question => {
    printQuestionReport(question);
    console.log("---");
  });

  const totalPoints = calculateTotalPoints(gradedQuestions);
  const totalScore = calculateTotalScore(gradedQuestions);
  console.log(`Total Score: ${totalScore} / ${totalPoints}`);
}

/**
 * In the functional style, "administering an exam" is implemented as taking
 * an array of original questions and returning a new array of answered questions.
 * There are no "side effects" or state changes to existing objects.
 */
async function administerExam(rl: Interface, questions: readonly Question[]): Promise<readonly GradedQuestion[]> {
  // This pipeline takes the original list of questions...
  // We need to process questions sequentially (one at a time) for user input
  const answeredQuestions: AnsweredQuestion[] = [];
  for (const q of questions) {
    answeredQuestions.push(await promptQuestion(rl, q));
  }
  return answeredQuestions.map(gradeQuestion); // ...and then maps those into graded questions.
}

function loadQuestions(filePath: string): readonly Question[] {
  const data = readFileSync(filePath, "utf-8");
  return JSON.parse(data) as Question[]; // Assumes the JSON is formatted correctly
}

function selectRandomQuestions(questions: readonly Question[], count: number): readonly Question[] {
  const rand = Randomizer.create_autoseeded();
  return rand.choose_n([...questions], count);
}

async function main() {
  const rl = createInterface({ input: process.stdin, output: process.stdout });

  try {
    const allQuestions = loadQuestions("questions.json");

    const selectedQuestions = selectRandomQuestions(allQuestions, 5);

    const gradedQuestions = await administerExam(rl, selectedQuestions);

    printExamReport(gradedQuestions);
  } finally {
    rl.close();
  }
}

main();
