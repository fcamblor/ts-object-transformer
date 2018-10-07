# ts-object-transformer [![Build Status](https://travis-ci.org/fcamblor/ts-object-transformer.svg?branch=master)](https://travis-ci.org/fcamblor/ts-object-transformer)

> Typescript Type-safe object transformation

Useful for JSON mappings with complex JS/TS types (Date, Regex etc.)

## Install

```
$ npm install ts-object-transformer
```

## API

```ts
transformObject(
    // Standard plain object literal coming, most of the time from serverside, 
    // generally described by an interface
    objectLiteral,
    // Applying some mapping aimed at converting input values above and change their type representation
    // Rules are :
    // - Keys should be a subset of objectLiteral's keys; Omitting key will not make any field transformation.
    // - Values should be a function taking objectLiteral[key] and returning a transformed value
    // If you're not following these rules, there will be a compilation error
    fieldMappings?,
    // Aimed at generating new "computed" properties
    // Rules are :
    // - Keys *cannot* be one of objectLiteral's keys
    // - Values should be a function taking objectLiteral[key] and returning a tranformed value
    // If you're not following these rules, there will be a compilation error
    computedMappings?
);
// Returns a result having :
// - Same keys than objectLiteral
// - Types of these keys potentially translated using fieldMappings' transformations return types
// - New keys corresponding to computedMappings' keys & transformations return types
```

## Usage

```ts
import {transformObject} from 'ts-object-transformer';

let transformedResult = transformObject(
    { date: "2018-10-04T00:00:00+0200", date2: 1538604000000, aString: "Hello%20World", idempotentValue: "foo" },
    { date: Date.parse, date2: (ts: number) => new Date(ts), aString: unescape },
    { computed: (obj) => `${obj?`${obj.aString}__${obj.idempotentValue}`:''}` }
);

// Doesn't compile : Argument of type "blah" doesn't exist on type
// let blah = transformedResult.blah;

// Doesn't compile : "type 'Date' is not assignable to type 'number'"
// Proves that date2 has been converted to Date
// let num: number = transformedResult.date2;

console.log(transformedResult.date); // 1538604000000
console.log(transformedResult.date2); // 2018-10-03T22:00:00.000Z (new Date(1538604000000))
console.log(transformedResult.aString); // Hello world
console.log(transformedResult.idempotentValue); // foo
console.log(transformedResult.computed); // Hello%20World__foo
```

You can omit either fieldMappings or computedMappings (or both, but it's useless :-) :

```ts
let transformedResult2 = transformObject(
    { date: "2018-10-04T00:00:00+0200", date2: 1538604000000, aString: "Hello%20World", idempotentValue: "foo" },
    { date: Date.parse, date2: (ts: number) => new Date(ts), aString: unescape }
);

console.log(transformedResult2.date); // 1538604000000
console.log(transformedResult2.date2); // 2018-10-03T22:00:00.000Z (new Date(1538604000000))
console.log(transformedResult2.aString); // Hello world
console.log(transformedResult2.idempotentValue); // foo

let transformedResult3 = transformObject(
    { date: "2018-10-04T00:00:00+0200", date2: 1538604000000, aString: "Hello%20World", idempotentValue: "foo" },
    undefined,
    { computed: (obj) => `${obj?`${obj.aString}__${obj.idempotentValue}`:''}` }
);
console.log(transformedResult3.date); // 2018-10-04T00:00:00+0200
console.log(transformedResult3.date2); // 1538604000000
console.log(transformedResult3.aString); // Hello%20world
console.log(transformedResult3.idempotentValue); // foo
console.log(transformedResult3.computed); // Hello%20World__foo
```

## License

MIT