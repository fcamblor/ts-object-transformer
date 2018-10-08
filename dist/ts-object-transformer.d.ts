declare type FieldMap<SRC> = {
    [ATTR in keyof SRC]?: (value: SRC[ATTR], obj?: SRC) => any;
};
declare type ComputedMap<SRC> = {
    [ATTR in keyof SRC]?: never;
} & {
    [ATTR: string]: (obj: SRC) => any;
};
declare type MappedReturnType<SRC, FM extends FieldMap<SRC> | undefined, CM extends ComputedMap<SRC> | undefined> = (CM extends ComputedMap<SRC> ? {
    [ATTR in keyof CM]: ReturnType<CM[ATTR]>;
} : unknown) & {
    [ATTR in keyof SRC]: ATTR extends keyof FM ? FM[ATTR] extends (value: SRC[ATTR], obj?: SRC) => infer R ? R : SRC[ATTR] : SRC[ATTR];
};
export declare function transformObject<SRC extends object, FM extends FieldMap<SRC> | undefined, CM extends ComputedMap<SRC> | undefined>(src: SRC, fieldMap?: FM, computedMap?: CM): MappedReturnType<SRC, FM, CM>;
export {};
