/**
 * Range to modify in a source file.
 */
export interface IRange {
    /**
     * Character position end of the range.
     */
    end: number;

    /**
     * Character position start of the range.
     */
    start: number;
}
