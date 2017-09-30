//
class Abc {
    public static explicits(): string {
        return "";
    }

    static implicits() {
        Abc.parameters("", 0);
        return new Abc();
    }

    private static parameters(first: string, second: number) {
        Abc.explicits();
    }
}
//
