import { expect } from "chai";
import "mocha";

import { GlsLine } from "../../lib/output/glsLine";

describe("GlsLine", () => {
    describe("toString", () => {
        it("prints just a command name when there are no args", () => {
            // Arrange
            const line = new GlsLine("command");

            // Act
            const printed = line.toString();

            // Assert
            expect(printed).to.be.equal("command");
        });

        it("prints a single argument", () => {
            // Arrange
            const line = new GlsLine("command", "abc");

            // Act
            const printed = line.toString();

            // Assert
            expect(printed).to.be.equal("command : abc");
        });

        it("prints multiple arguments", () => {
            // Arrange
            const line = new GlsLine("command", "abc", "def");

            // Act
            const printed = line.toString();

            // Assert
            expect(printed).to.be.equal("command : abc def");
        });

        it("wraps arguments that include spaces", () => {
            // Arrange
            const line = new GlsLine("command", "abc def", "ghi", "jkl mno");

            // Act
            const printed = line.toString();

            // Assert
            expect(printed).to.be.equal("command : (abc def) ghi (jkl mno)");
        });

        it("recursively includes a GlsLine", () => {
            // Arrange
            const line = new GlsLine("command", new GlsLine("inner"));

            // Act
            const printed = line.toString();

            // Assert
            expect(printed).to.be.equal("command : { inner }");
        });

        it("recursively includes a GlsLine with wrapped args", () => {
            // Arrange
            const line = new GlsLine("command", new GlsLine("inner", "abc def"));

            // Act
            const printed = line.toString();

            // Assert
            expect(printed).to.be.equal("command : { inner : (abc def) }");
        });
    });
});
