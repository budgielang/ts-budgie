import { CommandNames } from "budgie";

import { BudgieLine } from "./budgieLine";

/**
 * Complaint text for an unsupported type.
 */
const unsupportedTypeComplaint = "Could not parse unsupported type.";

/**
 * Creates a Budgie line for unsupported syntax.
 *
 * @param reason   Why the syntax is unsupported.
 * @returns Budgie line for unsupported syntax for the reason.
 */
export const createUnsupportedBudgieLine = (reason: string) => new BudgieLine(CommandNames.Unsupported, reason);

/**
 * Creates a Budgie line for unsupported syntax due to an unsupported type.
 *
 * @returns Budgie line for unsupported syntax for an unsupported type.
 */
export const createUnsupportedTypeBudgieLine = () => createUnsupportedBudgieLine(unsupportedTypeComplaint);
