//
interface IAbc {
    abc(): void;
    bcd(i: number): string;
    cde(j: boolean, k: string): IAbc;
}

interface IDef extends IAbc {
    def(): void
}

interface IGhi extends IAbc, IDef {
    ghi(abc: IAbc, def: IDef): IGhi;
}
//
