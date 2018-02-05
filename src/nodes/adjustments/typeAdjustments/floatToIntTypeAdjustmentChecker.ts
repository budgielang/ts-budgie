import { CommandNames } from "general-language-syntax";
import * as tsutils from "tsutils";
import * as ts from "typescript";

import { GlsLine } from "../../../output/glsLine";
import { RootAliaser } from "../../../parsing/aliasers/rootAliaser";
import { ITypeAdjustmentAttemptInfo, ITypeAdjustmentChecker } from "../types";

const getVariableInfoForNode = (node: ts.Node, usage: Map<ts.Identifier, tsutils.VariableInfo>) => {
    for (const key of Array.from(usage.keys())) {
        if (key === node) {
            return key;
        }
    }

    return undefined;
};

const isExpressionSettingNode = (parent: ts.Node, node: ts.Node): parent is ts.BinaryExpression =>
    ts.isBinaryExpression(parent)
    && parent.left.getText() === node.getText() //hacky...
    && parent.operatorToken.kind === ts.SyntaxKind.EqualsToken;

export class FloatToIntTypeAdjustmentChecker implements ITypeAdjustmentChecker {
    /**
     * ...
     */
    private readonly aliaser: RootAliaser;

    /**
     * ...
     */
    private readonly variableUsage: Map<ts.Identifier, tsutils.VariableInfo>;

    public constructor(aliaser: RootAliaser, variableUsage: Map<ts.Identifier, tsutils.VariableInfo>) {
        this.aliaser = aliaser;
        this.variableUsage = variableUsage;
    }

    public attempt(info: ITypeAdjustmentAttemptInfo): string | GlsLine | undefined {
        if (info.originalType !== "float" || !ts.isIdentifier(info.node.name)) {
            return undefined;
        }

        const variableInfo = this.variableUsage.get(info.node.name);
        if (variableInfo === undefined) {
            return undefined;
        }

        for (const use of variableInfo.uses) {
            const { parent } = use.location;
            if (parent === undefined || !isExpressionSettingNode(parent, info.node.name)) {
                continue;
            }

            if (this.aliaser.getFriendlyTypeName(parent.right) !== "int") {
                return undefined;
            }
        }

        return "int";
    }
}
