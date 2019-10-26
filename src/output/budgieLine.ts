const escapeSpecialCharacters = (arg: string) => arg.replace(/\r/g, "\\r").replace(/\n/g, "\\n");

const escapeParenthesis = (arg: string) => arg.replace(/\)/g, "\\)");

const textWrapIndicators = new Set<string>(["{", "}", "(", ")", " ", ":"]);

/**
 * Wraps a command argument if it has any spaces.
 *
 * @param arg   Argument to a Budgie command.
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
 * Formats a string or recursive Budgie command argument.
 *
 * @param arg   String or recursive Budgie command argument.
 * @returns The formatted argument.
 */
const formatArg = (arg: string | BudgieLine) => (typeof arg === "string" ? escapeSpecialCharacters(wrapArg(arg)) : `{ ${arg} }`);

/**
 * A single line of output Budgie.
 */
export class BudgieLine {
    /**
     * Budgie command name.
     */
    public readonly command: string;

    /**
     * Arguments for the command.
     */
    public readonly args: (string | BudgieLine)[];

    /**
     * Initializes a new instance of the BudgieLine class.
     *
     * @param command   Budgie command name.
     * @param args   Arguments for the command.
     */
    public constructor(command: string, ...args: (string | BudgieLine)[]) {
        this.command = command;
        this.args = args;
    }

    /**
     * Creates the Budgie syntax equivalent for this line.
     *
     * @returns The Budgie syntax equivalent for this line.
     */
    public toString(): string {
        if (this.args.length === 0) {
            return this.command;
        }

        return `${this.command} : ${this.args.map(formatArg).join(" ")}`;
    }
}
