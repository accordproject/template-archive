/**
 * The type name for an argument
 * @class
 * @memberof module:cicero-core
 */
export default class ArgumentType {
    name: any;
    /**
     * Create the argument type.
     * @param {string} name - The name of the type
     */
    constructor(name: any);
    /**
     * Returns the type name of the argument
     * @return {string} the type name of the argument
     */
    getName(): any;
}
