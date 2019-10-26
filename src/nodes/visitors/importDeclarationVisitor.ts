import { CaseStyle, CommandNames, KeywordNames } from "budgie";
import * as path from "path";
import * as ts from "typescript";

import { BudgieLine } from "../../output/budgieLine";
import { Transformation } from "../../output/transformation";
import { createUnsupportedBudgieLine } from "../../output/unsupported";
import { NodeVisitor } from "../visitor";

const noBaseDirectoryComplaint = "Import directory goes out of bounds of the base directory.";

const noImportClauseComplaint = "Import declarations must import items.";

const noNamespaceImportsComplaint = "Namespace imports are not supported.";

const noPackageImportsComplaint = "Package imports are not yet supported.";

export class ImportDeclarationVisitor extends NodeVisitor {
    public visit(node: ts.ImportDeclaration) {
        return [Transformation.fromNode(node, this.sourceFile, [this.getTransformationContents(node)])];
    }

    private getTransformationContents(node: ts.ImportDeclaration) {
        if (node.importClause === undefined || node.importClause.namedBindings === undefined) {
            return createUnsupportedBudgieLine(noImportClauseComplaint);
        }

        if (node.importClause.namedBindings.kind === ts.SyntaxKind.NamespaceImport) {
            return createUnsupportedBudgieLine(noNamespaceImportsComplaint);
        }

        const packagePath = this.parsePackagePath(node);
        if (packagePath instanceof BudgieLine) {
            return packagePath;
        }

        const importedItems = node.importClause.namedBindings.elements.map((element) => element.name.text);

        return new BudgieLine(CommandNames.ImportLocal, ...packagePath, KeywordNames.Use, ...importedItems);
    }

    private parsePackagePath(node: ts.ImportDeclaration): string[] | BudgieLine {
        const packagePathRaw = node.moduleSpecifier.getText(this.sourceFile);
        if (packagePathRaw[1] !== ".") {
            return createUnsupportedBudgieLine(noPackageImportsComplaint);
        }

        const sourceDir = path.dirname(this.sourceFile.fileName);
        const packagePath = packagePathRaw.replace(/"|'|`/g, "");
        const pathResolved = path.posix.join(sourceDir, packagePath);

        if (pathResolved.indexOf(this.context.options.baseDirectory) === -1) {
            return createUnsupportedBudgieLine(noBaseDirectoryComplaint);
        }

        const pathWithNamespace = path.posix.join(
            this.context.options.outputNamespace,
            pathResolved.substring(this.context.options.baseDirectory.length),
        );

        const pathWithNamespaceAndFileSplit = pathWithNamespace
            .split(/\//g)
            .filter((pathComponent) => pathComponent !== "")
            .map((pathComponent) => this.casing.convertToCase(CaseStyle.PascalCase, [pathComponent]));

        pathWithNamespaceAndFileSplit.pop();

        return pathWithNamespaceAndFileSplit;
    }
}
