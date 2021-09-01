const readline = require('readline');
const ns = require('./core');
const Env = require('./env');
const { CommentError } = require('./errors');
const { pr_str } = require('./printer');
const { read_str } = require('./reader');
const { MalSymbol, List, Vector, HashMap, Nil, Fn, Str } = require('./types');
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
const argv = new List(rest.map(arg => new Str(arg)));

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

const expandListForQuoting = ast => {
  let result = new List([]);
  for (let i = ast.ast.length - 1; i >= 0; i--) {
    const elt = ast.ast[i];
    if (elt instanceof List && elt.startsWith('splice-unquote')) {
      result = new List([new MalSymbol('concat'), elt.ast[1], result]);
    } else {
      result = new List([new MalSymbol('cons'), quasiquote(elt), result]);
    }
  }
  return result;
};

const quasiquote = ast => {
  if (ast instanceof List && ast.startsWith('unquote')) {
    return ast.ast[1];
  }
  if (ast instanceof List) {
    return expandListForQuoting(ast);
  }
  if (ast instanceof Vector) {
    return new List([new MalSymbol('vec'), expandListForQuoting(ast)]);
  }
  if (ast instanceof MalSymbol || ast instanceof HashMap) {
    return new List([new MalSymbol('quote'), ast]);
  }
  return ast;
};

const is_macro_call = (ast, env) =>
  ast instanceof List &&
  ast.ast[0] instanceof MalSymbol &&
  env.find(ast.ast[0]) &&
  env.get(ast.ast[0]) instanceof Fn &&
  env.get(ast.ast[0]).isMacro;

const macroexpand = (ast, env) => {
  while (is_macro_call(ast, env)) {
    const firstElement = env.get(ast.ast[0]);
    ast = firstElement.apply(ast.ast.slice(1));
  }
  return ast;
};

const EVAL = (ast, env) => {
  while (true) {
    ast = macroexpand(ast, env);
    if (!(ast instanceof List)) {
      return eval_ast(ast, env);
    }
    if (ast.isEmpty()) {
      return ast;
    }

    switch (ast.ast[0].symbol) {
      case 'def!':
        if (ast.ast.length !== 3) {
          throw 'Invalid number of arguments to def!';
        }
        return env.set(ast.ast[1], EVAL(ast.ast[2], env));

      case 'defmacro!':
        if (ast.ast.length !== 3) {
          throw 'Invalid number of arguments to defmacro!';
        }
        const value = EVAL(ast.ast[2], env);
        value.isMacro = true;
        return env.set(ast.ast[1], value);

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

      case 'quote':
        return ast.ast[1];

      case 'quasiquoteexpand':
        return quasiquote(ast.ast[1]);

      case 'quasiquote':
        ast = quasiquote(ast.ast[1]);
        break;

      case 'macroexpand':
        return macroexpand(ast.ast[1], env);

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

const rep = str => PRINT(EVAL(READ(str), env));

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
