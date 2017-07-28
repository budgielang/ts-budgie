import { GlsLine } from "./glsLine";
import { Transformation } from "./transformation";

export interface ITransformationsPrinter {
    /**
     * Prints a series of transformations as lines of GLS.
     *
     * @param transformations   A series of transformations.
     * @returns The transformations' equivalent GLS.
     */
    printTransformations(transformations: Transformation[]): GlsLine[];
}

export class TransformationsPrinter implements ITransformationsPrinter {
    /**
     * Prints a series of transformations as lines of GLS.
     *
     * @param transformations   A series of transformations.
     * @returns The transformations' equivalent GLS.
     */
    public printTransformations(transformations: Transformation[]): GlsLine[] {
        const lines: GlsLine[] = [];

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
    private printTransformation(transformation: Transformation): GlsLine[] {
        const lines: GlsLine[] = [];

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
