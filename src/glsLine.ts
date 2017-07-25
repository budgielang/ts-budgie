export class GlsLine {
    public readonly name: string;
    public readonly args: string[];

    public constructor(name: string, ...args: string[]) {
        this.name = name;
        this.args = args;
    }

    public toString(): string {
        return `${this.name} : ${this.args.join(" ")}`;
    }
}
