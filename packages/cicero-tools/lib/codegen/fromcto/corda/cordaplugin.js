/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

const AbstractPlugin = require('@accordproject/concerto-tools').CodeGen.AbstractPlugin;

/**
 * Simple Corda plug-in class for code-generation.
 */
class CordaPlugin extends AbstractPlugin {
    /**
     * Additional imports to generate in classes
     * @param {ClassDeclaration} clazz - the clazz being visited
     * @param {Object} parameters  - the parameter
     * @param {Object} options  - the visitor options
     */
    addClassImports(clazz, parameters, options) {
        // add Corda-specific imports
        parameters.fileWriter.writeLine(0, 'import net.corda.core.serialization.CordaSerializable;');
        if(clazz.getFullyQualifiedName() === 'org.accordproject.money.MonetaryAmount') {
            parameters.fileWriter.writeLine(0, 'import java.math.BigDecimal;');
            parameters.fileWriter.writeLine(0, 'import java.util.Currency;');
            parameters.fileWriter.writeLine(0, 'import net.corda.core.contracts.Amount;');
        }
    }

    /**
     * Additional annotations to generate in classes
     * @param {ClassDeclaration} clazz - the clazz being visited
     * @param {Object} parameters  - the parameter
     * @param {Object} options  - the visitor options
     */
    addClassAnnotations(clazz, parameters, options) {
        parameters.fileWriter.writeLine(0, '@CordaSerializable' );
    }

    /**
     * Additional methods to generate in classes
     * @param {ClassDeclaration} clazz - the clazz being visited
     * @param {Object} parameters  - the parameter
     * @param {Object} options  - the visitor options
     */
    addClassMethods(clazz, parameters, options) {
        // add Corda-specific class methods
        if(clazz.getFullyQualifiedName() === 'org.accordproject.money.MonetaryAmount') {
            parameters.fileWriter.writeLine(1, `
   public Amount<Currency> getCurrency() {
        return Amount.fromDecimal(BigDecimal.valueOf(doubleValue), Currency.getInstance(currencyCode.name()));
   }
`
            );
        }
    }

    /**
     * Additional annotations to generate in enums
     * @param {EnumDeclaration} enumDecl - the enum being visited
     * @param {Object} parameters  - the parameter
     * @param {Object} options  - the visitor options
     */
    addEnumAnnotations(enumDecl, parameters, options) {
        parameters.fileWriter.writeLine(0, '@CordaSerializable' );
    }
}

module.exports = CordaPlugin;
