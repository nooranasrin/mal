const readline = require('readline');
const { CommentError } = require('./errors');
const { pr_str } = require('./printer');
const { read_str } = require('./reader');
const { MalSymbol, List, Vector, HashMap } = require('./types');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const env = {
  '+': (...numbers) => numbers.reduce((sum, num) => sum + num, 0),
  '*': (...numbers) => numbers.reduce((prod, num) => prod * num, 1),
  '-': (num1, num2) => num1 - num2,
  '/': (num1, num2) => num1 / num2,
  '%': (num1, num2) => num1 % num2,
  'empty?': ast => ast.isEmpty(),
};

const READ = str => read_str(str);

const eval_ast = (ast, env) => {
  if (ast instanceof MalSymbol) {
    const value = env[ast.symbol];
    if (value) {
      return value;
    }

    throw `Symbol not found ${ast}`;
  }

  if (ast instanceof List) {
    const newAst = ast.ast.map(val => EVAL(val, env));
    return new List(newAst);
  }

  if (ast instanceof Vector) {
    const newAst = ast.ast.map(val => EVAL(val, env));
    return new Vector(newAst);
  }

  if (ast instanceof HashMap) {
    const map = new Map();
    for (const [key, val] of ast.ast.entries()) {
      map.set(EVAL(key, env), EVAL(val, env));
    }
    return new HashMap(map);
  }

  return ast;
};

const EVAL = ast => {
  if (!(ast instanceof List)) {
    return eval_ast(ast, env);
  }
  if (ast.isEmpty()) {
    return ast;
  }

  const [func, ...args] = eval_ast(ast, env).ast;
  if (func instanceof Function) {
    return func.apply(null, args);
  }

  throw `${func} is not a function`;
};

const PRINT = value => pr_str(value, true);

const rep = str => PRINT(EVAL(READ(str)), env);

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
