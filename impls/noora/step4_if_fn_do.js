const readline = require('readline');
const ns = require('./core');
const Env = require('./env');
const { CommentError } = require('./errors');
const { pr_str } = require('./printer');
const { read_str } = require('./reader');
const { MalSymbol, List, Vector, HashMap, Nil } = require('./types');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const env = new Env();

for (let key in ns) {
  env.set(new MalSymbol(key), ns[key]);
}

const READ = str => read_str(str);

const eval_ast = (ast, env) => {
  if (ast instanceof MalSymbol) {
    const value = env.get(ast);
    if (value !== undefined) {
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

    case 'do':
      return ast.ast.slice(1).reduce((_, expr) => EVAL(expr, env), null);

    case 'if':
      const exprVal = EVAL(ast.ast[1], env);
      const result =
        exprVal === Nil || exprVal === false
          ? EVAL(ast.ast[3], env)
          : EVAL(ast.ast[2], env);
      return result === undefined ? Nil : result;

    case 'fn*':
      return (...expr) => {
        const newEnv = Env.createEnv(env, ast.ast[1].ast, expr);
        return EVAL(ast.ast[2], newEnv);
      };

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
