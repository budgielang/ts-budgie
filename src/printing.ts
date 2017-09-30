import { GlsLine } from "./glsLine";
import { Transformation } from "./transformation";

/**
 * Prints series of transformations as lines of GLS.
 */
export interface ITransformationsPrinter {
    /**
     * Prints a series of file-root-level transformations as lines of GLS and literal string lines.
     *
     * @param sourceText   Full source text from the transforming file.
     * @param transformations   A series of transformations.
     * @returns The transformations' equivalent GLS and literal string lines.
     */
    printRootTransformations(sourceText: string, transformations: Transformation[]): (string | GlsLine)[];

    /**
     * Prints a series of transformations as lines of GLS and literal string lines.
     *
     * @param transformations   A series of transformations.
     * @returns The transformations' equivalent GLS and literal string lines.
     */
    printTransformations(transformations: Transformation[]): (string | GlsLine)[];
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

    return Math.max(0, matches.length - 2);
};

/**
 * Prints series of transformations as lines of GLS.
 */
export class TransformationsPrinter implements ITransformationsPrinter {
    /**
     * Prints a series of file-root-level transformations as lines of GLS and literal string lines.
     *
     * @param sourceText   Full source text from the transforming file.
     * @param transformations   A series of transformations.
     * @returns The transformations' equivalent GLS and literal string lines.
     */
    public printRootTransformations(sourceText: string, transformations: Transformation[]): (string | GlsLine)[] {
        // if (transformations.length === 0) {
        //     return [];
        // }

        // const lines: (string | GlsLine)[] = [
        //     ...this.printTransformation(transformations[0])
        // ];

        // if (transformations.length === 1) {
        //     return lines;
        // }

        // for (let i = 1; i < transformations.length; i += 1) {
        //     // const first = transformations[i - 1];
        //     const second = transformations[i];

        //     // const linesDifference = countEndlinesWithin(sourceText.substring(first.range.end, second.range.start));
        //     // for (let j = 0; j < linesDifference; j += 1) {
        //     //     lines.push("");
        //     // }

        //     lines.push(...this.printTransformation(second));
        // }

        // return lines;
        return this.printTransformations(transformations);
    }

    /**
     * Prints a series of transformations as lines of GLS and literal string lines.
     *
     * @param transformations   A series of transformations.
     * @returns The transformations' equivalent GLS and literal string lines.
     */
    public printTransformations(transformations: Transformation[]): (string | GlsLine)[] {
        const lines: (string | GlsLine)[] = [];

        for (const transformation of transformations) {
            lines.push(...this.printTransformation(transformation));
        }

        return lines;
    }

    /**
     * Prints a series of transformations as lines of GLS.
     *
     * @param transformation   A transformations.
     * @returns The transformation's equivalent GLS.
     */
    private printTransformation(transformation: Transformation): (string | GlsLine)[] {
        const lines: (string | GlsLine)[] = [];

        for (const transformed of transformation.output) {
            if (transformed instanceof Transformation) {
                lines.push(...this.printTransformation(transformed));
            } else {
                lines.push(transformed);
            }
        }

        return lines;
    }
}
