const readline = require('readline');
const ns = require('./core');
const Env = require('./env');
const { CommentError } = require('./errors');
const { pr_str } = require('./printer');
const { read_str } = require('./reader');
const { MalSymbol, List, Vector, HashMap, Nil, Fn } = require('./types');
const { readFileSync } = require('fs');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const env = new Env();

for (let key in ns) {
  env.set(new MalSymbol(key), new Fn(ns[key]));
}

const [, , fileName, ...rest] = process.argv;
const argv = new List(rest.map(arg => new MalSymbol(arg)));

env.set(
  new MalSymbol('eval'),
  new Fn(ast => {
    return EVAL(ast, env);
  })
);

env.set(new MalSymbol('*ARGV*'), argv);

const READ = str => read_str(str);

const eval_ast = (ast, env) => {
  if (ast instanceof MalSymbol) {
    const value = env.get(ast);
    if (value !== undefined && value !== null) {
      return value;
    }

    throw `Unable to resolve symbol: ${ast.pr_str()} in this context`;
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
  while (true) {
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
        ast = ast.ast[2];
        env = newEnv;
        break;

      case 'do':
        ast.ast.slice(1, -1).forEach(expr => EVAL(expr, env));
        ast = ast.ast[ast.ast.length - 1];
        break;

      case 'if':
        const result = EVAL(ast.ast[1], env);
        if (result === Nil || result === false) {
          ast = ast.ast[3];
        } else {
          ast = ast.ast[2];
        }
        break;

      case 'fn*':
        const fn = (...expr) => {
          const newEnv = Env.createEnv(env, ast.ast[1].ast, expr);
          return EVAL(ast.ast[2], newEnv);
        };
        return new Fn(fn, ast.ast[1].ast, ast.ast[2], env);

      default:
        const [func, ...args] = eval_ast(ast, env).ast;
        if (func.env) {
          ast = func.funcBody;
          env = Env.createEnv(func.env, func.binds, args);
          continue;
        }
        return func.apply(args);
    }
  }
};

const PRINT = value => pr_str(value, true);

const rep = str => {
  return PRINT(EVAL(READ(str), env));
};

const malFuncs = readFileSync('./malFunc.mal', 'utf8').split('\n\n');
malFuncs.forEach(rep);

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

if (fileName) {
  rep(`(load-file "${fileName}")`);
  process.exit(0);
} else {
  main();
}
