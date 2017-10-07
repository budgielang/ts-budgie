//
class NameSplitter {
    public split(name: string): string[] {
        const results: string[] = [];
        let start = 0;

        for (let end = 1; end < name.length; end += 1) {
            if (this.isUpperCase(name[end])) {
                results.push(name.substring(start, end));
                start = end;
            }
        }

        if (start !== name.length) {
            results.push(name.substring(start, name.length));
        }

        return results;
    }

    private isUpperCase(letter: string): boolean {
        return letter === letter.toUpperCase();
    }
}
//
