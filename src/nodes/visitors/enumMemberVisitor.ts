import { CommandNames } from "general-language-syntax";
import * as ts from "typescript";

import { GlsLine } from "../../output/glsLine";
import { Transformation } from "../../output/transformation";
import { createUnsupportedGlsLine, createUnsupportedTypeGlsLine } from "../../output/unsupported";
import { NodeVisitor } from "../visitor";

const invalidInitializerComplaint = "Enum members must each have a constant numeric or string value.";

const missingInitializerComplaint = "For now, enum members each require a value.";

export class EnumMemberVisitor extends NodeVisitor {
    public visit(node: ts.EnumMember) {
        return [
            Transformation.fromNode(
                node,
                this.sourceFile,
                [
                    this.getTransformationContents(node),
                ])
        ];
    }

    private getTransformationContents(node: ts.EnumMember) {
        if (!ts.isIdentifier(node.name)) {
            return createUnsupportedTypeGlsLine();
        }

        if (node.initializer === undefined) {
            return createUnsupportedGlsLine(missingInitializerComplaint);
        }

        if (typeof this.aliaser.getFriendlyTypeName(node.initializer) !== "string") {
            return createUnsupportedGlsLine(invalidInitializerComplaint);
        }

        const args: string[] = [node.name.text, node.initializer.getText(this.sourceFile)];

        if (node.parent.members[node.parent.members.length - 1] !== node) {
            args.push(",");
        }

        return new GlsLine(CommandNames.EnumMember, ...args);
    }
}
