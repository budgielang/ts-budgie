import { CaseStyleConverterBag, NameSplitter } from "general-language-syntax";
import * as tsutils from "tsutils";
import * as ts from "typescript";

import { UnsupportedComplaint } from "../output/complaint";
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
    public recurseIntoNode(node: ts.Node): Transformation[] | UnsupportedComplaint {
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
    public recurseIntoValue(node: ts.Node): string | GlsLine | UnsupportedComplaint {
        const subTransformations = this.recurseIntoNode(node);
        if (subTransformations instanceof UnsupportedComplaint) {
            return subTransformations;
        }

        const { sourceFile } = this.dependencies;
        return this.dependencies.printer.printTransformations(sourceFile.getText(sourceFile), subTransformations)[0];
    }

    /**
     * Retrieves the GLS output for a set of nodes.
     *
     * @param node   Node to transform.
     * @param parent   Common parent of the nodes.
     * @returns Transformed GLS output for the nodes.
     */
    public recurseIntoNodes(nodes: ReadonlyArray<ts.Node>, parent: ts.Node): Transformation[] | UnsupportedComplaint {
        const transformations: Transformation[] = [];
        let complaints: UnsupportedComplaint[] | undefined;

        for (const node of nodes) {
            const childTransformations = this.recurseIntoNode(node);

            if (childTransformations instanceof UnsupportedComplaint) {
                if (complaints === undefined) {
                    complaints = [childTransformations];
                } else {
                    complaints.push(childTransformations);
                }
            } else {
                transformations.push(...childTransformations);
            }
        }

        return complaints === undefined
            ? transformations
            : UnsupportedComplaint.forNode(parent, this.dependencies.sourceFile, complaints);
    }

    /**
     * Recurses the GLS outputs for a node's children.
     *
     * @param node   Node to transform the children of.
     * @returns Transformed GLS output for the node's children.
     */
    public recurseIntoChildren(node: ts.Node): Transformation[] | UnsupportedComplaint {
        return this.recurseIntoNodes(node.getChildren(), node);
    }

    /**
     * Retrieves the GLS output for a set of root file-level nodes.
     *
     * @param nodes   Nodes to transform.
     * @param parent   Common parent of the nodes.
     * @returns Transformed GLS output for the nodes.
     */
    public recurseIntoSourceFile(): (Transformation | UnsupportedComplaint)[] {
        const results: (UnsupportedComplaint | Transformation)[] = [];

        for (const node of this.dependencies.sourceFile.statements) {
            const childTransformations = this.recurseIntoNode(node);

            if (childTransformations instanceof UnsupportedComplaint) {
                results.push(childTransformations);
            } else {
                results.push(...childTransformations);
            }
        }

        return results;
    }
}
