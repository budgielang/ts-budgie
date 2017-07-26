import { Node, SourceFile, SyntaxKind, TypeChecker } from "typescript";

import { GlsLine } from "../glsLine";
import { printTransformations } from "../printing";
import { Transformation } from "../transformation";
import { VisitorContext } from "./context";
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

export interface INodeVisitRouterDependencies {
    sourceFile: SourceFile;
    typeChecker: TypeChecker;
    visitorContext: VisitorContext;
    visitorCreatorsBag: VisitorCreatorsBag;
}

export class NodeVisitRouter {
    private readonly dependencies: INodeVisitRouterDependencies;
    private readonly visitorsBag: VisitorsBag;

    public constructor(dependencies: INodeVisitRouterDependencies) {
        this.dependencies = dependencies;
        this.visitorsBag = new VisitorsBag({
            router: this,
            sourceFile: dependencies.sourceFile,
            typeChecker: dependencies.typeChecker,
            visitorContext: dependencies.visitorContext,
        });
    }

    public recurseIntoValue(node: Node): string | GlsLine {
        if (finalTextNodes.has(node.kind)) {
            return node.getText(this.dependencies.sourceFile);
        }

        const subTransformations = this.recurseIntoNode(node);
        if (subTransformations === undefined) {
            return "";
        }

        return printTransformations(subTransformations)[0];
    }

    public recurseIntoNode(node: Node): Transformation[] | undefined {
        const creator = this.dependencies.visitorCreatorsBag.getCreator(node.kind) as INodeVisitorCreator | undefined;
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
