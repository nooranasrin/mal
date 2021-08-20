const { MalSymbol } = require('./types');

class Env {
  constructor(outer = null) {
    this.outer = outer;
    this.data = new Map();
  }

  static createEnv(outer, binds, exprs) {
    const env = new Env(outer);
    for (let [index, bind] of binds.entries()) {
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
    if (value) {
      return value;
    }
    return this.outer && this.outer.find(key);
  }

  get(key) {
    if (!(key instanceof MalSymbol)) {
      throw `${key.symbol} is not supported`;
    }

    const value = this.find(key);
    if (!value) {
      throw `${key.symbol} not found`;
    }
    return value;
  }
}

module.exports = Env;
