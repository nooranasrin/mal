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

module.exports = { MalTypes, Nil, List, Vector, Str, pr_str };
