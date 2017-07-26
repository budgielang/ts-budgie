const wrapArg = (arg: string) =>
    arg.indexOf(" ") === -1
        ? arg
        : `(${arg})`;

export class GlsLine {
    public readonly name: string;
    public readonly args: string[];

    public constructor(name: string, ...args: string[]) {
        this.name = name;
        this.args = args;
    }

    public toString(): string {
        if (this.args.length === 0) {
            return this.name;
        }

        return `${this.name} : ${this.args.map(wrapArg).join(" ")}`;
    }
}
