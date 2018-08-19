import { CommandNames } from "general-language-syntax";
import * as ts from "typescript";

import { UnsupportedComplaint } from "../../output/complaint";
import { GlsLine } from "../../output/glsLine";
import { Transformation } from "../../output/transformation";
import { NodeVisitor } from "../visitor";

const invalidInitializerComplaint = "Enum members must each have a constant numeric or string value.";

const missingInitializerComplaint = "For now, enum members each require a value.";

export class EnumMemberVisitor extends NodeVisitor {
    public visit(node: ts.EnumMember) {
        if (!ts.isIdentifier(node.name)) {
            return UnsupportedComplaint.forUnsupportedTypeNode(node, this.sourceFile);
        }

        if (node.initializer === undefined) {
            return UnsupportedComplaint.forNode(node, this.sourceFile, missingInitializerComplaint);
        }

        if (typeof this.aliaser.getFriendlyTypeName(node.initializer) !== "string") {
            return UnsupportedComplaint.forNode(node, this.sourceFile, invalidInitializerComplaint);
        }

        const args: string[] = [node.name.text, node.initializer.getText(this.sourceFile)];

        if (node.parent.members[node.parent.members.length - 1] !== node) {
            args.push(",");
        }

        return [
            Transformation.fromNode(
                node,
                this.sourceFile,
                [
                    new GlsLine(CommandNames.EnumMember, ...args),
                ])
        ];
    }
}
