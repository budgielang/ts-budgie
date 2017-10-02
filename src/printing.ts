import { GlsLine } from "./glsLine";
import { LineIndenter } from "./lineIndenter";
import { Transformation } from "./transformation";

/**
 * Prints series of transformations as lines of GLS.
 */
export interface ITransformationsPrinter {
    /**
     * Prints a series of transformations as indented lines.
     *
     * @param sourceText   Full source text from the transforming file.
     * @param transformations   A series of transformations.
     * @returns The transformations' equivalent indented lines.
     */
    printFile(sourceText: string, transformations: Transformation[]): string[];

    /**
     * Prints a series of transformations as lines of GLS and literal string lines.
     *
     * @param sourceText   Full source text from the transforming file.
     * @param transformations   A series of transformations.
     * @returns The transformations' equivalent GLS and literal string lines.
     */
    printTransformations(sourceText: string, transformations: Transformation[]): (string | GlsLine)[];
}

/**
 * Counts the GLS endlines within a range of text.
 *
 * @param text   Range of text from a source file.
 * @returns How many GLS endlines should be printed.
 */
const countEndlinesWithin = (text: string): number => {
    const matches = text.match(/\n/g);
    if (matches === null) {
        return 0;
    }

    return matches.length - 1;
};

/**
 * Prints series of transformations as lines of GLS.
 */
export class TransformationsPrinter implements ITransformationsPrinter {
    /**
     * Indents GLS lines using their command metadata.
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
     * Prints a series of transformations as lines of GLS and literal string lines.
     *
     * @param sourceText   Full source text from the transforming file.
     * @param transformations   A series of transformations.
     * @returns The transformations' equivalent GLS and literal string lines.
     */
    public printTransformations(sourceText: string, transformations: Transformation[]): (string | GlsLine)[] {
        const lines: (string | GlsLine)[] = [];

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
     * Prints a series of transformations as lines of GLS.
     *
     * @param transformation   A transformations.
     * @returns The transformation's equivalent GLS.
     */
    private printTransformation(sourceText: string, transformation: Transformation): (string | GlsLine)[] {
        const lines: (string | GlsLine)[] = [];
        let previous: string | Transformation | GlsLine | undefined;

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
