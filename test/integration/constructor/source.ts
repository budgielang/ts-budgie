//
class PublicImplicitNoParameters {
    constructor() {}
}

class PublicExplicitNoParameters {
    public constructor() {}
}

class ProtectedNoParameters {
    protected constructor() {}
}

class PrivateNoParameters {
    private constructor() { }
}

class OneParameter {
    public constructor(abc: string) {}
}

class OneParameterContent {
    public constructor(abc: string) {
        console.log(abc);
    }
}

class TwoParameters {
    public constructor(abc: string, def: OneParameter) { }
}

class TwoParametersContent {
    public constructor(abc: string, def: OneParameter) {
        console.log(abc);
        console.log(def);
    }
}
//
