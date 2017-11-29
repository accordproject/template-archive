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

const Field = require('composer-common').Field;
const ModelManager = require('composer-common').ModelManager;
const ModelFile = require('composer-common').ModelFile;
const RelationshipDeclaration = require('composer-common').RelationshipDeclaration;
const EnumDeclaration = require('composer-common').EnumDeclaration;
const EnumValueDeclaration = require('composer-common').EnumValueDeclaration;
const ClassDeclaration = require('composer-common').ClassDeclaration;
const util = require('util');
const debug = require('debug')('cicero:grammarvisitor');

/**
 * Converts composer models and types to Nearley rules
 *
 * @private
 * @class
 * @memberof module:cicero-core
 */
class GrammarVisitor {
    /**
     * Visitor design pattern
     * @param {Object} thing - the object being visited
     * @param {Object} parameters  - the parameter
     * @return {Object} the result of visiting or null
     * @private
     */
    visit(thing, parameters) {
        if (thing instanceof ModelManager) {
            return this.visitModelManager(thing, parameters);
        } else if (thing instanceof ModelFile) {
            return this.visitModelFile(thing, parameters);
        } else if (thing instanceof EnumDeclaration) {
            return this.visitEnumDeclaration(thing, parameters);
        } else if (thing instanceof ClassDeclaration) {
            return this.visitClassDeclaration(thing, parameters);
        } else if (thing instanceof Field) {
            return this.visitField(thing, parameters);
        } else if (thing instanceof RelationshipDeclaration) {
            return this.visitRelationshipDeclaration(thing, parameters);
        } else if (thing instanceof EnumValueDeclaration) {
            return this.visitEnumValueDeclaration(thing, parameters);
        } else {
            throw new Error('Unrecognised type: ' + typeof thing + ', value: ' + util.inspect(thing, { showHidden: true, depth: 2 }));
        }
    }

    /**
     * Visitor design pattern
     * @param {ModelManager} modelManager - the object being visited
     * @param {Object} parameters - the parameter
     * @return {Object} the result of visiting or null
     * @private
     */
    visitModelManager(modelManager, parameters) {
        debug('entering visitModelManager');

        // Save the model manager so that we have access to it later.
        parameters.modelManager = modelManager;

        // Visit all of the files in the model manager.
        modelManager.getModelFiles().forEach((modelFile) => {
            modelFile.accept(this, parameters);
        });

        // generate the primitive types
        parameters.writer.writeLine(0,
            `
# Basic types
NUMBER -> [0-9] 
{% (d) => {return parseInt(d[0]);}%}

DOUBLE_NUMBER -> NUMBER NUMBER
{% (d) => {return '' + d[0] + d[1]}%}

MONTH -> DOUBLE_NUMBER
DAY -> DOUBLE_NUMBER
YEAR -> DOUBLE_NUMBER DOUBLE_NUMBER
{% (d) => {return '' + d[0] + d[1]}%}

DATE -> MONTH "/" DAY "/" YEAR
{% (d) => {return '' + d[0] + '/' + d[2] + '/' + d[4]}%}

Word -> [\\S]:*
{% (d) => {return d[0].join('');}%}

BRACKET_PHRASE -> "[" Word (__ Word):* "]" {% ((d) => {return d[1] + ' ' + flatten(d[2]).join(" ");}) %}

String -> dqstring {% id %}
Double -> decimal {% id %}
Integer -> int {% id %}
Long -> int {% id %}
Boolean -> "true" {% id %} | "false" {% id %}
DateTime -> DATE  {% id %}`);

        return null;
    }

    /**
     * Visitor design pattern
     * @param {ModelFile} modelFile - the object being visited
     * @param {Object} parameters - the parameter
     * @return {Object} the result of visiting or null
     * @private
     */
    visitModelFile(modelFile, parameters) {
        debug('entering visitModelFile', modelFile.getNamespace());

        // Save the model file so that we have access to it later.
        parameters.modelFile = modelFile;

        // Visit all of class declarations, but ignore the abstract ones and system ones.
        modelFile.getAllDeclarations()
            .filter((declaration) => {
                return !(declaration.isAbstract() || declaration.isSystemType());
            })
            .forEach((declaration) => {
                declaration.accept(this, parameters);
            });
        return null;
    }

    /**
     * Visitor design pattern
     * @param {EnumDeclaration} enumDeclaration - the object being visited
     * @param {Object} parameters  - the parameter
     * @return {Object} the result of visiting or null
     * @private
     */
    visitEnumDeclaration(enumDeclaration, parameters) {

        let result = '';
        enumDeclaration.getOwnProperties().forEach((property) => {
            if(result.length>0) {
                result += ' | ';
            }
            result += property.accept(this,parameters);
        });

        parameters.writer.writeLine(0, `${enumDeclaration.getName()} ->  ${result}`);
        return result;
    }

    /**
     * Visitor design pattern
     * @param {ClassDeclaration} classDeclaration - the object being visited
     * @param {Object} parameters - the parameter
     * @return {Object} the result of visiting or null
     * @private
     */
    visitClassDeclaration(classDeclaration, parameters) {
        debug('entering visitClassDeclaration', classDeclaration.getName());

        // do not visit the template model itself, as we need to generate
        // that from the template grammar, including all the source text.
        if(!classDeclaration.getDecorator('AccordTemplateModel')) {
            let result = '';

            // Walk over all of the properties of this class and its super classes.
            classDeclaration.getProperties().forEach((property) => {
                if(result.length>0) {
                    result += ' __ ';
                }
                result += property.accept(this, parameters);
            });

            parameters.writer.writeLine(0, `${classDeclaration.getName()} ->  ${result}
{% (data) => {
      return {
         $class : "${classDeclaration.getFullyQualifiedName()}",`);

            // populate all the properties
            classDeclaration.getProperties().forEach((property,index) => {
                const sep = index < classDeclaration.getProperties().length-1 ? ',' : '';
                parameters.writer.writeLine(3, `${property.getName()} : data[${index*2}]${sep}`);
            });

            parameters.writer.writeLine(2, '};');
            parameters.writer.writeLine(1, '}');
            parameters.writer.writeLine(0, '%}\n');
            return null;
        }
    }

    /**
     * Visitor design pattern
     * @param {Field} field - the object being visited
     * @param {Object} parameters  - the parameter
     * @return {Object} the result of visiting or null
     * @private
     */
    visitField(field, parameters) {

        debug('entering visitField', field.getName());

        let qualifier = '';

        if(field.isArray()) {
            if(field.isOptional()) {
                qualifier = ':*';
            }
            else {
                qualifier = ':+';
            }
        }
        else {
            if(field.isOptional()) {
                qualifier = ':?';
            }
        }

        return this.toGrammarType(field.getType()) + qualifier;
    }

    /**
     * Visitor design pattern
     * @param {EnumValueDeclaration} enumValueDeclaration - the object being visited
     * @param {Object} parameters  - the parameter
     * @return {Object} the result of visiting or null
     * @private
     */
    visitEnumValueDeclaration(enumValueDeclaration, parameters) {
        debug('entering visitEnumValueDeclaration', enumValueDeclaration.getName());
        return `"${enumValueDeclaration.getName()}" {% id %}`;
    }

    /**
     * Visitor design pattern
     * @param {Relationship} relationship - the object being visited
     * @param {Object} parameters  - the parameter
     * @return {Object} the result of visiting or null
     * @private
     */
    visitRelationshipDeclaration(relationship, parameters) {
        debug('entering visitRelationshipDeclaration', relationship.getName());
        return 'String';
    }

    /**
     * Converts a Composer type to a Nearley grammar type.
     * @param {string} type  - the composer type
     * @return {string} the corresponding type to use for Nearley
     * @private
     */
    toGrammarType(type) {
        return type;
    }
}

module.exports = GrammarVisitor;
