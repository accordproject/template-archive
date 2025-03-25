export = TemplateSaver;
/**
 * A utility to persist templates to data sources.
 * @class
 * @abstract
 * @private
 */
declare class TemplateSaver {
    /**
     * Persists this template to a Cicero Template Archive (cta) file.
     * @param {Template} template - the template to persist
     * @param {string} [language] - target language for the archive
     * @param {Object} [options] - JSZip options
     * @param {Buffer} logoBuffer - Bytes data of the PNG file
     * @return {Promise<Buffer>} the zlib buffer
     */
    static toArchive(template: Template, language?: string, options?: any): Promise<Buffer>;
}
