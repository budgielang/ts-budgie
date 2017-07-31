import { GlsLine } from "./glsLine";
import { Transformation } from "./transformation";

/**
 * Prints series of transformations as lines of GLS.
 */
export interface ITransformationsPrinter {
    /**
     * Prints a series of transformations as lines of GLS.
     *
     * @param transformations   A series of transformations.
     * @returns The transformations' equivalent GLS.
     */
    printRootTransformations(transformations: Transformation[]): GlsLine[];

    /**
     * Prints a series of transformations as lines of GLS and literal string lines.
     *
     * @param transformations   A series of transformations.
     * @returns The transformations' equivalent GLS and literal string lines.
     */
    printTransformations(transformations: Transformation[]): (string | GlsLine)[];
}

/**
 * Prints series of transformations as lines of GLS.
 */
export class TransformationsPrinter implements ITransformationsPrinter {
    /**
     * Prints a series of transformations as lines of GLS.
     *
     * @param transformations   A series of transformations.
     * @returns The transformations' equivalent GLS.
     */
    public printRootTransformations(transformations: Transformation[]): GlsLine[] {
        return this.printTransformations(transformations)
            .filter((transformation): transformation is GlsLine => transformation instanceof GlsLine);
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
