//
export class RunLengthEncoder {
    public encode(input: string): string {
        let result = "";
        let i = 0;

        while (i < input.length) {
            const repeats = this.countRepeatsOfLetter(input, i);
            result += input[i] + repeats;

            i += repeats;
        }

        return result;
    }

    private countRepeatsOfLetter(input: string, start: number): number {
        let i = start;

        while (i < input.length) {
            if (input[i] !== input[start]) {
                return i - start;
            }

            i += 1;
        }

        return input.length - start;
    }
}
//
