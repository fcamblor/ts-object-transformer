import {transformObject} from './ts-object-transformer';

describe("ts-object-transformer", () => {
    it("json mappings", () => {
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
            { computed: (_, obj) => `${obj?`${obj.aString}__${obj.idempotentValue}`:''}` }
        );
        // Result type (NEW_TYPE) should be a map with its keys being the union of SRC keys and COMPUTED_MAP keys with following rules :
        // - If key exists only in SRC, then NEW_TYPE[key] = SRC[key]
        // - If key is a computed key (belonging to COMPUTED_MAP), then NEW_TYPE[key] = ResultType<COMPUTED_MAP[key]>
        // - Otherwise (key existing in FIELD_MAP), then NEW_TYPE[key] = ResultType<FIELD_MAP[key]>
        // In this example, expecting
        //   mappedResult = { date: Date.parse("2018-10-04T00:00:00+0200"), date2: new Date(1538604000000), aString: unescape("Hello%20World"), idempotentValue: "foo", computed: "Hello%20World__foo" }
        // ..  meaning that expected type would be { date: number, date2: Date, aString: string, idempotentValue: string, computed: string }

        let v1: number = transformedResult.date;
        expect(typeof v1).toEqual('number');
        let v2 = transformedResult.date2; // Date, expected
        expect(typeof v2).toEqual('object');
        expect(v2).toBeInstanceOf(Date);
        let v3 = transformedResult.aString; // string, expected
        expect(typeof v3).toEqual('string');
        let v4 = transformedResult.idempotentValue; // string, expected
        expect(typeof v4).toEqual('string');
        let v5 = transformedResult.computed; // string, expected
        expect(typeof v5).toEqual('string');

        // transformedResult.blah // doesn't compile, Property 'blah' doesn't exist on type
    });
});