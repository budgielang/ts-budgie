import { expect } from "chai";
import { readFileSync } from "fs";
import * as minimatch from "minimatch";
import "mocha";
import * as path from "path";
import { createSourceFile, ScriptTarget, SourceFile } from "typescript";

import { createTransformer } from "../lib";
import { UnsupportedComplaint } from "../lib/output/complaint";
import { GlsLine } from "../lib/output/glsLine";
import { findGlsFilesUnder, findGlsTestSourcesUnder } from "../util";

/**
 * Reads the code contents of a test file.
 *
 * @param directoryPath   Directory containing the file.
 * @param fileName   Name of the file.
 * @param trim   Deliniator for the file's content beginning and end.
 * @returns   Lines of code from the file.
 */
const readFile = (directoryPath: string, fileName: string, trim: string): string => {
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
     * Minimatchers for command groups to run.
     */
    private readonly testToRun: Set<string>;

    /**
     * Disk root path for the section.
     */
    private readonly rootPath: string;

    /**
     * Command tests to be run within the section.
     */
    private readonly commandTests: Map<string, string[]>;

    /**
     * Initializes a new instance of the ComparisonTestsRunner class.
     *
     * @param section   Friendly directory path to read tests under.
     * @param testsToRun   Tests to run, if not all.
     */
    public constructor(section: string, testsToRun: Set<string> = new Set<string>(["*"])) {
        this.section = section;
        this.testToRun = testsToRun;
        this.rootPath = path.resolve(section);
        this.commandTests = findGlsTestSourcesUnder(this.rootPath, this.testToRun);
    }

    /**
     * Runs tests under the directory path.
     */
    public run(): void {
        // Takes initial startup time costs away from the first test run's visitor bags
        createTransformer().transformText('console.log("Hello world!")');

        describe(this.section, () => {
            this.commandTests.forEach((tests: string[], test: string): void => {
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
        const source = readFile(directoryPath, "source.ts", "//");
        const expected = readFile(directoryPath, "expected.gls", "comment line");

        // Act
        const transformer = createTransformer({
            skipComments: false
        });
        const actual = transformer.transformText(source, {
            fileName: "Root/Subdirectory/source.ts"
        });

        // Asserted
        expect(actual.join("\n").split("\n")).to.be.deep.equal(expected.split("\n"));
    }
}
