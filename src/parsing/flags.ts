import * as ts from "typescript";

const knownFlags = new Map([
    [ts.TypeFlags.Boolean, "boolean"],
    [ts.TypeFlags.BooleanLike, "boolean"],
    [ts.TypeFlags.BooleanLiteral, "boolean"],
    [ts.TypeFlags.Number, "float"],
    [ts.TypeFlags.NumberLike, "float"],
    [ts.TypeFlags.NumberLiteral, "float"],
    [ts.TypeFlags.String, "string"],
    [ts.TypeFlags.StringLike, "string"],
    [ts.TypeFlags.StringLiteral, "string"],
]);

export class TypeFlagsResolver {
    public resolve(flags: ts.TypeFlags): string | undefined {
        return knownFlags.get(flags);
    }
}
