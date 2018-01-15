import { CaseStyle, CommandNames, KeywordNames } from "general-language-syntax";
import * as path from "path";
import { ImportDeclaration, SyntaxKind } from "typescript";

import { UnsupportedComplaint } from "../../output/complaint";
import { GlsLine } from "../../output/glsLine";
import { Transformation } from "../../output/transformation";
import { NodeVisitor } from "../visitor";

const noImportClauseComplaint = "Import declarations must import items.";

const noNamespaceImportsComplaint = "Namespace imports are not supported.";

const noPackageImportsComplaint = "Package imports are not yet supported.";

export class ImportDeclarationVisitor extends NodeVisitor {
    private readonly sourcePathComponents = this.sourceFile.fileName.split(/\/|\\/g);

    public visit(node: ImportDeclaration) {
        if (node.importClause === undefined || node.importClause.namedBindings === undefined) {
            return UnsupportedComplaint.forNode(node, this.sourceFile, noImportClauseComplaint);
        }

        if (node.importClause.namedBindings.kind === SyntaxKind.NamespaceImport) {
            return UnsupportedComplaint.forNode(node, this.sourceFile, noNamespaceImportsComplaint);
        }

        const packagePath = this.parsePackagePath(node);
        if (packagePath instanceof UnsupportedComplaint) {
            return packagePath;
        }

        const importedItems = node.importClause.namedBindings.elements
            .map((element) => element.name.text);

        return [
            Transformation.fromNode(
                node,
                this.sourceFile,
                [
                    new GlsLine(CommandNames.ImportLocal, ...packagePath, KeywordNames.Use, ...importedItems)
                ])
        ];
    }

    private parsePackagePath(node: ImportDeclaration): string[] | UnsupportedComplaint {
        const packagePathRaw = node.moduleSpecifier.getText(this.sourceFile);
        if (packagePathRaw[1] !== ".") {
            return UnsupportedComplaint.forNode(node, this.sourceFile, noPackageImportsComplaint);
        }

        const sourceDir = path.dirname(this.sourceFile.fileName);
        const packagePath = packagePathRaw.replace(/"|'|`/g, "");
        const pathResolved = path.join(sourceDir, packagePath);

        return pathResolved
            .split(/\/|\\/g)
            .map((pathComponent) => this.casing.convertToCase(CaseStyle.PascalCase, [pathComponent]));
    }
}