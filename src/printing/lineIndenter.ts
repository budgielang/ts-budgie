import { CommandsBag, CommandsBagFactory } from "general-language-syntax";

import { GlsLine } from "../output/glsLine";

/**
 * Generates spaces equivalent to 4-space code tabbing.
 *
 * @param amount   How many tabs should be added.
 * @returns An all-spaces String of length = amount * 4.
 */
const generateTabs = (amount: number): string => {
    let output = "";

    for (let i = 0; i < amount; i += 1) {
        output += "    ";
    }

    return output;
};

/**
 * Indents GLS lines using their command metadata.
 */
export class LineIndenter {
    private readonly commandsBag: CommandsBag = CommandsBagFactory.forLanguageName("TypeScript");

    /**
     * Indents GLS lines using their command metadata.
     *
     * @param lines   GLS and literal string lines.
     * @returns Indented versions of the lines.
     */
    public indent(lines: (string | GlsLine)[]): string[] {
        const output: string[] = [];
        if (lines.length === 0) {
            return output;
        }

        let currentIndentation = 0;

        for (const line of lines) {
            if (typeof line === "string") {
                output.push(line);
                continue;
            }

            const indentationChanges = this.getIndentationChanges(line);
            const stringified = line.toString();

            for (const change of indentationChanges) {
                if (change < 0) {
                    currentIndentation += change;
                }
            }

            if (stringified === "") {
                output.push("");
            } else {
                output.push(generateTabs(currentIndentation) + line.toString());
            }

            for (const change of indentationChanges) {
                if (change > 0) {
                    currentIndentation += change;
                }
            }
        }

        return output;
    }

    /**
     * Computes how a line's command changes indentation.
     *
     * @param line   Output GLS line.
     * @returns How the line's command changes indentation.
     */
    private getIndentationChanges(line: GlsLine): number[] {
        const command = this.commandsBag.getCommand(line.command);
        const metadata = command.getMetadata();

        return metadata.indentation;
    }
}
