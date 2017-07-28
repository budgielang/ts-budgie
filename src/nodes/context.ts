import { GlsLine } from "../glsLine";

/**
 * Shared context for visitors in a file.
 */
export class VisitorContext {
    /**
     * Current type coercion, if any.
     */
    private typeCoercion?: string | GlsLine;

    /**
     * @returns The current type coercion, if any exists.
     */
    public get coercion(): string | GlsLine | undefined {
        return this.typeCoercion;
    }

    /**
     * Sets a new type coercion.
     *
     * @param coercion   A new type coercion.
     */
    public setTypeCoercion(coercion: string | GlsLine): void {
        this.typeCoercion = coercion;
    }

    /**
     * Exists the type coercion.
     *
     * @returns The exited type coercion, if any.
     */
    public exitTypeCoercion(): string | GlsLine | undefined {
        const coercion = this.typeCoercion;

        this.typeCoercion = undefined;

        return coercion;
    }
}
