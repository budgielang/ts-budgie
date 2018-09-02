import { CommandNames } from "general-language-syntax";

import { GlsLine } from "./glsLine";

/**
 * Complaint text for an unsupported type.
 */
const unsupportedTypeComplaint = "Could not parse unsupported type.";

/**
 * Creates a GLS line for unsupported syntax.
 *
 * @param reason   Why the syntax is unsupported.
 * @returns GLS line for unsupported syntax for the reason.
 */
export const createUnsupportedGlsLine = (reason: string) => new GlsLine(CommandNames.Unsupported, reason);

/**
 * Creates a GLS line for unsupported syntax due to an unsupported type.
 *
 * @returns GLS line for unsupported syntax for an unsupported type.
 */
export const createUnsupportedTypeGlsLine = () => createUnsupportedGlsLine(unsupportedTypeComplaint);
