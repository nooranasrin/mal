const { read_str } = require('./reader');
const { pr_str, Nil, List, MalTypes, Str, Atom, Vector } = require('./types');
const { readFileSync } = require('fs');

const sum = (...numbers) => numbers.reduce((sum, num) => sum + num, 0);

const product = (...numbers) => numbers.reduce((prod, num) => prod * num, 1);

const mod = (num1, num2) => num1 % num2;

const greaterThan = (num1, num2) => num1 > num2;

const lesserThan = (num1, num2) => num1 < num2;

const readString = str => read_str(str.str);

const atom = malValue => new Atom(malValue);

const isAtom = value => value instanceof Atom;

const deref = atom => atom.malValue;

const reset = (atom, malValue) => atom.set(malValue);

const list = (...args) => new List(args);

const isList = param => param instanceof List;

const cons = (element, list) => list.cons(element);

const lessThanOrEqual = (...numbers) =>
  numbers.reduce((res, num) => res <= num);

const swap = (atom, fn, ...args) =>
  atom.set(fn.apply([atom.malValue, ...args]));

const concat = (...lists) => {
  return lists.reduce((newList, list) => {
    return new List([...newList.ast, ...list.ast]);
  }, new List([]));
};

const equalTo = (val1, val2) => {
  if (!(val1 instanceof MalTypes)) {
    return val1 === val2;
  }
  return val1.equalTo(val2);
};

const difference = (...numbers) => {
  if (numbers.length === 1) {
    numbers.unshift(0);
  }
  return numbers.reduce((diff, num) => diff - num);
};

const division = (...numbers) => {
  if (numbers.length === 1) {
    numbers.unshift(1);
  }
  return numbers.reduce((res, num) => res / num);
};

const prn = val => {
  console.log(pr_str(val, true));
  return Nil;
};

const empty = param => {
  if (param instanceof MalTypes) {
    return param.isEmpty();
  }
  return false;
};

const count = param => {
  if (param instanceof MalTypes) {
    return param.count();
  }
  throw `unsupported operation ${count} on ${param}`;
};

const slurp = fileName => {
  const content = readFileSync(fileName.str, 'utf8');
  return new Str(content);
};

const str = (...elements) => {
  const str = elements.map(element => element.pr_str(false)).join('');
  return new Str(str);
};

const vec = element => {
  if (element instanceof List) {
    return new Vector(element.ast);
  }
  return element;
};

const nth = (sequence, n) => {
  if (!sequence.nth) {
    throw 'Unsupported operation';
  }
  return sequence.nth(n);
};

const first = sequence => {
  if (!sequence.first) {
    throw 'Unsupported operation';
  }
  return sequence.first();
};

const rest = sequence => {
  if (!sequence.rest) {
    throw 'Unsupported operation';
  }
  return sequence.rest();
};

const ns = {
  '+': sum,
  '-': difference,
  '*': product,
  '/': division,
  '<=': lessThanOrEqual,
  '>': greaterThan,
  '<': lesserThan,
  'empty?': empty,
  '=': equalTo,
  'read-string': readString,
  'atom?': isAtom,
  'reset!': reset,
  'swap!': swap,
  'list?': isList,
  prn,
  count,
  slurp,
  list,
  str,
  atom,
  deref,
  mod,
  cons,
  concat,
  vec,
  nth,
  first,
  rest,
};

module.exports = ns;
