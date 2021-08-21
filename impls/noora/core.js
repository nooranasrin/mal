const { pr_str, Nil, List, MalTypes } = require('./types');

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

// const list = (...args) => {
//   return new List(args);
// };

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
  //   list,
  //   'list?': isList,
};

module.exports = ns;
