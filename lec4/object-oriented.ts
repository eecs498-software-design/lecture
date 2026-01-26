// A program that administers and grades an electronic exam.
// (Object-oriented style)

import { createInterface, Interface} from "node:readline/promises";
import { readFileSync } from "fs"
import { Randomizer } from "../util/randomization";
import { assert } from "console";

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

  public async administerExam(rl: Interface): Promise<void> {

    // questions have .submission = undefined
    // questions have .score = undefined
    for (const question of this.questions) {
      await question.promptQuestion(rl);
    }
    // now questions have .submission defined

    for (const question of this.questions) {
      question.grade();
    }
    // now questions have .score defined
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

class Question {

  public readonly title: string;
  public readonly text: string;
  public readonly answer: string;
  public readonly pointsWorth: number;

  private _submission?: string; // ? means it's string | undefined
  private _score?: number; // ? means it's string | undefined

  public constructor(title: string, text: string, answer: string, pointsWorth: number) {
    this.title = title;
    this.text = text;
    this.answer = answer;
    this.pointsWorth = pointsWorth;
  }

  // public getSubmission(): string | undefined {
  // below version allows access via q.submission
  public get submission(): string | undefined {
    return this._submission;
  }

  public get score(): number | undefined {
    return this._score;
  }

  public async promptQuestion(rl: Interface): Promise<void> {
    console.log(`Question: ${this.title} (${this.pointsWorth} points)`);
    console.log(this.text);
    this._submission = await rl.question("Your answer: ");
  }

  public grade(): void {
    assert(this._submission);
    // if (!this._submission) { return; }
    if (this._submission === this.answer) {
      this._score = this.pointsWorth;
    } else {
      this._score = 0;
    }
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

function loadQuestions(filePath: string): Question[] {
  const data = readFileSync(filePath, "utf-8");
  const questionData: { title: string; text: string; answer: string; pointsWorth: number }[] = JSON.parse(data);
  const rand = Randomizer.create_autoseeded();
  const selectedData = rand.choose_n(questionData, 5);
  const questions: Question[] = selectedData.map(q => new Question(q.title, q.text, q.answer, q.pointsWorth));
  return questions;
}

async function main() {
  const questions = loadQuestions("questions.json");  

  const exam = new Exam(questions);

  const rl = createInterface({ input: process.stdin, output: process.stdout });
  try {
    await exam.administerExam(rl);
  } finally {
    rl.close();
  }

  exam.printExamReport();
}

main();