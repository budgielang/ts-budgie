import { CommandNames } from "general-language-syntax";
import { hasModifier } from "tsutils";
import * as ts from "typescript";

import { GlsLine } from "../../glsLine";
import { INodeAliaser, IPrivacyName, IRootAliaser } from "../../nodes/aliaser";
import { TypeFlagsResolver } from "../flags";
import { ArrayLiteralExpressionAliaser } from "./arrayLiteralExpressionAliaser";
import { NewExpressionAliaser } from "./newExpressionAliaser";
import { NumericAliaser } from "./numericAliaser";
import { TypeLiteralAliaser } from "./typeLiteralAliaser";
import { TypeNameAliaser } from "./typeNameAliaser";
import { VariableDeclarationAliaser } from "./variableDeclarationAliaser";

type INodeChildPasser = (node: ts.Node) => ts.Node;

const createChildGetter = (index = 0) => (node: ts.Node) => node.getChildren()[index];

interface IIntrinsicSignatureReturnType extends ts.Type {
    /**
     * @remarks This is private within TypeScript, and might change in the future.
     */
    intrinsicName: string;
}

export class RootAliaser implements IRootAliaser {
    private readonly flagResolver: TypeFlagsResolver;
    private readonly passThroughTypes: Map<ts.SyntaxKind, INodeChildPasser>;
    private readonly sourceFile: ts.SourceFile;
    private readonly typesWithKnownTypeNames: Map<ts.SyntaxKind, INodeAliaser>;
    private readonly typeChecker: ts.TypeChecker;

    public constructor(sourceFile: ts.SourceFile, typeChecker: ts.TypeChecker) {
        this.flagResolver = new TypeFlagsResolver();
        this.sourceFile = sourceFile;
        this.typeChecker = typeChecker;

        this.passThroughTypes = new Map<ts.SyntaxKind, INodeChildPasser>([
            [ts.SyntaxKind.ExpressionStatement, createChildGetter()],
            [ts.SyntaxKind.ParenthesizedExpression, createChildGetter()],
            [ts.SyntaxKind.ParenthesizedType, createChildGetter()],
            [ts.SyntaxKind.SyntaxList, createChildGetter()],
        ]);

        this.typesWithKnownTypeNames = new Map<ts.SyntaxKind, INodeAliaser>([
            [ts.SyntaxKind.ArrayLiteralExpression, new ArrayLiteralExpressionAliaser(typeChecker, this.getFriendlyTypeName)],
            [ts.SyntaxKind.BooleanKeyword, new TypeNameAliaser("boolean")],
            [ts.SyntaxKind.FalseKeyword, new TypeNameAliaser("boolean")],
            [ts.SyntaxKind.NewExpression, new NewExpressionAliaser(this.sourceFile)],
            [ts.SyntaxKind.NumberKeyword, new TypeNameAliaser("float")],
            [ts.SyntaxKind.NumericLiteral, new NumericAliaser()],
            [ts.SyntaxKind.TrueKeyword, new TypeNameAliaser("boolean")],
            [ts.SyntaxKind.TypeLiteral, new TypeLiteralAliaser(typeChecker, this.getFriendlyTypeName)],
            [ts.SyntaxKind.StringKeyword, new TypeNameAliaser("string")],
            [ts.SyntaxKind.StringLiteral, new TypeNameAliaser("string")],
            [ts.SyntaxKind.VariableDeclaration, new VariableDeclarationAliaser(typeChecker, this.getFriendlyTypeName)],
        ]);
    }

    public getFriendlyTypeName = (node: ts.Node): string | GlsLine | undefined => {
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

            if (ts.isVariableDeclaration(valueDeclaration)) {
                const initializer = valueDeclaration.initializer;

                if (initializer !== undefined) {
                    return this.getFriendlyTypeName(initializer);
                }
            }
        }

        // By now, this is probably a node with a non-primitive type, such as a class instance.

        if (ts.isParameter(node) || ts.isVariableDeclaration(node)) {
            if (node.type !== undefined) {
                return node.type.getText();
            }
        }

        if (ts.isTypeNode(node)) {
            return node.getText(this.sourceFile);
        }

        return undefined;
    }

    public getFriendlyPrivacyName(node: ts.Node): IPrivacyName {
        if (hasModifier(node.modifiers, ts.SyntaxKind.PrivateKeyword)) {
            return "private";
        }

        if (hasModifier(node.modifiers, ts.SyntaxKind.ProtectedKeyword)) {
            return "protected";
        }

        return "public";
    }

    public getFriendlyReturnTypeName(node: ts.ArrowFunction | ts.MethodDeclaration | ts.FunctionDeclaration): string | GlsLine | undefined {
        const typeAtLocation = this.typeChecker.getTypeAtLocation(node);
        const signaturesOfType = this.typeChecker.getSignaturesOfType(typeAtLocation, ts.SignatureKind.Call);
        if (signaturesOfType.length !== 1) {
            return undefined;
        }

        const signatureOfType = signaturesOfType[0];
        const signatureReturnType = signatureOfType.getReturnType();

        const symbol = signatureReturnType.getSymbol();
        if (symbol !== undefined) {
            return symbol.getName();
        }

        return (signatureReturnType as IIntrinsicSignatureReturnType).intrinsicName;
    }
}
