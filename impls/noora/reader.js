const { CommentError } = require('./errors');
const {
  Nil,
  List,
  Vector,
  Str,
  HashMap,
  KeyWord,
  MalSymbol,
} = require('./types');
const { createMap } = require('./utils');

class READER {
  constructor(tokens) {
    this.tokens = tokens;
    this.position = 0;
  }

  peek() {
    return this.tokens[this.position];
  }

  next() {
    const token = this.peek();
    if (this.position < this.tokens.length) {
      this.position++;
    }
    return token;
  }
}

const tokenize = str => {
  const regexp =
    /[\s,]*(~@|[\[\]{}()'`~^@]|"(?:\\.|[^\\"])*"?|;.*|[^\s\[\]{}('"`,;)]*)/g;

  const matches = [...str.matchAll(regexp)];

  const tokens = matches.reduce((tokens, value) => {
    if (!value[1].startsWith(';')) {
      tokens.push(value[1]);
    }
    return tokens;
  }, []);

  return tokens.slice(0, -1);
};

const read_atom = reader => {
  const token = reader.next();

  if (token.match(/^-?[0-9]+$/)) {
    return parseInt(token);
  }
  if (token.match(/^-?[0-9][0-9.]*$/)) {
    return parseFloat(token);
  }
  if (token.match(/^"(?:\\.|[^\\"])*"$/)) {
    const str = token
      .slice(1, -1)
      .replace(/\\(.)/g, (_, match) => (match === 'n' ? '\n' : match));
    return new Str(str);
  }
  if (token === 'true') {
    return true;
  }
  if (token === 'false') {
    return false;
  }
  if (token === 'nil') {
    return Nil;
  }
  if (token.startsWith(':')) {
    return new KeyWord(token.slice(1));
  }
  if (token.startsWith('"')) {
    throw `unbalanced "`;
  }

  return new MalSymbol(token);
};

const read_seq = (reader, closingSymbol) => {
  const ast = [];
  reader.next();

  while (reader.peek() !== closingSymbol) {
    if (reader.peek() === undefined) {
      throw `unbalanced ${closingSymbol}`;
    }
    ast.push(read_form(reader));
  }

  reader.next();
  return ast;
};

const read_list = reader => {
  const ast = read_seq(reader, ')');
  return new List(ast);
};

const read_vector = reader => {
  const ast = read_seq(reader, ']');
  return new Vector(ast);
};

const read_hashmap = reader => {
  const ast = read_seq(reader, '}');
  return new HashMap(createMap(ast));
};

const prependSymbol = (reader, symbol) => {
  reader.next();
  const ast = read_form(reader);
  const malSymbol = new MalSymbol(symbol);
  return new List([malSymbol, ast]);
};

const read_deref = reader => prependSymbol(reader, 'deref');
const read_quote = reader => prependSymbol(reader, 'quote');
const read_quasiquote = reader => prependSymbol(reader, 'quasiquote');
const read_unquote = reader => prependSymbol(reader, 'unquote');
const read_splice_unquote = reader => prependSymbol(reader, 'splice-unquote');

const read_form = reader => {
  const token = reader.peek();

  switch (token) {
    case '(':
      return read_list(reader);
    case '[':
      return read_vector(reader);
    case '{':
      return read_hashmap(reader);
    case '@':
      return read_deref(reader);
    case "'":
      return read_quote(reader);
    case '~@':
      return read_splice_unquote(reader);
    case '~':
      return read_unquote(reader);
    case '`':
      return read_quasiquote(reader);
    case ')':
      throw 'unbalanced )';
    case ']':
      throw 'unbalanced ]';
    case '}':
      throw 'unbalanced }';
  }

  return read_atom(reader);
};

const read_str = str => {
  const tokens = tokenize(str);
  if (tokens.length === 0) {
    throw new CommentError();
  }
  const reader = new READER(tokens);
  return read_form(reader);
};

module.exports = { read_str };
