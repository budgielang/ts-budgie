import { Node, SyntaxKind, TypeChecker } from "typescript";

export const getNodeTypeName = (node: Node, typeChecker: TypeChecker) =>
    (typeChecker.getTypeAtLocation(node) as any).intrinsicName;

export const getNumericTypeName = (usages: (number | string)[]): "int" | "float" => {
    for (const usage of usages) {
        if (typeof usage === "number") {
            if (usage % 1 !== 0) {
                return "float";
            }
        } else if (usage.indexOf(".") !== -1) {
            return "float";
        }
    }

    return "int";
};
