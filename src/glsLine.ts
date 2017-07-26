const wrapArg = (arg: string) => arg.indexOf(" ") === -1 ? arg : `(${arg})`;

const recurseOnArg = (arg: string) =>
    typeof arg === "string"
        ? wrapArg(arg)
        : `{ ${arg} }`;

export class GlsLine {
    public readonly command: string;
    public readonly args: (string | GlsLine)[];

    public constructor(command: string, ...args: (string | GlsLine)[]) {
        this.command = command;
        this.args = args;
    }

    public toString(): string {
        if (this.args.length === 0) {
            return this.command;
        }

        return `${this.command} : ` + this.args.map(recurseOnArg).join(" ");
    }
}
