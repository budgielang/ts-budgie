import { expect } from "chai";
import "mocha";
import { Node, SourceFile, VariableStatement } from "typescript";

import { RootAliaser } from "../../../../lib/parsing/aliasers/rootAliaser";
import { mountSourceText } from "../mounting";

type INodeGetter = (sourceFile: SourceFile) => Node;

const getRootNode = (sourceFile: SourceFile) => sourceFile.getChildren()[0].getChildren()[0];

const getVariableDeclarationType = (sourceFile: SourceFile) =>
    (getRootNode(sourceFile) as VariableStatement).declarationList.declarations[0].type!;

const assertSourceBecomes = (sourceText: string, expectedTypeName: string, getNode: INodeGetter = getRootNode) => {
    // Arrange
    const { sourceFile, typeChecker } = mountSourceText(sourceText);
    const node = getNode(sourceFile);
    const aliaser = new RootAliaser(typeChecker);

    // Act
    const typeName = aliaser.getFriendlyTypeNameForNode(getNode(sourceFile));

    // Assert
    expect(typeName.toString()).to.be.equal(expectedTypeName);
};

describe("RootAliaser", () => {
    describe("getFriendlyTypeNameForNode", () => {
        it("gets a boolean literal type", () => {
            assertSourceBecomes(`true`, "boolean");
        });

        it("gets a float literal type", () => {
            assertSourceBecomes(`3.5`, "float");
        });

        it("gets an int literal type", () => {
            assertSourceBecomes(`7`, "int");
        });

        it("gets a string literal type", () => {
            assertSourceBecomes(`"abc"`, "string");
        });

        it("gets a shallow list type", () => {
            assertSourceBecomes(`["abc", "def"]`, "list type : string");
        });

        it("gets a deep list type", () => {
            assertSourceBecomes(`[["abc", "def"], ["ghi", "kjl"]]`, "list type : { list type : string }");
        });

        it("gets a shallow dictionary type ", () => {
            assertSourceBecomes(
                `let foo: { [i: string]: boolean }`,
                "dictionary type : string boolean",
                getVariableDeclarationType);
        });

        it("gets a deep dictionary type", () => {
            assertSourceBecomes(
                `let foo: { [i: string]: { [i: string]: boolean} }`,
                "dictionary type : string { dictionary type : string boolean }",
                getVariableDeclarationType);
        });

        it("defaults a dictionary numeric type to float", () => {
            assertSourceBecomes(
                `let foo: { [i: string]: number };`,
                "dictionary type : string float",
                getVariableDeclarationType);
        });
    });
});
