/**
 * Fully lowercases and converts to forward slashes a path.
 *
 * @param filePath   Path to normalize.
 * @returns Fully normalized version of the path.
 */
export const fullyNormalizeFilePath = (filePath: string): string => filePath.replace(/\\/g, "/").toLowerCase();
