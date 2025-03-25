export = DefaultArchiveLoader;
/**
 * A default CompositeArchiveLoader implementation which supports
 * ap://, github://, http:// and https:// URLs.
 * @class
 * @private
 */
declare class DefaultArchiveLoader extends CompositeArchiveLoader {
}
import CompositeArchiveLoader = require("./compositearchiveloader");
