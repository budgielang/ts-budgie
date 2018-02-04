import * as ts from "typescript";

import { arrayToMap } from "../utils";

export class StubLanguageServiceHost implements ts.LanguageServiceHost {
    private readonly compilerOptions: ts.CompilerOptions;
    private readonly sourceFilesByName: Map<string, ts.SourceFile>;

    public constructor(compilerOptions: ts.CompilerOptions, sourceFilesByName: Map<string, ts.SourceFile>) {
        this.compilerOptions = compilerOptions;
        this.sourceFilesByName = sourceFilesByName;
    }

    public getCompilationSettings(): ts.CompilerOptions {
        return this.compilerOptions;
    }

    public getScriptFileNames(): string[] {
        return Array.from(this.sourceFilesByName.keys());
    }

    public getScriptVersion() {
        // I have no idea what this is.
        return "1";
    }

    public getScriptSnapshot(fileName: string) {
        const sourceFile = this.sourceFilesByName.get(fileName);
        if (sourceFile === undefined) {
            throw new Error(`Unknown file: '${fileName}'`);
        }

        const { text } = sourceFile;

        return {
            getText: (start: number, end: number) => text.substring(start, end),
            getLength: () => text.length,
            getChangeRange: () => void 0
        };
    }

    public getCurrentDirectory(): string {
        return "";
    }

    public getDefaultLibFileName(options: ts.CompilerOptions): string {
        return ts.getDefaultLibFilePath(options);
    }
}
