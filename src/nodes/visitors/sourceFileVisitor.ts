import { SourceFile } from "typescript";

import { Transformation } from "../../transformation";
import { NodeVisitor } from "../visitor";

export class SourceFileVisitor extends NodeVisitor {
    public visit(node: SourceFile) {
        return this.router.recurseIntoChildren(node);
    }
}
