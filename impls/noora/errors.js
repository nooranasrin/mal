class CommentError extends Error {
  constructor() {
    super();
  }
}

class CustomError extends Error {
  constructor(malType) {
    super(malType.pr_str(false));
  }
}

module.exports = { CommentError, CustomError };
