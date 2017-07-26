import { Node, SourceFile, SyntaxKind, TypeChecker } from "typescript";

import { GlsLine } from "../glsLine";
import { printTransformations } from "../printing";
import { Transformation } from "../transformation";
import { NodeVisitor } from "./visitor";
import { VisitorCreatorsBag } from "./visitorCreatorsBag";
import { INodeVisitorCreator, VisitorsBag } from "./visitorsBag";

const finalTextNodes = new Set<SyntaxKind>([
    SyntaxKind.FalseKeyword,
    SyntaxKind.TrueKeyword,
    SyntaxKind.FirstLiteralToken,
    SyntaxKind.Identifier,
    SyntaxKind.NumericLiteral,
    SyntaxKind.StringLiteral,
]);

export class NodeVisitRouter {
    private readonly sourceFile: SourceFile;
    private readonly typeChecker: TypeChecker;
    private readonly visitorCreatorsBag: VisitorCreatorsBag;
    private readonly visitorsBag: VisitorsBag;

    public constructor(sourceFile: SourceFile, typeChecker: TypeChecker, visitorCreatorsBag: VisitorCreatorsBag) {
        this.sourceFile = sourceFile;
        this.typeChecker = typeChecker;
        this.visitorCreatorsBag = visitorCreatorsBag;
        this.visitorsBag = new VisitorsBag(this, sourceFile, typeChecker);
    }

    public recurseIntoValue(node: Node): string | GlsLine {
        if (finalTextNodes.has(node.kind)) {
            return node.getText(this.sourceFile);
        }

        const subTransformations = this.recurseIntoNode(node);
        if (subTransformations === undefined) {
            return "";
        }

        return printTransformations(subTransformations)[0];
    }

    public recurseIntoNode(node: Node): Transformation[] | undefined {
        const creator = this.visitorCreatorsBag.getCreator(node.kind) as INodeVisitorCreator | undefined;
        if (creator === undefined) {
            return this.recurseIntoChildren(node);
        }

        return this.visitorsBag.createVisitor(creator).visit(node);
    }

    public recurseIntoNodes(nodes: Node[]): Transformation[] {
        const transformations: Transformation[] = [];

        for (const child of nodes) {
            const childTransformations = this.recurseIntoNode(child);

            if (childTransformations !== undefined) {
                transformations.push(...childTransformations);
            }
        }

        return transformations;
    }

    public recurseIntoChildren(node: Node): Transformation[] {
        return this.recurseIntoNodes(node.getChildren());
    }
}
