import { expect } from "chai";
import { readFileSync } from "fs";
import "mocha";
import * as path from "path";
import * as ts from "typescript";

import { createTransformer } from "../src";
import { findGlsTestSourcesUnder } from "../util";

/**
 * Reads the code contents of a test file.
 *
 * @param directoryPath   Directory containing the file.
 * @param fileName   Name of the file.
 * @param trim   Deliniator for the file's content beginning and end.
 * @returns   Lines of code from the file.
 */
const readFileAndTrim = (directoryPath: string, fileName: string, trim: string): string => {
    const lines = readFileSync(path.join(directoryPath, fileName))
        .toString()
        .replace(/\r\n|\r|\n/g, "\n")
        .trim();

    return lines.slice(
        lines.indexOf(trim) + trim.length + 1,
        lines.lastIndexOf(trim) - 1);
};

/**
 * Test runner for comparing converted .gls files and expected output.
 */
export class ComparisonTestsRunner {
    /**
     * Friendly directory path to read tests under.
     */
    private readonly section: string;

    /**
     * Disk root path for the section.
     */
    private readonly rootPath: string;

    /**
     * Command tests to be run within the section.
     */
    private readonly commandTests: Map<string, string[]>;

    private readonly sourceFiles: Map<string, ts.SourceFile>;

    /**
     * Initializes a new instance of the ComparisonTestsRunner class.
     *
     * @param section   Friendly directory path to read tests under.
     * @param testsToRun   Tests to run, if not all.
     */
    public constructor(section: string, testsToRun: Set<string> = new Set<string>(["*"])) {
        this.section = section;
        this.rootPath = path.resolve(section);
        this.commandTests = findGlsTestSourcesUnder(this.rootPath, testsToRun);
        this.sourceFiles = this.createSourceFiles();
    }

    /**
     * Runs tests under the directory path.
     */
    public run(): void {
        describe(this.section, () => {
            this.commandTests.forEach((_, test): void => {
                it(test, () => {
                    this.runCommandTest(path.join(this.section, test));
                });
            });
        });
    }

    /**
     * Runs a single BDD test case.
     *
     * @param directoryPath   Path to a directory
     */
    public runCommandTest(directoryPath: string): void {
        // Arrange
        const sourceName = path.join(directoryPath, "source.ts");
        const expectedText = readFileAndTrim(directoryPath, "expected.gls", "comment line");

        // Act
        const sourceFile = this.sourceFiles.get(sourceName) as ts.SourceFile;
        const transformer = createTransformer({
            compilerOptions: {
                isolatedModules: true,
                noLib: true,
            },
            sourceFiles: [sourceFile],
        });
        const actual = transformer.transformSourceFile(sourceFile);

        // Asserted
        expect(actual.join("\n").split("\n")).to.be.deep.equal(expectedText.split("\n"));
    }

    private createSourceFiles(): Map<string, ts.SourceFile> {
        const sourceFiles = new Map<string, ts.SourceFile>();

        this.commandTests.forEach((tests: string[], test: string): void => {
            const directoryName = path.join(this.section, test);

            for (const {} of tests) {
                const filePath = path.join(directoryName, "source.ts");
                const sourceText = readFileSync(filePath).toString();
                const sourceFile = ts.createSourceFile(filePath, sourceText, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);

                sourceFiles.set(filePath, sourceFile);
            }
        });

        return sourceFiles;
    }
}
