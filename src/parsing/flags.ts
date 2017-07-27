import { TypeFlags } from "typescript";

const knownFlags = new Map([
    [TypeFlags.Boolean, "boolean"],
    [TypeFlags.BooleanLike, "boolean"],
    [TypeFlags.BooleanLiteral, "boolean"],
    [TypeFlags.Number, "float"],
    [TypeFlags.NumberLike, "float"],
    [TypeFlags.NumberLiteral, "float"],
    [TypeFlags.String, "string"],
    [TypeFlags.StringLike, "string"],
    [TypeFlags.StringLiteral, "string"],
]);

export class TypeFlagsResolver {
    public resolve(flags: TypeFlags): string | undefined {
        return knownFlags.get(flags);
    }
}
