import { expect } from "chai";
import "mocha";
import { ClassDeclaration, ConstructorDeclaration, Node, SourceFile, TypeNode, VariableStatement } from "typescript";

import { GlsLine } from "../../../../lib/glsLine";
import { RootAliaser } from "../../../../lib/parsing/aliasers/rootAliaser";
import { mountSourceText } from "../mounting";

type INodeGetter = (sourceFile: SourceFile) => Node;

const getRootNode = (sourceFile: SourceFile) => sourceFile.getChildren()[0].getChildren()[0];

describe("RootAliaser", () => {
    describe("getFriendlyTypeName", () => {
        const getVariableDeclarationType = (sourceFile: SourceFile) =>
            (getRootNode(sourceFile) as VariableStatement).declarationList.declarations[0].type as TypeNode;

        const assertTypeNameBecomes = (
            sourceText: string,
            expectedTypeName: string | GlsLine | undefined,
            getNode: INodeGetter = getRootNode) => {
            // Arrange
            const { sourceFile, typeChecker } = mountSourceText(sourceText);
            const node = getNode(sourceFile);
            const aliaser = new RootAliaser(sourceFile, typeChecker);

            // Act
            const typeName = aliaser.getFriendlyTypeName(getNode(sourceFile));

            // Assert
            expect(`${typeName}`).to.be.equal(expectedTypeName);
        };

        it("gets a boolean literal type", () => {
            assertTypeNameBecomes("true", "boolean");
        });

        it("gets a float literal type", () => {
            assertTypeNameBecomes("3.5", "float");
        });

        it("gets an int literal type", () => {
            assertTypeNameBecomes("7", "int");
        });

        it("gets a string literal type", () => {
            assertTypeNameBecomes('"abc"', "string");
        });

        it("gets a shallow list type", () => {
            assertTypeNameBecomes('["abc", "def"]', "list type : string");
        });

        it("gets a deep list type", () => {
            assertTypeNameBecomes('[["abc", "def"], ["ghi", "kjl"]]', "list type : { list type : string }");
        });

        it("gets a shallow dictionary type ", () => {
            assertTypeNameBecomes(
                "let foo: { [i: string]: boolean }",
                "dictionary type : string boolean",
                getVariableDeclarationType);
        });

        it("gets a deep dictionary type", () => {
            assertTypeNameBecomes(
                "let foo: { [i: string]: { [i: string]: boolean} }",
                "dictionary type : string { dictionary type : string boolean }",
                getVariableDeclarationType);
        });

        it("defaults a dictionary numeric type to float", () => {
            assertTypeNameBecomes(
                "let foo: { [i: string]: number };",
                "dictionary type : string float",
                getVariableDeclarationType);
        });
    });

    describe("getFriendlyPrivacyName", () => {
        const getFirstChildConstructor = (sourceFile: SourceFile) =>
            (getRootNode(sourceFile) as ClassDeclaration).members[0] as ConstructorDeclaration;

        const assertTypeNameBecomes = (
            sourceText: string,
            expectedTypeName: string | GlsLine | undefined,
            getNode: INodeGetter = getRootNode) => {
            // Arrange
            const { sourceFile, typeChecker } = mountSourceText(sourceText);
            const node = getNode(sourceFile);
            const aliaser = new RootAliaser(sourceFile, typeChecker);

            // Act
            const typeName = aliaser.getFriendlyPrivacyName(getNode(sourceFile));

            // Assert
            expect(`${typeName}`).to.be.equal(expectedTypeName);
        };

        it("defaults a constructor to public", () => {
            assertTypeNameBecomes(
                "class Foo { constructor() {} }",
                "public",
                getFirstChildConstructor);
        });

        it("retrieves public from a public constructor", () => {
            assertTypeNameBecomes(
                "class Foo { constructor() {} }",
                "public",
                getFirstChildConstructor);
        });

        it("retrieves protected from a protected constructor", () => {
            assertTypeNameBecomes(
                "class Foo { protected constructor() {} }",
                "protected",
                getFirstChildConstructor);
        });

        it("retrieves private from a private constructor", () => {
            assertTypeNameBecomes(
                "class Foo { private constructor() {} }",
                "private",
                getFirstChildConstructor);
        });
    });
});
