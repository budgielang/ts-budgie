import { CommandNames } from "general-language-syntax";
import { IndexSignatureDeclaration, isIndexSignatureDeclaration, Node, SyntaxKind, TypeChecker, TypeLiteralNode } from "typescript";

import { GlsLine } from "../../glsLine";
import { INodeAliaser } from "../../nodes/aliaser";
import { ArrayLiteralExpressionAliaser } from "./arrayLiteralExpressionAliaser";
import { AutomaticAliaser } from "./automaticAliaser";
import { NumericAliaser } from "./numericAliaser";
import { TypeLiteralAliaser } from "./typeLiteralAliaser";
import { VariableDeclarationAliaser } from "./variableDeclarationAliaser";

type INodeChildPasser = (node: Node) => Node;

const createChildGetter = (index = 0) => (node: Node) => node.getChildren()[index];

// todo: allow for hints from node initializer
export class RootAliaser implements INodeAliaser {
    private readonly passThroughTypes: Map<SyntaxKind, INodeChildPasser>;

    private readonly typesWithKnownTypeNames: Map<SyntaxKind, INodeAliaser>;

    private readonly typeChecker: TypeChecker;

    public constructor(typeChecker: TypeChecker) {
        this.typeChecker = typeChecker;

        this.passThroughTypes = new Map<SyntaxKind, INodeChildPasser>([
            [SyntaxKind.ExpressionStatement, createChildGetter()],
            [SyntaxKind.ParenthesizedExpression, createChildGetter()],
            [SyntaxKind.ParenthesizedType, createChildGetter()],
            [SyntaxKind.SyntaxList, createChildGetter()],
        ]);

        this.typesWithKnownTypeNames = new Map<SyntaxKind, INodeAliaser>([
            [SyntaxKind.ArrayLiteralExpression, new ArrayLiteralExpressionAliaser(typeChecker, this.getFriendlyTypeNameForNode)],
            [SyntaxKind.BooleanKeyword, new AutomaticAliaser("boolean")],
            [SyntaxKind.FalseKeyword, new AutomaticAliaser("boolean")],
            [SyntaxKind.NumberKeyword, new AutomaticAliaser("float")],
            [SyntaxKind.NumericLiteral, new NumericAliaser()],
            [SyntaxKind.TrueKeyword, new AutomaticAliaser("boolean")],
            [SyntaxKind.TypeLiteral, new TypeLiteralAliaser(typeChecker, this.getFriendlyTypeNameForNode)],
            [SyntaxKind.StringKeyword, new AutomaticAliaser("string")],
            [SyntaxKind.StringLiteral, new AutomaticAliaser("string")],
            [SyntaxKind.VariableDeclaration, new VariableDeclarationAliaser(typeChecker, this.getFriendlyTypeNameForNode)],
        ]);
    }

    public getFriendlyTypeNameForNode = (node: Node): string | GlsLine => {
        const knownTypeNameConverter = this.typesWithKnownTypeNames.get(node.kind);
        if (knownTypeNameConverter !== undefined) {
            return knownTypeNameConverter.getFriendlyTypeNameForNode(node);
        }

        const passThroughType = this.passThroughTypes.get(node.kind);
        if (passThroughType !== undefined) {
            return this.getFriendlyTypeNameForNode(passThroughType(node));
        }

        return "unknown";
    }
}
