//
class Abc {
    public explicits: string = "def";

    implicits = 7;

    protected infinite: Abc;

    private array = ["ghi"];

    public constructor() {
        this.infinite = new Abc();
        this.array = ["jkl"];
    }
}

const abc = new Abc();

abc.explicits = "mno";
abc.implicits *= 2;
//
