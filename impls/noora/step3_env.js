const readline = require('readline');
const Env = require('./env');
const { CommentError } = require('./errors');
const { pr_str } = require('./printer');
const { read_str } = require('./reader');
const { MalSymbol, List, Vector, HashMap } = require('./types');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const env = new Env();

env.set(new MalSymbol('+'), (...numbers) =>
  numbers.reduce((sum, num) => sum + num, 0)
);
env.set(new MalSymbol('*'), (...numbers) =>
  numbers.reduce((prod, num) => prod * num, 1)
);
env.set(new MalSymbol('-'), (...numbers) => {
  if (numbers.length === 1) {
    numbers.unshift(0);
  }
  return numbers.reduce((diff, num) => diff - num);
});
env.set(new MalSymbol('/'), (...numbers) => {
  if (numbers.length === 1) {
    numbers.unshift(1);
  }
  return numbers.reduce((res, num) => res / num);
});

const READ = str => read_str(str);

const eval_ast = (ast, env) => {
  if (ast instanceof MalSymbol) {
    const value = env.get(ast);
    if (value) {
      return value;
    }

    throw `${ast.symbol} not found.`;
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

const EVAL = (ast, env) => {
  if (!(ast instanceof List)) {
    return eval_ast(ast, env);
  }
  if (ast.isEmpty()) {
    return ast;
  }

  switch (ast.ast[0].symbol) {
    case 'def!':
      return env.set(ast.ast[1], EVAL(ast.ast[2], env));

    case 'let*':
      const newEnv = new Env(env);
      const bindings = ast.ast[1];
      for (let i = 0; i < bindings.ast.length; i += 2) {
        newEnv.set(bindings.ast[i], EVAL(bindings.ast[i + 1], newEnv));
      }
      return EVAL(ast.ast[2], newEnv);

    default:
      const [func, ...args] = eval_ast(ast, env).ast;
      if (func instanceof Function) {
        return func.apply(null, args);
      }

      throw `${func} is not a function`;
  }
};

const PRINT = value => pr_str(value, true);

const rep = str => PRINT(EVAL(READ(str), env));

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
