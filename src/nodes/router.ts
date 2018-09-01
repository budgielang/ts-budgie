import { CaseStyleConverterBag, NameSplitter } from "general-language-syntax";
import * as tsutils from "tsutils";
import * as ts from "typescript";

import { GlsLine } from "../output/glsLine";
import { Transformation } from "../output/transformation";
import { RootAliaser } from "../parsing/aliasers/rootAliaser";
import { TransformationsPrinter } from "../printing/transformationsPrinter";
import { VisitorContext } from "./context";
import { VisitorCreatorsBag } from "./visitorCreatorsBag";
import { INodeVisitorCreator, VisitorsBag } from "./visitorsBag";

export interface INodeVisitRouterDependencies {
    aliaser: RootAliaser;
    casing: CaseStyleConverterBag;
    printer: TransformationsPrinter;
    nameSplitter: NameSplitter;
    sourceFile: ts.SourceFile;
    typeChecker: ts.TypeChecker;
    variableUsage: Map<ts.Identifier, tsutils.VariableInfo>;
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
            casing: dependencies.casing,
            nameSplitter: dependencies.nameSplitter,
            router: this,
            sourceFile: dependencies.sourceFile,
            typeChecker: dependencies.typeChecker,
            variableUsage: dependencies.variableUsage,
            visitorContext: dependencies.visitorContext,
        });
    }

    /**
     * Retrieves the output transformations for a node.
     *
     * @param node   Node to retrieve transformations for.
     * @returns Output transformations for the node.
     */
    public recurseIntoNode(node: ts.Node): Transformation[] {
        const creator = this.dependencies.visitorCreatorsBag.getCreator(node.kind) as INodeVisitorCreator | undefined;
        if (creator === undefined) {
            return this.recurseIntoNodes(node.getChildren());
        }

        return this.visitorsBag.createVisitor(creator).visit(node);
    }

    /**
     * Retrieves the GLS output for a set of nodes.
     *
     * @param node   Node to transform.
     * @param parent   Common parent of the nodes.
     * @returns Transformed GLS output for the nodes.
     */
    public recurseIntoNodes(nodes: ReadonlyArray<ts.Node>): Transformation[] {
        const transformations: Transformation[] = [];

        for (const node of nodes) {
            transformations.push(...this.recurseIntoNode(node));
        }

        return transformations;
    }

    /**
     * Retrieves the GLS output for an inline value.
     *
     * @param node   Node to transform.
     * @returns Transformed GLS output for the inline value.
     */
    public recurseIntoValue(node: ts.Node): string | GlsLine {
        const subTransformations = this.recurseIntoNode(node);
        const { sourceFile } = this.dependencies;

        return this.dependencies.printer.printTransformations(sourceFile.getText(sourceFile), subTransformations)[0];
    }

    /**
     * Retrieves the GLS output for a set of inline values.
     *
     * @param nodes   Nodes to transform.
     * @returns Transformed GLS output for the inline values.
     */
    public recurseIntoValues(nodes: ts.NodeArray<ts.Node>): (string | GlsLine)[] {
        const values: (string | GlsLine)[] = [];

        for (const node of nodes) {
            values.push(this.recurseIntoValue(node));
        }

        return values;
    }
}
