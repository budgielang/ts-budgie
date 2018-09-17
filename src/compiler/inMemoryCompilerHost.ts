import * as path from "path";
import * as ts from "typescript";

import { fullyNormalizeFilePath } from "./utils";

const createSourceFilesMap = (sourceFiles: ts.SourceFile[] | Map<string, ts.SourceFile>) => {
    const map = new Map<string, ts.SourceFile>();

    if (sourceFiles instanceof Map) {
        for (const [fileName, sourceFile] of Array.from(sourceFiles.entries())) {
            map.set(fullyNormalizeFilePath(fileName), sourceFile);
        }
    } else {
        for (const sourceFile of sourceFiles) {
            map.set(fullyNormalizeFilePath(sourceFile.fileName), sourceFile);
        }
    }

    return map;
};

export class InMemoryCompilerHost implements ts.CompilerHost {
    private readonly sourceFiles: Map<string, ts.SourceFile>;

    public constructor(sourceFiles: ts.SourceFile[] | Map<string, ts.SourceFile>) {
        this.sourceFiles = createSourceFilesMap(sourceFiles);
    }

    public getDefaultLibFileName() {
        return "";
    }

    // tslint:disable-next-line:variable-name
    public getSourceFile(fileName: string, _languageVersion: ts.ScriptTarget, onError?: (message: string) => void): ts.SourceFile {
        const sourceFile = this.sourceFiles.get(fullyNormalizeFilePath(fileName));
        if (sourceFile !== undefined) {
            return sourceFile;
        }

        const message = `'${fileName}' not found.`;
        if (onError !== undefined) {
            onError(message);
        }

        throw new Error(message);
    }

    public writeFile() {
        /* ... */
    }

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

    public readonly fileExists = (fileName: string) => this.sourceFiles.has(fullyNormalizeFilePath(fileName));

    public readonly readFile = (fileName: string): string => {
        const file = this.sourceFiles.get(fullyNormalizeFilePath(fileName));

        if (file === undefined) {
            throw new Error(`File not found: '${file}'.`);
        }

        return file.text;
    };

    public resolveModuleNames(moduleNames: string[], containingFile: string): ts.ResolvedModule[] {
        return moduleNames.map((rawModuleName: string) => {
            const moduleName = fullyNormalizeFilePath(
                rawModuleName[0] === "." ? path.join(path.dirname(containingFile), rawModuleName) : path.normalize(rawModuleName),
            );
            const resolvedFileName = `${moduleName}.ts`;

            if (!this.sourceFiles.has(resolvedFileName)) {
                throw new Error(`Could not resolve '${resolvedFileName}' from module name '${rawModuleName}' in '${containingFile}'.`);
            }

            return {
                resolvedFileName,
                extension: ts.Extension.Ts,
            };
        });
    }

    public getDirectories(): string[] {
        throw new Error("getDirectories is unsupported in a stub compiler.");
    }
}
