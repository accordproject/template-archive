/*
 * Temporary Undefined type for auto-added fields.
 * Behaves like String internally.
 */
'use strict';

class UndefinedType {
    /**
     * Create an UndefinedType instance.
     * @param {string} value
     */
    constructor(value) {
        this.value = value;
    }

    /**
     * Returns the value as string
     * @returns {string}
     */
    toString() {
        return String(this.value);
    }
}

module.exports = UndefinedType;