const { read_str } = require('./reader');
const { pr_str, Nil, List, MalTypes, Str } = require('./types');
const { readFileSync } = require('fs');
const sum = (...numbers) => numbers.reduce((sum, num) => sum + num, 0);

const difference = (...numbers) => {
  if (numbers.length === 1) {
    numbers.unshift(0);
  }
  return numbers.reduce((diff, num) => diff - num);
};

const product = (...numbers) => numbers.reduce((prod, num) => prod * num, 1);

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

const equalTo = (val1, val2) => val1 === val2;

const readString = str => {
  return read_str(str);
};

const slurp = fileName => {
  const content = readFileSync(fileName.str);
  return new Str(content);
};

const list = (...args) => {
  return new List(args);
};

const str = (...elements) =>
  elements.map(element => element.pr_str(false).slice(1, -1)).join('');

// const isList = param => {
//   return param instanceof List;
// };

const ns = {
  '+': sum,
  '-': difference,
  '*': product,
  '/': division,
  prn,
  'empty?': empty,
  count,
  '=': equalTo,
  'read-string': readString,
  slurp,
  list,
  str,
  //   'list?': isList,
};

module.exports = ns;
