import { expect } from "chai";
import "mocha";

import { BudgieLine } from "../../src/output/budgieLine";

describe("BudgieLine", () => {
    describe("toString", () => {
        it("prints just a command name when there are no args", () => {
            // Arrange
            const line = new BudgieLine("command");

            // Act
            const printed = line.toString();

            // Assert
            expect(printed).to.be.equal("command");
        });

        it("prints a single argument", () => {
            // Arrange
            const line = new BudgieLine("command", "abc");

            // Act
            const printed = line.toString();

            // Assert
            expect(printed).to.be.equal("command : abc");
        });

        it("prints multiple arguments", () => {
            // Arrange
            const line = new BudgieLine("command", "abc", "def");

            // Act
            const printed = line.toString();

            // Assert
            expect(printed).to.be.equal("command : abc def");
        });

        it("wraps arguments that include spaces", () => {
            // Arrange
            const line = new BudgieLine("command", "abc def", "ghi", "jkl mno");

            // Act
            const printed = line.toString();

            // Assert
            expect(printed).to.be.equal("command : (abc def) ghi (jkl mno)");
        });

        it("escapes a wrapped parenthesis", () => {
            // Arrange
            const line = new BudgieLine("command", "(abc (def) ghi)");

            // Act
            const printed = line.toString();

            // Assert
            expect(printed).to.be.equal("command : ((abc (def\\) ghi\\))");
        });

        it("recursively includes a BudgieLine", () => {
            // Arrange
            const line = new BudgieLine("command", new BudgieLine("inner"));

            // Act
            const printed = line.toString();

            // Assert
            expect(printed).to.be.equal("command : { inner }");
        });

        it("recursively includes a BudgieLine with wrapped args", () => {
            // Arrange
            const line = new BudgieLine("command", new BudgieLine("inner", "abc def"));

            // Act
            const printed = line.toString();

            // Assert
            expect(printed).to.be.equal("command : { inner : (abc def) }");
        });

        it("escapes a starting bracket within a string", () => {
            // Arrange
            const line = new BudgieLine("command", '"{"');

            // Act
            const printed = line.toString();

            // Assert
            expect(printed).to.be.equal('command : ("{")');
        });
    });
});
