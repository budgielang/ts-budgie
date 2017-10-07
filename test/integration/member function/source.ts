//
class Abc {
    public explicits(): string {
        return "";
    }

    implicits() {
        this.parameters("", 0);
        return new Abc();
    }

    private parameters(first: string, second: number) {
        this.explicits();
    }
}

abstract class Def {
    public abstract explicits(): string;

    abstract implicits(): Abc;

    protected abstract parameters(first: string, second: number): void;
}
//
