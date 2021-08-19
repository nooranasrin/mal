const readline = require('readline');
const { pr_str } = require('./printer');
const { read_str } = require('./reader');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const READ = str => read_str(str);

const EVAL = ast => ast;

const PRINT = value => pr_str(value);

const rep = str => PRINT(EVAL(READ(str)));

const main = () => {
  rl.question('user> ', str => {
    try {
      console.log(rep(str));
    } catch (e) {
      console.log(e);
    } finally {
      main();
    }
  });
};

main();
