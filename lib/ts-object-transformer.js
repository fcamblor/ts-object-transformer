"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = require("lodash");
function transformObject(src, fieldMap, computedMap) {
    let result = {};
    lodash_1.each(lodash_1.keys(src), (key) => {
        let value = src[key];
        if (fieldMap && keyOfSrc(fieldMap, key)) {
            let transformer = fieldMap[key];
            result[key] = transformer(value, src);
        }
        else {
            result[key] = value;
        }
    });
    if (computedMap) {
        lodash_1.each(lodash_1.keys(computedMap), (key) => {
            let transformer = computedMap[key];
            result[key] = transformer(src);
            return result;
        });
    }
    return result;
}
exports.transformObject = transformObject;
function keyOfSrc(fieldMap, key) {
    return lodash_1.has(fieldMap, key);
}
function keyOfComputedMap(computedMap, key) {
    return lodash_1.has(computedMap, key);
}
