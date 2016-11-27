class Town {
    constructor(name, country) {
        this.name = name;
        this.country = country;
    }

    get name() {
        return this._name;
    }

    set name(value) {
        if (typeof(value) != 'string') {
            throw new Error('Town name must be a string!');
        }

        if (value === '') {
            throw new Error('Town name must contain at least one symbol!');
        }

        this._name = value;
    }
}