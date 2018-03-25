/**
 * Parsers test names from argv.
 *
 * @param argv   Raw command-line arguments.
 * @returns Test names from argv preceded by "--command", if any.
 */
export const parseCommandNames = (argv: string[]): Set<string> => {
    const testNames = new Set<string>();
    let hadTest = false;

    for (let i = 0; i < argv.length - 1; i += 1) {
        if (argv[i] === "--command") {
            testNames.add(argv[i + 1].toLowerCase());
            hadTest = true;
        }
    }

    if (!hadTest) {
        testNames.add("*");
    }

    return testNames;
};
