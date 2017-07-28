/**
 * Determines whether an object is earlier in sort order than another.
 *
 * @type TData   Type of sortable objetcs.
 * @param left   A sortable object.
 * @param right   A sortable object.
 * @returns Whether the first object is earlier than the second.
 */
export type IEarlierThan<TData> = (left: TData, right: TData) => boolean;

/**
 * Creates a clear tracking state for sorted lists of data.
 *
 * @type TData   Type of data being merged.
 * @param lists   Sorted lists of data.
 */
const createClearState = <TData>(lists: TData[][]) => {
    const mergePositions: number[] = [];
    const merged: TData[] = [];
    let totalCount = 0;

    for (const list of lists) {
        totalCount += list.length;
        mergePositions.push(0);
    }

    return { merged, mergePositions, totalCount };
};

/**
 * Merges sorted lists of data.
 *
 * @type TData   Type of data being merged.
 */
export class Merger<TData> {
    /**
     * Determines whether an object is earlier than another object.
     *
     * @returns Whether an object is earlier than another object.
     */
    private readonly betterThan: IEarlierThan<TData>;

    /**
     * Initializes a new instance of the Merge class.
     *
     * @param betterThan   Returns whether an object is earlier than another object.
     */
    public constructor(betterThan: IEarlierThan<TData>) {
        this.betterThan = betterThan;
    }

    /**
     * Merges sorted lists of data.
     *
     * @param lists   Sorted lists of data.
     * @returns The lists merged into one sorted list.
     */
    public merge(lists: TData[][]): TData[] {
        const { merged, mergePositions, totalCount } = createClearState(lists);

        for (let i = 0; i < totalCount; i += 1) {
            merged.push(this.getNext(lists, mergePositions));
        }

        return merged;
    }

    /**
     * Determines the next piece of data to create a total sorted list.
     *
     * @param lists   Sorted lists of data.
     * @param mergePositions   Incrementing last-retrieved locations for the lists.
     * @returns The next piece of data in sort order.
     */
    private getNext(lists: TData[][], mergePositions: number[]): TData {
        let optimal: TData | undefined;
        let i = 0;

        while (i < lists.length) {
            if (mergePositions[i] === lists[i].length) {
                lists.splice(i, 1);
                mergePositions.splice(i, 1);
                continue;
            }

            const proposal = lists[i][mergePositions[i]];

            if (optimal === undefined || this.betterThan(optimal, proposal)) {
                optimal = proposal;
            }

            mergePositions[i] += 1;
            i += 1;
        }

        return optimal as TData;
    }
}
