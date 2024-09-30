WORK IN PROGRESS

# memsafe
> Memory-Safe Data Structures

## why
Sometimes I want to load a large dataset into memory, but don't have enough memory.  Saving checkpoints to disk would be a hassle, so it's easier to just try to keep it all in memory using run-length encoding.

## features
- MemSafeArray - memory-preserving array using internal run-length encoding
- MemSafeTable - dataframe where each element in the iterator is a row object (internally uses run-length encoding for each column)

## install
```
npm install memsafe
```
```html
<script src="https://unpkg.com/memsafe"></script>
// memsafe attached to window object
```

## usage
```js
import { MemSafeArray, MemSafeTable } from "memsafe";

const array = new MemSafeArray();
array.push(1);
array.push({ key: "value" });

console.log(array.length);
// 2

for (const value of array) {
  console.log(value);
}
// 1
// { key: "value" }


const table = new MemSafeTable({ column_names: ["id", "make", "model", "year"] });
table.push({ id: 123, make: "Chevrolet", model: "Malibu", "year": 2023 });

console.log(table.length);
// 1

for (const row of table) {
  console.log(row)
}
// { id: 123, make: "Chevrolet", model: "Malibu", "year": 2023 }

table.drop_column("year");
for (const row of table) {
  console.log(row)
}
// { id: 123, make: "Chevrolet", model: "Malibu" }

table.find(row => row.id === 123);
// { id: 123, make: "Chevrolet", model: "Malibu" }
```
