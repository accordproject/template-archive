/**
 * A function that has a name and arguments.
 * @class
 * @memberof module:cicero-core
 */
export default class Function {
    name: any;
    arguments: any;
    /**
     * Create the Function.
     * <p>
     * @param {string} name - The name of the function
     * @param {Argument[]} args - The function arguments
     */
    constructor(name: any, args: any);
    /**
     * Returns the name of the function
     * @return {string} the name of the function
     */
    getName(): any;
    /**
     * Returns the arguments for a function
     * @return {Argument[]} the arguments for the function
     */
    getArguments(): any;
}
