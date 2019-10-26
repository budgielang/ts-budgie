import { BudgieLine } from "../output/budgieLine";
import { IContextOptions } from "../service";

/**
 * Shared context for visitors in a file.
 */
export class VisitorContext {
    /**
     * Current type coercion, if any.
     */
    private typeCoercion?: string | BudgieLine;

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
    public get coercion(): string | BudgieLine | undefined {
        return this.typeCoercion;
    }

    /**
     * Sets a new type coercion.
     *
     * @param coercion   A new type coercion.
     */
    public setTypeCoercion(coercion: string | BudgieLine): void {
        this.typeCoercion = coercion;
    }

    /**
     * Exists the type coercion.
     *
     * @returns The exited type coercion, if any.
     */
    public exitTypeCoercion(): string | BudgieLine | undefined {
        const coercion = this.typeCoercion;

        this.typeCoercion = undefined;

        return coercion;
    }
}
