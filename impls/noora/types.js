class MalTypes {
  pr_str(printReadably = false) {
    return '___default_malType___';
  }
}

const pr_str = (malValue, printReadably = false) => {
  if (malValue instanceof MalTypes) {
    return malValue.pr_str(printReadably);
  }
  return malValue;
};

class List extends MalTypes {
  constructor(ast) {
    super();
    this.ast = ast;
  }

  pr_str(printReadably = false) {
    return '(' + this.ast.map(pr_str).join(' ') + ')';
  }

  isEmpty() {
    return this.ast.length === 0;
  }
}

class Vector extends MalTypes {
  constructor(ast) {
    super();
    this.ast = ast;
  }

  pr_str(printReadably = false) {
    return '[' + this.ast.map(pr_str).join(' ') + ']';
  }

  isEmpty() {
    return this.ast.length === 0;
  }
}

class HashMap extends MalTypes {
  constructor(ast) {
    super();
    this.ast = ast;
  }

  pr_str(printReadably = false) {
    let hashmap = '';
    let separator = '';
    for (const [key, val] of this.ast.entries()) {
      hashmap += separator + pr_str(key, printReadably);
      hashmap += ' ' + pr_str(val, printReadably);
      separator = ' ';
    }
    return '{' + hashmap + '}';
  }
}

class Str extends MalTypes {
  constructor(str) {
    super();
    this.str = str;
  }

  pr_str(printReadably = false) {
    if (printReadably) {
      const string = this.str
        .replace(/\\/g, '\\\\')
        .replace(/"/g, '\\"')
        .replace(/\n/g, '\\n');
      return '"' + string + '"';
    }
    return '"' + this.str + '"';
  }
}
class KeyWord extends MalTypes {
  constructor(keyword) {
    super();
    this.keyword = keyword;
  }

  pr_str(printReadably = false) {
    return ':' + this.keyword;
  }
}

class MalSymbol extends MalTypes {
  constructor(symbol) {
    super();
    this.symbol = symbol;
  }

  pr_str(printReadably = false) {
    return this.symbol;
  }
}

class NilVal extends MalTypes {
  constructor() {
    super();
  }

  pr_str(printReadably = false) {
    return 'nil';
  }
}

const Nil = new NilVal();

module.exports = {
  MalTypes,
  Nil,
  List,
  Vector,
  Str,
  HashMap,
  KeyWord,
  MalSymbol,
  pr_str,
};
