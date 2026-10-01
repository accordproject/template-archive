/**
 * An argument has a name and type.
 * @class
 * @memberof module:cicero-core
 */
export default class Argument {
    name: any;
    type: any;
    /**
     * Create the Function.
     * <p>
     * @param {string} name - The name of the function
     * @param {ArgumentType} type - The argument type
     */
    constructor(name: any, type: any);
    /**
     * Returns the name of the argument
     * @return {string} the name of the argument
     */
    getName(): any;
    /**
     * Returns the type of the argument
     * @return {Argument} the type of the argument
     */
    getType(): any;
}
