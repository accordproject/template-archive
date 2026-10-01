/**
 * A utility to persist templates to data sources.
 * @class
 * @abstract
 * @private
 */
export default class TemplateSaver {
    /**
     * Persists this template to a Cicero Template Archive (cta) file.
     * @param {Template} template - the template to persist
     * @param {string} [language] - target language for the archive
     * @param {Object} [options] - JSZip options
     * @param {Buffer} logoBuffer - Bytes data of the PNG file
     * @return {Promise<Buffer>} the zlib buffer
     */
    static toArchive(template: any, language: any, options: any): Promise<Buffer<ArrayBufferLike>>;
}
