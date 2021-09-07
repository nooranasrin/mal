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

class Sequence extends MalTypes {
  constructor(ast) {
    super();
    this.ast = ast;
  }

  isEmpty() {
    return this.ast.length === 0;
  }

  count() {
    return this.ast.length;
  }

  cons(element) {
    return new List([element, ...this.ast]);
  }

  reverse() {
    return new List(this.ast.reverse());
  }

  first() {
    if (this.isEmpty() || this.ast === Nil) {
      return Nil;
    }
    return this.ast[0];
  }

  last() {
    if (this.isEmpty() || this.ast === Nil) {
      return Nil;
    }
    return this.ast[this.ast.length - 1];
  }

  rest() {
    if (this.isEmpty() || this.ast === Nil) {
      return new List([]);
    }
    return new List(this.ast.slice(1));
  }

  nth(n) {
    if (n >= this.ast.length || n < 0) {
      throw `Index out of range: ${n}`;
    }
    return this.ast[n];
  }

  startsWith(element) {
    return (
      (this.ast[0] instanceof MalSymbol && this.ast[0].symbol === element) ||
      (this.ast[0] instanceof Str && this.ast[0].str === element)
    );
  }

  equalTo(other) {
    if (other?.ast?.length !== 0 && this.ast.length === 0) {
      return false;
    }
    return this.ast.every((elt, index) => {
      if (!(elt instanceof MalTypes)) {
        return elt === other.ast[index];
      }
      return elt.equalTo(elt, other.ast[index]);
    });
  }
}

class List extends Sequence {
  pr_str(printReadably = false) {
    return '(' + this.ast.map(x => pr_str(x, printReadably)).join(' ') + ')';
  }
}

class Vector extends Sequence {
  pr_str(printReadably = false) {
    return '[' + this.ast.map(x => pr_str(x, printReadably)).join(' ') + ']';
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

  isEmpty() {
    return this.ast.size === 0;
  }

  count() {
    return this.ast.size;
  }
}

class Fn extends MalTypes {
  constructor(fn, binds, funcBody, env, isMacro = false) {
    super();
    this.fn = fn;
    this.binds = binds;
    this.funcBody = funcBody;
    this.env = env;
    this.isMacro = isMacro;
  }

  pr_str(printReadably = false) {
    return '#<Function>';
  }

  apply(params) {
    return this.fn.apply(null, params);
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
    return this.str;
  }

  isEmpty() {
    return this.count === 0;
  }

  count() {
    return this.str.length;
  }

  first() {
    if (this.isEmpty() || this.str === Nil) {
      return Nil;
    }
    return this.str[0];
  }

  last() {
    if (this.isEmpty() || this.str === Nil) {
      return Nil;
    }
    return this.str[this.str.length - 1];
  }

  nth(n) {
    if (n >= this.str.length || n < 0) {
      throw `Index out of range: ${n}`;
    }
    return this.str[n];
  }

  equalTo(other) {
    if (!(other instanceof Str)) {
      return false;
    }
    return this.str === other.str;
  }

  reverse() {
    return new List(this.str.reverse());
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

  equalTo(other) {
    return other instanceof KeyWord ? this.keyword === other.keyword : false;
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

  equalTo(other) {
    return other instanceof MalSymbol ? this.symbol === other.symbol : false;
  }
}

class Atom extends MalTypes {
  constructor(malValue) {
    super();
    this.malValue = malValue;
  }

  pr_str(printReadably = false) {
    return `(atom ${this.malValue})`;
  }

  set(malValue) {
    return (this.malValue = malValue);
  }
}

class NilVal extends MalTypes {
  constructor() {
    super();
  }

  pr_str(printReadably = false) {
    return 'nil';
  }

  equalTo(other) {
    return other instanceof NilVal;
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
  Fn,
  Atom,
  MalSymbol,
  pr_str,
};
