import { GlsLine } from "../glsLine";

export class VisitorContext {
    private typeCoercion?: string | GlsLine;

    public get coercion(): string | GlsLine | undefined {
        return this.typeCoercion;
    }

    public setTypeCoercion(coercion: string | GlsLine) {
        this.typeCoercion = coercion;
    }

    public exitTypeCoercion() {
        const coercion = this.typeCoercion;

        this.typeCoercion = undefined;

        return coercion;
    }
}
