import {transformObject} from './ts-object-transformer';
import {keys} from 'lodash';

describe("ts-object-transformer", () => {
    it("object transformation", () => {
        let transformedResult = transformObject(
            // Standard plain object literal coming, most of the time from serverside, generally described by an interface
            // Let's call this type SRC
            { date: "2018-10-04T00:00:00+0200", date2: 1538604000000, aString: "Hello%20World", idempotentValue: "foo" },
            // Applying some mapping aimed at converting input values above and change their type representation
            // Rules are :
            // - Keys should be a subset of SRC's keys
            // - Values should be function taking SRC[key] and returning a new type NEW_TYPE[key] we want to capture in
            // order to reference it in transformObject()'s result type
            // Let's call this type FIELD_MAP
            { date: Date.parse, date2: (ts: number) => new Date(ts), aString: unescape },
            // Generating new "computed" properties
            // Rules are :
            // - Keys cannot be one of SRC key
            // - Values should be function taking SRC[key] and returning a new type NEW_TYPE[key] we want to capture in
            // order to reference it in transformObject()'s result type
            // Let's call this type COMPUTED_MAP
            { computed: (obj) => `${obj?`${obj.aString}__${obj.idempotentValue}`:''}` }
        );
        // Result type (NEW_TYPE) should be a map with its keys being the union of SRC keys and COMPUTED_MAP keys with following rules :
        // - If key exists only in SRC, then NEW_TYPE[key] = SRC[key]
        // - If key is a computed key (belonging to COMPUTED_MAP), then NEW_TYPE[key] = ResultType<COMPUTED_MAP[key]>
        // - Otherwise (key existing in FIELD_MAP), then NEW_TYPE[key] = ResultType<FIELD_MAP[key]>
        // In this example, expecting
        //   mappedResult = { date: Date.parse("2018-10-04T00:00:00+0200"), date2: new Date(1538604000000), aString: unescape("Hello%20World"), idempotentValue: "foo", computed: "Hello%20World__foo" }
        // ..  meaning that expected type would be { date: number, date2: Date, aString: string, idempotentValue: string, computed: string }

        expect(keys(transformedResult)).toEqual(['date', 'date2', 'aString', 'idempotentValue', 'computed']);

        let v1: number = transformedResult.date; // number, expected
        expect(typeof v1).toEqual('number');
        expect(v1).toEqual(1538604000000);
        let v2: Date = transformedResult.date2; // Date, expected
        expect(typeof v2).toEqual('object');
        expect(v2).toBeInstanceOf(Date);
        expect(v2.getTime()).toEqual(1538604000000);
        let v3: string = transformedResult.aString; // string, expected
        expect(typeof v3).toEqual('string');
        expect(v3).toEqual('Hello World');
        let v4: string = transformedResult.idempotentValue; // string, expected
        expect(typeof v4).toEqual('string');
        expect(v4).toEqual('foo');
        let v5: string = transformedResult.computed; // string, expected
        expect(typeof v5).toEqual('string');
        expect(v5).toEqual('Hello%20World__foo');

        // transformedResult.blah // doesn't compile, Property 'blah' doesn't exist on type
    });

    it("object transformation with no computed values", () => {
        let transformedResult = transformObject(
            { date: "2018-10-04T00:00:00+0200", date2: 1538604000000, aString: "Hello%20World", idempotentValue: "foo" },
            { date: Date.parse, date2: (ts: number) => new Date(ts), aString: unescape }
        );

        expect(keys(transformedResult)).toEqual(['date', 'date2', 'aString', 'idempotentValue']);

        let v1: number = transformedResult.date; // number, expected
        expect(typeof v1).toEqual('number');
        expect(v1).toEqual(1538604000000);
        let v2: Date = transformedResult.date2; // Date, expected
        expect(typeof v2).toEqual('object');
        expect(v2).toBeInstanceOf(Date);
        expect(v2.getTime()).toEqual(1538604000000);
        let v3: string = transformedResult.aString; // string, expected
        expect(typeof v3).toEqual('string');
        expect(v3).toEqual('Hello World');
        let v4: string = transformedResult.idempotentValue; // string, expected
        expect(typeof v4).toEqual('string');
        expect(v4).toEqual('foo');
        // let v5: string = transformedResult.computed; // doesn't compile, property 'computed' doesn't exist on type
    });

    function jsonMappingsWithFieldMappings(fieldMapping: {}|undefined) {
        let transformedResult = transformObject(
            { date: "2018-10-04T00:00:00+0200", date2: 1538604000000, aString: "Hello%20World", idempotentValue: "foo" },
            fieldMapping,
            { computed: (obj) => `${obj?`${obj.aString}__${obj.idempotentValue}`:''}` }
        );

        expect(keys(transformedResult)).toEqual(['date', 'date2', 'aString', 'idempotentValue', 'computed']);

        let v1: string = transformedResult.date; // string expected
        expect(typeof v1).toEqual('string');
        expect(v1).toEqual('2018-10-04T00:00:00+0200');
        let v2: number = transformedResult.date2; // number, expected
        expect(typeof v2).toEqual('number');
        expect(v2).toEqual(1538604000000);
        let v3: string = transformedResult.aString; // string, expected
        expect(typeof v3).toEqual('string');
        expect(v3).toEqual('Hello%20World');
        let v4: string = transformedResult.idempotentValue; // string, expected
        expect(typeof v4).toEqual('string');
        expect(v4).toEqual('foo');
        let v5: string = transformedResult.computed; // string, expected
        expect(typeof v5).toEqual('string');
        expect(v5).toEqual('Hello%20World__foo');
    }
    it("object transformation with no field mappings", () => {
        jsonMappingsWithFieldMappings({});
    });

    it("object transformation with undefined field mappings", () => {
        jsonMappingsWithFieldMappings(undefined);
    });

    it("idempotent transformation", () => {
        let transformedResult = transformObject(
            { date: "2018-10-04T00:00:00+0200", date2: 1538604000000, aString: "Hello%20World", idempotentValue: "foo" }
        );

        expect(keys(transformedResult)).toEqual(['date', 'date2', 'aString', 'idempotentValue']);

        let v1: string = transformedResult.date; // string expected
        expect(typeof v1).toEqual('string');
        expect(v1).toEqual('2018-10-04T00:00:00+0200');
        let v2: number = transformedResult.date2; // number, expected
        expect(typeof v2).toEqual('number');
        expect(v2).toEqual(1538604000000);
        let v3: string = transformedResult.aString; // string, expected
        expect(typeof v3).toEqual('string');
        expect(v3).toEqual('Hello%20World');
        let v4: string = transformedResult.idempotentValue; // string, expected
        expect(typeof v4).toEqual('string');
        expect(v4).toEqual('foo');
        // let v5: string = transformedResult.computed; // doesn't compile, property 'computed' doesn't exist on type
    });

    it('Readme examples', () => {
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
    });
});