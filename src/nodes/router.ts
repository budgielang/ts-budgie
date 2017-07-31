import { Node, SourceFile, SyntaxKind, TypeChecker } from "typescript";

import { GlsLine } from "../glsLine";
import { RootAliaser } from "../parsing/aliasers/rootAliaser";
import { ITransformationsPrinter } from "../printing";
import { Transformation } from "../transformation";
import { VisitorContext } from "./context";
import { NodeVisitor } from "./visitor";
import { VisitorCreatorsBag } from "./visitorCreatorsBag";
import { INodeVisitorCreator, VisitorsBag } from "./visitorsBag";

export interface INodeVisitRouterDependencies {
    aliaser: RootAliaser;
    printer: ITransformationsPrinter;
    sourceFile: SourceFile;
    typeChecker: TypeChecker;
    visitorContext: VisitorContext;
    visitorCreatorsBag: VisitorCreatorsBag;
}

/**
 * Routes visitors for node types.
 */
export class NodeVisitRouter {
    /**
     * Dependencies used for initialization.
     */
    private readonly dependencies: INodeVisitRouterDependencies;

    /**
     * Lazily creates visitors for node types.
     */
    private readonly visitorsBag: VisitorsBag;

    /**
     * Initializes a new instance of the NodeVisitRouter.
     *
     * @param dependencies   Dependencies to be used for initialization.
     */
    public constructor(dependencies: INodeVisitRouterDependencies) {
        this.dependencies = dependencies;
        this.visitorsBag = new VisitorsBag({
            aliaser: dependencies.aliaser,
            router: this,
            sourceFile: dependencies.sourceFile,
            typeChecker: dependencies.typeChecker,
            visitorContext: dependencies.visitorContext,
        });
    }

    /**
     * Retrieves the output transformations for a node.
     *
     * @param node   Node to retrieve transformations for.
     * @returns Output transformations for the node.
     */
    public recurseIntoNode(node: Node): Transformation[] | undefined {
        const creator = this.dependencies.visitorCreatorsBag.getCreator(node.kind) as INodeVisitorCreator | undefined;
        if (creator === undefined) {
            return this.recurseIntoChildren(node);
        }

        return this.visitorsBag.createVisitor(creator).visit(node);
    }

    /**
     * Retrieves the GLS output for an inline value.
     *
     * @param node   Node to transform.
     * @returns Transformed GLS output for the inline value.
     */
    public recurseIntoValue(node: Node): string | GlsLine {
        const subTransformations = this.recurseIntoNode(node);
        if (subTransformations === undefined) {
            return "";
        }

        return this.dependencies.printer.printTransformations(subTransformations)[0];
    }

    /**
     * Retrieves the GLS output for a node.
     *
     * @param node   Node to transform.
     * @returns Transformed GLS output for the node.
     */
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

    /**
     * Recurses the GLS outputs for a node's children.
     *
     * @param node   Node to transform the children of.
     * @returns Transformed GLS output for the node's children.
     */
    public recurseIntoChildren(node: Node): Transformation[] {
        return this.recurseIntoNodes(node.getChildren());
    }
}
