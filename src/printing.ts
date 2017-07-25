import { GlsLine } from "./glsLine";
import { Transformation } from "./transformation";

export const printTransformation = (transformation: Transformation): GlsLine[] => {
    const lines: GlsLine[] = [];

    for (const transformed of transformation.output) {
        if (transformed instanceof Transformation) {
            lines.push(...printTransformation(transformed));
        } else {
            lines.push(transformed);
        }
    }

    return lines;
};

export const printTransformations = (transformations: Transformation[]): GlsLine[] => {
    const lines: GlsLine[] = [];

    for (const transformation of transformations) {
        lines.push(...printTransformation(transformation));
    }

    return lines;
};
