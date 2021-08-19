class MalTypes {
  pr_str() {
    return '___default_malType___';
  }
}

const pr_str = malValue => {
  if (malValue instanceof MalTypes) {
    return malValue.pr_str();
  }
  return malValue;
};

class List extends MalTypes {
  constructor(ast) {
    super();
    this.ast = ast;
  }

  pr_str() {
    return '(' + this.ast.map(pr_str).join(' ') + ')';
  }
}

class Vector extends MalTypes {
  constructor(ast) {
    super();
    this.ast = ast;
  }

  pr_str() {
    return '[' + this.ast.map(pr_str).join(' ') + ']';
  }
}

class HashMap extends MalTypes {
  constructor(ast) {
    super();
    this.ast = ast;
  }

  pr_str() {
    let hashmap = '';
    for (const [index, val] of this.ast.entries()) {
      hashmap += `${pr_str(val)}`;
      const isLastVal = index === this.ast.length - 1;
      const isKey = index % 2 === 0;
      hashmap += isKey ? ' ' : isLastVal ? '' : ', ';
    }
    return '{' + hashmap + '}';
  }
}

class Str extends MalTypes {
  constructor(str) {
    super();
    this.str = str;
  }

  pr_str() {
    return '"' + this.str + '"';
  }
}

class NilVal extends MalTypes {
  constructor() {
    super();
  }

  pr_str() {
    return 'nil';
  }
}

const Nil = new NilVal();

module.exports = { MalTypes, Nil, List, Vector, Str, HashMap, pr_str };
