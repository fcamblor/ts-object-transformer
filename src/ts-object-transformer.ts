import {reduce, has, get} from "lodash";


// Thanks to Titian Cernicova-Dragomir https://stackoverflow.com/a/52641402/476345
// and Matt McCutchen https://stackoverflow.com/a/52683426/476345
type FieldMap<SRC> = {
    [ATTR in keyof SRC]?: (value: SRC[ATTR], obj?: SRC) => any
};
type ComputedMap<SRC> = {
    [ATTR in keyof SRC]?: never
} & {
    [ATTR: string]: (value: undefined, obj: SRC) => any
};
type MappedReturnType<SRC, FM extends FieldMap<SRC>, CM extends ComputedMap<SRC>> = {
    [ATTR in keyof CM]: ReturnType<CM[ATTR]>
} & {
    [ATTR in keyof SRC]: ATTR extends keyof FM
        ? FM[ATTR] extends (value: SRC[ATTR], obj?: SRC) => infer R ? R : SRC[ATTR]
        : SRC[ATTR]
}

export function transformObject<
    SRC extends object, FM extends FieldMap<SRC>, CM extends ComputedMap<SRC>
>(src: SRC, fieldMap: FM, computedMap: CM): MappedReturnType<SRC, FM, CM> {
    let result = reduce(src, (result: any, value: any, key: string) => {
        if(fieldMap && keyOfSrc<SRC, FM, CM>(fieldMap, key)) {
            let transformer = <(value: any, obj?: SRC) => any>fieldMap[key];
            result[key] = transformer(value, src);
        } else {
            result[key] = value;
        }
        return result;
    }, <any>{});

    if(computedMap) {
        result = reduce(computedMap, (result: any, value: any, key: keyof CM) => {
            let transformer = <(value: undefined, obj: SRC) => any>computedMap[key];
            result[key] = transformer(value, src);
            return result;
        }, result);
    }

    return result;
}

function keyOfSrc<SRC extends object, FM extends FieldMap<SRC>, CM extends ComputedMap<SRC>>(fieldMap: FM|undefined, key: (keyof SRC | keyof CM)): key is keyof SRC {
    return has(fieldMap, key);
}

function keyOfComputedMap<SRC extends object, FM extends FieldMap<SRC>, CM extends ComputedMap<SRC>>(computedMap: CM|undefined, key: (keyof SRC | keyof CM)): key is keyof CM {
    return has(computedMap, key);
}