import { parseCommandNames } from "./ArgvParser";
import { ComparisonTestsRunner } from "./ComparisonTestsRunner";

const testNames = parseCommandNames(process.argv);
const integrationTests = new ComparisonTestsRunner("test/end-to-end", testNames);
integrationTests.run();
