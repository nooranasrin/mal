const { read_str } = require('./reader');
const {
  pr_str,
  Nil,
  List,
  MalTypes,
  Str,
  Atom,
  Vector,
  MalSymbol,
  KeyWord,
  HashMap,
  Fn,
} = require('./types');
const { readFileSync } = require('fs');
const { createMap } = require('./utils');
const { CustomError } = require('./errors');

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

const vector = (...args) => new Vector(args);

const hashMap = (...args) => new HashMap(createMap(args));

const isList = param => param instanceof List;

const isVector = param => param instanceof Vector;

const isMap = param => param instanceof HashMap;

const isSequential = param => isList(param) || isVector(param);

const cons = (element, list) => list.cons(element);

const reverse = sequence => sequence.reverse();

const insert = (sequence, pos, element) => sequence.insert(pos, element);

const not = val => !val;

const isNil = val => val === Nil;

const isTrue = val => val === true;

const isFalse = val => val === false;

const isSymbol = val => val instanceof MalSymbol;

const symbol = str => new MalSymbol(str.str);

const isKeyword = val => val instanceof KeyWord;

const get = (map, key) => (map.get ? map.get(key) : Nil);

const isIncludes = (map, key) => map.includes(key);

const keys = map => map.keys();

const vals = map => map.vals();

const lessThanOrEqual = (...numbers) =>
  numbers.reduce((res, num) => res <= num);

const greaterThanOrEqual = (...numbers) =>
  numbers.reduce((res, num) => res >= num);

const swap = (atom, fn, ...args) =>
  atom.set(fn.apply([atom.malValue, ...args]));

const concat = (...lists) => {
  return lists.reduce((newList, list) => {
    return new List([...newList.ast, ...list.ast]);
  }, new List([]));
};

const assoc = (map, ...keyAndValues) => {
  if (!(map instanceof HashMap)) {
    throw "Unsupported operation 'assoc'";
  }
  return map.assoc(...keyAndValues);
};

const dissoc = (map, ...keys) => {
  if (!(map instanceof HashMap)) {
    throw "Unsupported operation 'assoc'";
  }
  return map.dissoc(...keys);
};

const keyword = val => {
  if (isKeyword(val)) {
    return val;
  }
  return new KeyWord(val.str);
};

const throwFn = malType => {
  throw new CustomError(malType);
};

const apply = (fn, ...args) => {
  if (!(fn instanceof Fn)) {
    throw new CustomError(new Str(`${fn} is not a function`));
  }
  let lastElement = args[args.length - 1];
  if (lastElement instanceof Vector || lastElement instanceof List) {
    lastElement = lastElement.ast;
  }
  return fn.apply(args.slice(0, -1).concat(lastElement));
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

const toStr = (elements, printReadably) =>
  elements.map(elt => pr_str(elt, printReadably)).join(' ');

const print = (elements, printReadably) => {
  console.log(toStr(elements, printReadably));
  return Nil;
};

const prn = (...elements) => print(elements, true);

const println = (...elements) => print(elements, false);

const prStr = (...elements) => toStr(elements, true);

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
  const str = elements.map(element => pr_str(element, false));
  return new Str(str.join(''));
};

const vec = element => {
  if (element instanceof List) {
    return new Vector(element.args);
  }
  return element;
};

const nth = (sequence, n) => {
  if (!sequence.nth) {
    throwFn(new Str('Unsupported operation'));
  }
  return sequence.nth(n);
};

const last = sequence => {
  if (!sequence.last) {
    throwFn(new Str('Unsupported operation'));
  }
  return sequence.last();
};

const first = sequence => {
  if (sequence === Nil) {
    return Nil;
  }
  if (!sequence.first) {
    throwFn(new Str('Unsupported operation'));
  }
  return sequence.first();
};

const rest = sequence => {
  if (sequence === Nil) {
    return new List([]);
  }
  if (!sequence.rest) {
    throwFn(new Str('Unsupported operation'));
  }
  return sequence.rest();
};

const ns = {
  '+': sum,
  '-': difference,
  '*': product,
  '/': division,
  '<=': lessThanOrEqual,
  '>=': greaterThanOrEqual,
  '>': greaterThan,
  '<': lesserThan,
  'empty?': empty,
  '=': equalTo,
  'read-string': readString,
  'atom?': isAtom,
  'reset!': reset,
  'swap!': swap,
  'list?': isList,
  'vector?': isVector,
  'map?': isMap,
  'sequential?': isSequential,
  'pr-str': prStr,
  'nil?': isNil,
  'true?': isTrue,
  'false?': isFalse,
  'symbol?': isSymbol,
  'keyword?': isKeyword,
  'hash-map': hashMap,
  'contains?': isIncludes,
  throw: throwFn,
  symbol,
  keyword,
  assoc,
  dissoc,
  apply,
  prn,
  println,
  count,
  slurp,
  list,
  vector,
  str,
  atom,
  deref,
  mod,
  cons,
  concat,
  vec,
  nth,
  first,
  last,
  rest,
  not,
  reverse,
  insert,
  get,
  keys,
  vals,
};

module.exports = ns;
