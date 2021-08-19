const readline = require('readline');
const { CommentError } = require('./errors');
const { pr_str } = require('./printer');
const { read_str } = require('./reader');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const READ = str => read_str(str);

const EVAL = ast => ast;

const PRINT = value => pr_str(value, true);

const rep = str => PRINT(EVAL(READ(str)));

const main = () => {
  rl.question('user> ', str => {
    try {
      console.log(rep(str));
    } catch (error) {
      if (!(error instanceof CommentError)) {
        console.log(error);
      }
    } finally {
      main();
    }
  });
};

main();
