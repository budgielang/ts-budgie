import { GlsLine } from "../glsLine";

export class VisitorContext {
    private typeCoercion?: string | GlsLine;

    public enterTypeCoercion(coercion: string | GlsLine) {
        this.typeCoercion = coercion;
    }

    public exitTypeCoercion() {
        this.typeCoercion = undefined;
    }
}
