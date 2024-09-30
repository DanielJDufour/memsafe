class MemSafeArray {
  length;

  constructor(arrayLength = 0) {
    if (arrayLength !== 0) throw new Error("currently only supporting initialization of empty arrays");
    this.length = arrayLength || 0;
    this._data = [];
  }

  map(callbackFn, thisArg) {
    const result = new MemSafeArray();
    const iter = this[Symbol.iterator];
    if (thisArg) callbackFn = callbackFn.bind(thisArg);
    for (let i = 0; i < this.length; i++) {
      result.push(callbackFn(iter.next().value, i, this));
    }
    return result;
  }

  push(item) {
    if (this._data.length === 0 || item !== this._data[this._data.length - 1]) {
      this._data.push(1);
      this._data.push(item);
    } else {
      this._data[this._data.length - 2]++;
      this.length++;
      return this.length;
    }

    this.length++;

    return this.length;
  }

  // name of function should be "values"
  [Symbol.iterator]() {
    let i = -2;
    let remainder = 0;
    const _this = this;
    return {
      next: function next() {
        if (remainder === 0) {
          if (i === _this._data.length - 2) {
            return { done: true };
          }

          i += 2;
          remainder = _this._data[i];
        }

        remainder--;

        return { value: _this._data[i + 1], done: false };
      }
    };
  }
}

class MemSafeTable {
  constructor(options) {
    this._column_names = options.column_names;
    this._columns = this._column_names.map(name => [name, new MemSafeArray()]);
    this.length = 0;
  }

  drop_column(column_name) {
    if (this._column_names.indexOf(column_name)) throw new Error("[memsafe] can't drop column that doesn't exist!");
    this._column_names = this._column_names.filter(name => name !== column_name);
    this._columns = this._columns.filter(col => col[0] !== column_name);
  }

  find(callbackFn, thisArg) {
    if (thisArg !== undefined) throw new Error("unsupported thisArg");
    let i = -1;
    for (const row of this) {
      i++;
      if (callbackFn(row, i, thisArg || this) === true) {
        return row;
      }
    }
  }

  push(row) {
    // to-do add support for dynamically adding new column

    // iterate over all the columns
    for (let i = 0; i < this._columns.length; i++) {
      const [name, values] = this._columns[i];
      values.push(row[name]);
    }

    this.length++;
  }

  add_column() {
    // to-do add support for dynamically adding new column after construction
    throw Exception("not implemented");
  }

  [Symbol.iterator]() {
    let i = -1;
    const iters = this._columns.map(([name, values]) => [name, values[Symbol.iterator]()]);
    const _this = this;
    return {
      next: function () {
        i++;

        if (i === _this.length) {
          return { done: true };
        }

        return {
          done: false,
          value: Object.fromEntries(iters.map(([name, iter]) => [name, iter.next().value]))
        };
      }
    };
  }
}

if (typeof define === "function" && define.amd) {
  define(function () {
    return { MemSafeArray, MemSafeTable };
  });
}

if (typeof module === "object") {
  module.exports = { MemSafeArray, MemSafeTable };
}

if (typeof self === "object") {
  self.memsafe = { MemSafeArray, MemSafeTable };
}

if (typeof window === "object") {
  window.memsafe = { MemSafeArray, MemSafeTable };
}
