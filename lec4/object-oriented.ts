// A program that administers and grades an electronic exam.
// (Object-oriented style)

import PromptSync from "prompt-sync"
import { readFileSync } from "fs"
import { Randomizer } from "../util/randomization";

class Exam {

  private readonly questions: Question[];
  private readonly totalPoints: number;

  public constructor(questions: Question[]) {
    this.questions = questions;
    let total = 0;
    for (const question of questions) {
      total += question.pointsWorth;
    }
    this.totalPoints = total;
  }

  public administerExam(prompt: PromptSync.Prompt): void {

    for (const question of this.questions) {
      question.promptQuestion(prompt);
    }

    for (const question of this.questions) {
      question.grade();
    }
  }

  public printExamReport(): void {
    console.log("Exam Report:");
    let totalScore = 0;
    for (const question of this.questions) {
      question.printReport();
      if (question.score !== undefined) {
        totalScore += question.score;
      }
      console.log("---");
    }
    console.log(`Total Score: ${totalScore} / ${this.totalPoints}`);
  }
}

// Base class for a question
class Question {

  public readonly title: string;
  public readonly text: string;
  public readonly answer: string;
  public readonly pointsWorth: number;

  private _submission: string | undefined;
  private _score: number | undefined;

  public constructor(title: string, text: string, answer: string, pointsWorth: number) {
    this.title = title;
    this.text = text;
    this.answer = answer;
    this.pointsWorth = pointsWorth;
  }

  public get submission(): string | undefined {
    return this._submission;
  }

  public get score(): number | undefined {
    return this._score;
  }

  public grade(): void {
    if (!this._submission) { return; }
    if (this._submission === this.answer) {
      this._score = this.pointsWorth;
    } else {
      this._score = 0;
    }
  }

  public promptQuestion(prompt: PromptSync.Prompt): void {
    console.log(`Question: ${this.title} (${this.pointsWorth} points)`);
    console.log(this.text);
    const response = prompt("Your answer: ");
    this._submission = response;
  }

  public printReport(): void {
    console.log(`Question: ${this.text}`);
    console.log(`Submitted answer: ${this._submission}`);
    console.log(`Correct answer: ${this.answer}`);
    if (this.score !== undefined) {
      console.log(`Score: ${this.score} / ${this.pointsWorth}`);
    } else {
      console.log("Score: Not graded yet.");
    }
  }

  // Method to display the question
  public display(): void {
      console.log(this.text);
  }
}

function main() {

  // Read questions from file
  const data = readFileSync("questions.json", "utf-8");
  const questionData: { title: string; text: string; answer: string; pointsWorth: number }[] = JSON.parse(data);

  // Create Exam instance with 5 random questions
  const rand = Randomizer.create_autoseeded();
  const selectedData = rand.choose_n(questionData, 5);
  const questions: Question[] = selectedData.map(q => new Question(q.title, q.text, q.answer, q.pointsWorth));

  const exam = new Exam(questions);

  // Administer the exam
  const prompt = PromptSync({ sigint: true });
  exam.administerExam(prompt);

  // Print the exam report
  exam.printExamReport();
}

main();