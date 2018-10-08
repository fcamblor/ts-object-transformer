"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function transformObject(src, fieldMap, computedMap) {
    let result = {};
    for (let key in src) {
        let value = src[key];
        if (fieldMap && srcKeyExistsIn(fieldMap, key)) {
            let transformer = fieldMap[key];
            result[key] = transformer(value, src);
        }
        else {
            result[key] = value;
        }
    }
    if (computedMap) {
        for (let key in computedMap) {
            let transformer = computedMap[key];
            result[key] = transformer(src);
            return result;
        }
    }
    return result;
}
exports.transformObject = transformObject;
function srcKeyExistsIn(fieldMap, key) {
    return !!fieldMap[key];
}
