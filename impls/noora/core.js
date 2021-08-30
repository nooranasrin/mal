const { read_str } = require('./reader');
const { pr_str, Nil, List, MalTypes, Str, Atom } = require('./types');
const { readFileSync } = require('fs');

const sum = (...numbers) => numbers.reduce((sum, num) => sum + num, 0);

const product = (...numbers) => numbers.reduce((prod, num) => prod * num, 1);

const mod = (num1, num2) => num1 % num2;

const equalTo = (val1, val2) => val1 === val2;

const readString = str => read_str(str.str);

const atom = malValue => new Atom(malValue);

const isAtom = value => value instanceof Atom;

const deref = atom => atom.malValue;

const reset = (atom, malValue) => atom.set(malValue);

const list = (...args) => new List(args);

const isList = param => param instanceof List;

const lessThanOrEqual = (...numbers) =>
  numbers.reduce((res, num) => res <= num);

const swap = (atom, fn, ...args) =>
  atom.set(fn.apply([atom.malValue, ...args]));

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
  const str = elements
    .map(element => element.pr_str(false).slice(1, -1))
    .join('');
  return new Str(str);
};

const ns = {
  '+': sum,
  '-': difference,
  '*': product,
  '/': division,
  '<=': lessThanOrEqual,
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
};

module.exports = ns;
