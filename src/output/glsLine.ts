const escapeSpecialCharacters = (arg: string) =>
    arg
        .replace(/\r/g, "\\r")
        .replace(/\n/g, "\\n");

const escapeParenthesis = (arg: string) =>
    arg.replace(/\)/g, "\\)");

const textWrapIndicators = new Set<string>([
    "{", "(", " "
]);

/**
 * Wraps a command argument if it has any spaces.
 *
 * @param arg   Argument to a GLS command.
 * @returns The argument, wrapped if necessary.
 */
const wrapArg = (arg: string) => {
    for (const indicator of Array.from(textWrapIndicators)) {
        if (arg.indexOf(indicator) !== -1) {
            return `(${escapeParenthesis(arg)})`;
        }
    }

    return arg;
};

/**
 * Formats a string or recursive GLS command argument.
 *
 * @param arg   String or recursive GLS command argument.
 * @returns The formatted argument.
 */
const formatArg = (arg: string | GlsLine) =>
    typeof arg === "string"
        ? escapeSpecialCharacters(wrapArg(arg))
        : `{ ${arg} }`;

/**
 * A single line of output GLS.
 */
export class GlsLine {
    /**
     * GLS command name.
     */
    public readonly command: string;

    /**
     * Arguments for the command.
     */
    public readonly args: (string | GlsLine)[];

    /**
     * Initializes a new instance of the GlsLine class.
     *
     * @param command   GLS command name.
     * @param args   Arguments for the command.
     */
    public constructor(command: string, ...args: (string | GlsLine)[]) {
        this.command = command;
        this.args = args;
    }

    /**
     * Creates the GLS syntax equivalent for this line.
     *
     * @returns The GLS syntax equivalent for this line.
     */
    public toString(): string {
        if (this.args.length === 0) {
            return this.command;
        }

        return `${this.command} : ${this.args.map(formatArg).join(" ")}`;
    }
}
