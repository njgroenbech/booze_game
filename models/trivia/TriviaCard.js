export default class TriviaCard {
  // question/answer are { da, en } objects.
  constructor(question, answer) {
    this.question = question;
    this.answer = answer;
  }

  getQuestion(language) {
    return this.question[language] ?? this.question.da;
  }

  getAnswer(language) {
    return this.answer[language] ?? this.answer.da;
  }
}
