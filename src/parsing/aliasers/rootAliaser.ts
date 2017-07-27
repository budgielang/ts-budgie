import { CommandNames } from "general-language-syntax";
import { IndexSignatureDeclaration, isIndexSignatureDeclaration, Node, SyntaxKind, TypeChecker, TypeLiteralNode } from "typescript";

import { GlsLine } from "../../glsLine";
import { INodeAliaser } from "../../nodes/aliaser";
import { TypeFlagsResolver } from "../flags";
import { ArrayLiteralExpressionAliaser } from "./arrayLiteralExpressionAliaser";
import { AutomaticAliaser } from "./automaticAliaser";
import { NumericAliaser } from "./numericAliaser";
import { TypeLiteralAliaser } from "./typeLiteralAliaser";
import { VariableDeclarationAliaser } from "./variableDeclarationAliaser";

type INodeChildPasser = (node: Node) => Node;

const createChildGetter = (index = 0) => (node: Node) => node.getChildren()[index];

export class RootAliaser implements INodeAliaser {
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

        // We use real type checker last because our checks can know the difference
        // between seemingly identical types, such as "float" or "int" within "number"
        const { flags } = this.typeChecker.getTypeAtLocation(node);
        const resolvedFlagType = this.flagResolver.resolve(flags);
        if (resolvedFlagType !== undefined) {
            return resolvedFlagType;
        }

        return "unknown";
    }
}
