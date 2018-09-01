import { CaseStyle, CommandNames, KeywordNames } from "general-language-syntax";
import * as path from "path";
import * as ts from "typescript";

import { GlsLine } from "../../output/glsLine";
import { Transformation } from "../../output/transformation";
import { createUnsupportedGlsLine } from "../../output/unsupported";
import { NodeVisitor } from "../visitor";

const noBaseDirectoryComplaint = "Import directory goes out of bounds of the base directory.";

const noImportClauseComplaint = "Import declarations must import items.";

const noNamespaceImportsComplaint = "Namespace imports are not supported.";

const noPackageImportsComplaint = "Package imports are not yet supported.";

export class ImportDeclarationVisitor extends NodeVisitor {
    public visit(node: ts.ImportDeclaration) {
        return [
            Transformation.fromNode(
                node,
                this.sourceFile,
                [
                    this.getTransformationContents(node),
                ])
        ];
    }

    private getTransformationContents(node: ts.ImportDeclaration) {
        if (node.importClause === undefined || node.importClause.namedBindings === undefined) {
            return createUnsupportedGlsLine(noImportClauseComplaint);
        }

        if (node.importClause.namedBindings.kind === ts.SyntaxKind.NamespaceImport) {
            return createUnsupportedGlsLine(noNamespaceImportsComplaint);
        }

        const packagePath = this.parsePackagePath(node);
        if (packagePath instanceof GlsLine) {
            return packagePath;
        }

        const importedItems = node.importClause.namedBindings.elements
            .map((element) => element.name.text);

        return new GlsLine(CommandNames.ImportLocal, ...packagePath, KeywordNames.Use, ...importedItems);
    }

    private parsePackagePath(node: ts.ImportDeclaration): string[] | GlsLine {
        const packagePathRaw = node.moduleSpecifier.getText(this.sourceFile);
        if (packagePathRaw[1] !== ".") {
            return createUnsupportedGlsLine(noPackageImportsComplaint);
        }

        const sourceDir = path.dirname(this.sourceFile.fileName);
        const packagePath = packagePathRaw.replace(/"|'|`/g, "");
        const pathResolved = path.posix.join(sourceDir, packagePath);

        if (pathResolved.indexOf(this.context.options.baseDirectory) === -1) {
            return createUnsupportedGlsLine(noBaseDirectoryComplaint);
        }

        const pathWithNamespace = path.posix.join(
            this.context.options.outputNamespace,
            pathResolved.substring(this.context.options.baseDirectory.length));

        return pathWithNamespace
            .split(/\//g)
            .map((pathComponent) => this.casing.convertToCase(CaseStyle.PascalCase, [pathComponent]));
    }
}
