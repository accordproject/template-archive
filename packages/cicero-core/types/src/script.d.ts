export = Script;
/**
 * <p>
 * An executable script.
 * </p>
 * @private
 * @class
 * @memberof module:cicero-core
 */
declare class Script {
    /**
     * Create the Script.
     * <p>
     * @param {ModelManager} modelManager - The ModelManager associated with this Script
     * @param {string} identifier - The identifier of the script
     * @param {string} language - The language type of the script
     * @param {string} contents - The contents of the script
     * @param {string} contractName - The name of the contract if known or null
     */
    constructor(modelManager: ModelManager, identifier: string, language: string, contents: string, contractName: string);
    modelManager: ModelManager;
    identifier: string;
    contractName: string;
    language: string;
    contents: string;
    /**
     * Returns the identifier of the script
     * @return {string} the identifier of the script
     */
    getIdentifier(): string;
    /**
     * Returns the name of the contract for this script
     * @return {string} the name of the contract, if known
     */
    getContractName(): string;
    /**
     * Returns the language of the script
     * @return {string} the language of the script
     */
    getLanguage(): string;
    /**
     * Returns the contents of the script
     * @return {string} the content of the script
     */
    getContents(): string;
}
