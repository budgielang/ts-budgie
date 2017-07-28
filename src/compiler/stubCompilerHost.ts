import { CompilerHost, createProgram, createSourceFile, ResolvedModule, ScriptTarget, SourceFile, TypeChecker } from "typescript";

/* tslint:disable completed-docs */

const createSourceFilesMap = (sourceFiles: SourceFile[] | Map<string, SourceFile>) => {
    if (sourceFiles instanceof Map) {
        return sourceFiles;
    }

    const map = new Map<string, SourceFile>();

    for (const sourceFile of sourceFiles) {
        map.set(sourceFile.fileName, sourceFile);
    }

    return map;
};

export class StubCompilerHost implements CompilerHost {
    private readonly sourceFiles: Map<string, SourceFile>;

    public constructor(sourceFiles: SourceFile[] | Map<string, SourceFile>) {
        this.sourceFiles = createSourceFilesMap(sourceFiles);
    }

    public getDefaultLibFileName() {
        return "";
    }

    public getSourceFile(fileName: string, languageVersion: ScriptTarget, onError?: (message: string) => void): SourceFile {
        const sourceFile = this.sourceFiles.get(fileName);
        if (sourceFile !== undefined) {
            return sourceFile;
        }

        if (onError !== undefined) {
            onError(`'${fileName}' not found.`);
        }

        // TypeScript's declarations don't support strict null checks
        // tslint:disable-next-line no-any
        return undefined as any as SourceFile;
    }

    public writeFile() {/* ... */}

    public getCurrentDirectory() {
        return ".";
    }

    public getCanonicalFileName(fileName: string) {
        return fileName;
    }

    public getNewLine() {
        return "\n";
    }

    public useCaseSensitiveFileNames() {
        return true;
    }

    public fileExists(fileName: string) {
        return this.sourceFiles.has(fileName);
    }

    public readFile(fileName: string): string {
        const file = this.sourceFiles.get(fileName);

        if (file === undefined) {
            throw new Error(`File now found: '${file}'`);
        }

        return file.text;
    }

    public resolveModuleNames(): ResolvedModule[] {
        throw new Error("Unsupported");
    }

    public getDirectories(): string[] {
        throw new Error("Unsupported");
    }
}

/* tslint:enable completed-docs */
