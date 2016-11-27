class Country {
    constructor(name) {
        this.name = name;
    }

    get name() {
        return this._name;
    }

    set name(value) {
        if (typeof(value) != 'string') {
            throw new Error('Country name must be a string!');
        }

        if (value === '') {
            throw new Error('Country name must contain at least one symbol!');
        }

        this._name = value;
    }
}