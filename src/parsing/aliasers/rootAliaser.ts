import { CommandNames } from "general-language-syntax";
import { hasModifier } from "tsutils";
import { isParameter, isVariableDeclaration, Modifier, Node, Symbol, SyntaxKind, TypeChecker } from "typescript";

import { GlsLine } from "../../glsLine";
import { INodeAliaser, IPrivacyName, IRootAliaser } from "../../nodes/aliaser";
import { TypeFlagsResolver } from "../flags";
import { ArrayLiteralExpressionAliaser } from "./arrayLiteralExpressionAliaser";
import { NumericAliaser } from "./numericAliaser";
import { TypeLiteralAliaser } from "./typeLiteralAliaser";
import { TypeNameAliaser } from "./typeNameAliaser";
import { VariableDeclarationAliaser } from "./variableDeclarationAliaser";

type INodeChildPasser = (node: Node) => Node;

const createChildGetter = (index = 0) => (node: Node) => node.getChildren()[index];

export class RootAliaser implements IRootAliaser {
    private readonly flagResolver: TypeFlagsResolver;
    private readonly passThroughTypes: Map<SyntaxKind, INodeChildPasser>;
    private readonly typesWithKnownTypeNames: Map<SyntaxKind, INodeAliaser>;
    private readonly typeChecker: TypeChecker;

    public constructor(typeChecker: TypeChecker) {
        this.flagResolver = new TypeFlagsResolver();
        this.typeChecker = typeChecker;

        this.passThroughTypes = new Map<SyntaxKind, INodeChildPasser>([
            [SyntaxKind.ExpressionStatement, createChildGetter()],
            [SyntaxKind.ParenthesizedExpression, createChildGetter()],
            [SyntaxKind.ParenthesizedType, createChildGetter()],
            [SyntaxKind.SyntaxList, createChildGetter()],
        ]);

        this.typesWithKnownTypeNames = new Map<SyntaxKind, INodeAliaser>([
            [SyntaxKind.ArrayLiteralExpression, new ArrayLiteralExpressionAliaser(typeChecker, this.getFriendlyTypeName)],
            [SyntaxKind.BooleanKeyword, new TypeNameAliaser("boolean")],
            [SyntaxKind.FalseKeyword, new TypeNameAliaser("boolean")],
            [SyntaxKind.NumberKeyword, new TypeNameAliaser("float")],
            [SyntaxKind.NumericLiteral, new NumericAliaser()],
            [SyntaxKind.TrueKeyword, new TypeNameAliaser("boolean")],
            [SyntaxKind.TypeLiteral, new TypeLiteralAliaser(typeChecker, this.getFriendlyTypeName)],
            [SyntaxKind.StringKeyword, new TypeNameAliaser("string")],
            [SyntaxKind.StringLiteral, new TypeNameAliaser("string")],
            [SyntaxKind.VariableDeclaration, new VariableDeclarationAliaser(typeChecker, this.getFriendlyTypeName)],
        ]);
    }

    public getFriendlyTypeName = (node: Node): string | GlsLine | undefined => {
        const knownTypeNameConverter = this.typesWithKnownTypeNames.get(node.kind);
        if (knownTypeNameConverter !== undefined) {
            return knownTypeNameConverter.getFriendlyTypeName(node);
        }

        const passThroughType = this.passThroughTypes.get(node.kind);
        if (passThroughType !== undefined) {
            return this.getFriendlyTypeName(passThroughType(node));
        }

        // We use the real type checker last because our checks can know the difference
        // between seemingly identical types, such as "float" or "int" within "number"
        const { flags } = this.typeChecker.getTypeAtLocation(node);
        const resolvedFlagType = this.flagResolver.resolve(flags);
        if (resolvedFlagType !== undefined) {
            return resolvedFlagType;
        }

        // TypeScript won't give up expression nodes' types, but if they have a type symbol
        // we can use it to find their value declaration
        const symbol = this.typeChecker.getSymbolAtLocation(node);
        if (symbol !== undefined && symbol.valueDeclaration !== undefined) {
            const valueDeclaration = symbol.valueDeclaration;

            if (isVariableDeclaration(valueDeclaration)) {
                const initializer = valueDeclaration.initializer;

                if (initializer !== undefined) {
                    return this.getFriendlyTypeName(initializer);
                }
            }
        }

        // By now, this is probably be a node with a non-primitive type, such as a class instance.
        if (isParameter(node) || isVariableDeclaration(node)) {
            if (node.type !== undefined) {
                return node.type.getText();
            }
        }

        return undefined;
    }

    public getFriendlyPrivacyName(node: Node): IPrivacyName {
        if (hasModifier(node.modifiers, SyntaxKind.PrivateKeyword)) {
            return "private";
        }

        if (hasModifier(node.modifiers, SyntaxKind.ProtectedKeyword)) {
            return "protected";
        }

        return "public";
    }
}
