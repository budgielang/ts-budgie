import { CompilerHost, createProgram, createSourceFile, ResolvedModule, ScriptTarget, SourceFile, TypeChecker } from "typescript";

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

    public getSourceFile(fileName: string, languageVersion: ScriptTarget, onError?: (messagE: string) => void): SourceFile {
        const sourceFile = this.sourceFiles.get(fileName);
        if (sourceFile !== undefined) {
            return sourceFile;
        }

        if (onError) {
            onError(`'${fileName}' not found.`);
        }

        // tsc's declarations don't support strict null checks
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
        return this.sourceFiles.get(fileName)!.text;
    }

    public resolveModuleNames(): ResolvedModule[] {
        throw new Error("Unsupported");
    }

    public getDirectories(): string[] {
        throw new Error("Unsupported");
    }
}
