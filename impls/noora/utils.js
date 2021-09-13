const createMap = args => {
  if (args.length % 2 !== 0) {
    throw 'Map literal must contain an even number of forms';
  }

  const keys = args.filter((_, index) => index % 2 === 0);
  const duplicates = keys.filter((val, index) => keys.indexOf(val) != index);
  if (duplicates.length > 0) {
    throw `Duplicate key: ${duplicates[0]}`;
  }

  const map = new Map();
  for (let index = 0; index < args.length; index += 2) {
    map.set(args[index], args[index + 1]);
  }
  return map;
};

module.exports = { createMap };
