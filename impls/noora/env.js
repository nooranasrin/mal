const { MalSymbol, List } = require('./types');

class Env {
  constructor(outer = null) {
    this.outer = outer;
    this.data = new Map();
  }

  static createEnv(outer, binds, exprs) {
    const env = new Env(outer);
    for (let [index, bind] of binds.entries()) {
      if (bind.symbol === '&') {
        const rest = exprs.slice(index);
        env.set(binds[index + 1], new List(rest));
        return env;
      }
      env.set(bind, exprs[index]);
    }
    return env;
  }

  set(key, value) {
    if (!(key instanceof MalSymbol)) {
      throw `${key} is not supported`;
    }
    this.data.set(key.symbol, value);
    return value;
  }

  find(key) {
    const value = this.data.get(key.symbol);
    if (value !== undefined) {
      return value;
    }
    return this.outer && this.outer.find(key);
  }

  get(key) {
    if (!(key instanceof MalSymbol)) {
      throw `${key.symbol} is not supported`;
    }

    const value = this.find(key);
    if (value === undefined) {
      throw `${key.symbol} not found`;
    }
    return value;
  }
}

module.exports = Env;
