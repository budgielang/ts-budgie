import { GlsLine } from "../output/glsLine";
import { IContextOptions } from "../service";

/**
 * Shared context for visitors in a file.
 */
export class VisitorContext {
    /**
     * Current type coercion, if any.
     */
    private typeCoercion?: string | GlsLine;

    /**
     * Constant conversion options for visiting nodes.
     */
    public readonly options: IContextOptions;

    /**
     * Initializes a new instance of the VisitorContext class.
     *
     * @param options   Constant conversion options for visiting nodes.
     */
    public constructor(options: IContextOptions) {
        this.options = options;
    }

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
