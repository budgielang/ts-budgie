import { BudgieLine } from "../output/budgieLine";
import { Transformation } from "../output/transformation";

import { LineIndenter } from "./lineIndenter";

/**
 * Counts the Budgie endlines within a range of text.
 *
 * @param text   Range of text from a source file.
 * @returns How many Budgie endlines should be printed.
 */
const countEndlinesWithin = (text: string): number => {
    const matches = text.match(/\n/g);
    if (matches === null) {
        return 0;
    }

    return matches.length - 1;
};

/**
 * Prints series of transformations as lines of Budgie.
 */
export class TransformationsPrinter {
    /**
     * Indents Budgie lines using their command metadata.
     */
    private readonly lineIndenter: LineIndenter = new LineIndenter();

    /**
     * Prints a series of transformations as indented lines.
     *
     * @param sourceText   Full source text from the transforming file.
     * @param transformations   A series of transformations.
     * @returns The transformations' equivalent indented lines.
     */
    public printFile(sourceText: string, transformations: Transformation[]): string[] {
        return this.lineIndenter.indent(this.printTransformations(sourceText, transformations));
    }

    /**
     * Prints a series of transformations as lines of Budgie and literal string lines.
     *
     * @param sourceText   Full source text from the transforming file.
     * @param transformations   A series of transformations.
     * @returns The transformations' equivalent Budgie and literal string lines.
     */
    public printTransformations(sourceText: string, transformations: Transformation[]): (string | BudgieLine)[] {
        const lines: (string | BudgieLine)[] = [];

        if (transformations.length === 0) {
            return lines;
        }

        lines.push(...this.printTransformation(sourceText, transformations[0]));

        for (let i = 1; i < transformations.length; i += 1) {
            const first = transformations[i - 1];
            const second = transformations[i];

            const linesDifference = countEndlinesWithin(sourceText.substring(first.range.end, second.range.start));
            for (let j = 0; j < linesDifference; j += 1) {
                lines.push("");
            }

            lines.push(...this.printTransformation(sourceText, transformations[i]));
        }

        return lines;
    }

    /**
     * Prints a series of transformations as lines of Budgie.
     *
     * @param transformation   A transformations.
     * @returns The transformation's equivalent Budgie.
     */
    private printTransformation(sourceText: string, transformation: Transformation): (string | BudgieLine)[] {
        const lines: (string | BudgieLine)[] = [];
        let previous: string | Transformation | BudgieLine | undefined;

        for (const transformed of transformation.output) {
            if (transformed instanceof Transformation) {
                if (previous !== undefined && previous instanceof Transformation) {
                    const linesDifference = countEndlinesWithin(sourceText.substring(previous.range.end, transformed.range.start));
                    for (let j = 0; j < linesDifference; j += 1) {
                        lines.push("");
                    }
                }

                lines.push(...this.printTransformation(sourceText, transformed));
            } else {
                lines.push(transformed);
            }

            previous = transformed;
        }

        return lines;
    }
}
