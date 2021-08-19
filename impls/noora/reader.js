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
  if (ast.length % 2 !== 0) {
    throw 'Map literal must contain an even number of forms';
  }

  const keys = ast.filter((_, index) => index % 2 === 0);
  const duplicates = keys.filter((val, index) => keys.indexOf(val) != index);
  if (duplicates.length > 0) {
    throw `Duplicate key: ${duplicates[0]}`;
  }

  const map = new Map();
  for (let index = 0; index < ast.length; index += 2) {
    map.set(ast[index], ast[index + 1]);
  }
  return new HashMap(map);
};

const read_form = reader => {
  const token = reader.peek();

  switch (token[0]) {
    case '(':
      return read_list(reader);
    case '[':
      return read_vector(reader);
    case '{':
      return read_hashmap(reader);
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
