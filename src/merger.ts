export type IBetterThan<T> = (left: T, right: T) => boolean;

const createClearState = <T>(lists: T[][]) => {
    const mergePositions: number[] = [];
    const merged: T[] = [];
    let totalCount = 0;

    for (const list of lists) {
        totalCount += list.length;
        mergePositions.push(0);
    }

    return { merged, mergePositions, totalCount };
};

export class Merger<T> {
    private readonly betterThan: IBetterThan<T>;

    public constructor(betterThan: IBetterThan<T>) {
        this.betterThan = betterThan;
    }

    public merge(lists: T[][]): T[] {
        const { merged, mergePositions, totalCount } = createClearState(lists);

        for (let i = 0; i < totalCount; i += 1) {
            merged.push(this.getNext(lists, mergePositions));
        }

        return merged;
    }

    private getNext(lists: T[][], mergePositions: number[]): T {
        let optimal = lists[0][mergePositions[0]];

        for (let i = lists.length - 1; i > 0; i -= 1) {
            if (mergePositions[i] === lists[i].length) {
                lists.splice(i, 1);
                mergePositions.splice(i, 1);
                i -= 1;
                continue;
            }

            const proposal = lists[i][mergePositions[i]];

            if (this.betterThan(optimal, proposal)) {
                optimal = proposal;
            }
        }

        return optimal;
    }
}
