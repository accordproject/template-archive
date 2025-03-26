export = TemplateInstance;
/**
 * A TemplateInstance is an instance of a Clause or Contract template. It is executable business logic, linked to
 * a natural language (legally enforceable) template.
 * A TemplateInstance must be constructed with a template and then prior to execution the data for the clause must be set.
 * Set the data for the TemplateInstance by either calling the setData method or by
 * calling the parse method and passing in natural language text that conforms to the template grammar.
 * @public
 * @abstract
 * @class
 */
declare class TemplateInstance {
    /**
     * Create the Clause and link it to a Template.
     * @param {Template} template  - the template for the clause
     */
    constructor(template: Template);
    template: Template;
    data: any;
    concertoData: any;
    ciceroMarkTransformer: any;
    templateMarkTransformer: any;
    /**
     * Set the data for the clause
     * @param {object} data  - the data for the clause, must be an instance of the
     * template model for the clause's template. This should be a plain JS object
     * and will be deserialized and validated into the Concerto object before assignment.
     */
    setData(data: object): void;
    /**
     * Get the data for the clause. This is a plain JS object. To retrieve the Concerto
     * object call getConcertoData().
     * @return {object} - the data for the clause, or null if it has not been set
     */
    getData(): object;
    /**
     * Get the data for the clause. This is a Concerto object. To retrieve the
     * plain JS object suitable for serialization call toJSON() and retrieve the `data` property.
     * @return {object} - the data for the clause, or null if it has not been set
     */
    getDataAsConcertoObject(): object;
    /**
     * Returns the identifier for this clause. The identifier is the identifier of
     * the template plus '-' plus a hash of the data for the clause (if set).
     * @return {String} the identifier of this clause
     */
    getIdentifier(): string;
    /**
     * Returns the template for this clause
     * @return {Template} the template for this clause
     */
    getTemplate(): Template;
    /**
     * Returns a JSON representation of the clause
     * @return {object} the JS object for serialization
     */
    toJSON(): object;
}
