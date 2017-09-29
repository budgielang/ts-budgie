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
//
