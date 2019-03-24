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

const DateTimeFormatParser = require('../lib/datetimeformatparser');
const chai = require('chai');

chai.should();
chai.use(require('chai-things'));
chai.use(require('chai-as-promised'));

describe('DateTimeFormatParser', () => {

    describe('#parseDateTimeFormatField', () => {

        it('should identity hours', async function() {
            DateTimeFormatParser.parseDateTimeFormatField('H').should.eql('hours');
            DateTimeFormatParser.parseDateTimeFormatField('HH').should.eql('hours');
        });
        it('should identity days', async function() {
            DateTimeFormatParser.parseDateTimeFormatField('D').should.eql('days');
            DateTimeFormatParser.parseDateTimeFormatField('DD').should.eql('days');
        });

        it('should identity months', async function() {
            DateTimeFormatParser.parseDateTimeFormatField('M').should.eql('months');
            DateTimeFormatParser.parseDateTimeFormatField('MM').should.eql('months');
            DateTimeFormatParser.parseDateTimeFormatField('MMM').should.eql('months');
            DateTimeFormatParser.parseDateTimeFormatField('MMMM').should.eql('months');
        });

        it('should identity minutes', async function() {
            DateTimeFormatParser.parseDateTimeFormatField('mm').should.eql('minutes');
        });

        it('should identity years', async function() {
            DateTimeFormatParser.parseDateTimeFormatField('YYYY').should.eql('years');
        });

        it('should identity seconds', async function() {
            DateTimeFormatParser.parseDateTimeFormatField('ss').should.eql('seconds');
        });

        it('should identity milliseconds', async function() {
            DateTimeFormatParser.parseDateTimeFormatField('SSS').should.eql('milliseconds');
        });

        it('should identity timezone', async function() {
            DateTimeFormatParser.parseDateTimeFormatField('Z').should.eql('timezone');
        });

        it('should return null for anything else', async function() {
            (DateTimeFormatParser.parseDateTimeFormatField('a') === null).should.be.true;
        });
    });

    describe('#buildDateTimeFormatRule', () => {

        it('should parse D MMM YYYY HH:mm:ss.SSSZ', async function() {
            const result = DateTimeFormatParser.buildDateTimeFormatRule('"D MMM YYYY HH:mm:ss.SSSZ"');
            result.tokens.should.eql('D  " " MMM  " " YYYY  " " HH  ":" mm  ":" ss  "." SSS Z');
            result.action.should.eql('{% (d) => {return {"$class" : "ParsedDateTime",   "days": d[0],   "months": d[2],   "years": d[4],   "hours": d[6],   "minutes": d[8],   "seconds": d[10],   "milliseconds": d[12],   "timezone": d[13]};}%}');
        });

        it('should parse D MMM YYYY HH:mm:ss.SSS Z', async function() {
            const result = DateTimeFormatParser.buildDateTimeFormatRule('"D MMM YYYY HH:mm:ss.SSS Z"');
            result.tokens.should.eql('D  " " MMM  " " YYYY  " " HH  ":" mm  ":" ss  "." SSS Z');
            result.action.should.eql('{% (d) => {return {"$class" : "ParsedDateTime",   "days": d[0],   "months": d[2],   "years": d[4],   "hours": d[6],   "minutes": d[8],   "seconds": d[10],   "milliseconds": d[12],   "timezone": d[13]};}%}');
        });

        it('should parse DD MMM YYYY HH:mm:ss.SSS Z', async function() {
            const result = DateTimeFormatParser.buildDateTimeFormatRule('"DD MMM YYYY HH:mm:ss.SSS Z"');
            result.tokens.should.eql('DD  " " MMM  " " YYYY  " " HH  ":" mm  ":" ss  "." SSS Z');
            result.action.should.eql('{% (d) => {return {"$class" : "ParsedDateTime",   "days": d[0],   "months": d[2],   "years": d[4],   "hours": d[6],   "minutes": d[8],   "seconds": d[10],   "milliseconds": d[12],   "timezone": d[13]};}%}');
        });

        it('should parse D M YYYY', async function() {
            const result = DateTimeFormatParser.buildDateTimeFormatRule('"D M YYYY"');
            result.tokens.should.eql( 'D  " " M  " " YYYY ');
            result.action.should.eql('{% (d) => {return {"$class" : "ParsedDateTime",   "days": d[0],   "months": d[2],   "years": d[4]};}%}');
        });

        it('should parse DD/MM/YYYY', async function() {
            const result = DateTimeFormatParser.buildDateTimeFormatRule('"DD/MM/YYYY"');
            result.tokens.should.eql( 'DD  "/" MM  "/" YYYY ');
            result.action.should.eql('{% (d) => {return {"$class" : "ParsedDateTime",   "days": d[0],   "months": d[2],   "years": d[4]};}%}');
        });

        it('should parse YYYY-MM-DD', async function() {
            const result = DateTimeFormatParser.buildDateTimeFormatRule('"YYYY-MM-DD"');
            result.tokens.should.eql( 'YYYY  "-" MM  "-" DD ');
            result.action.should.eql('{% (d) => {return {"$class" : "ParsedDateTime",   "years": d[0],   "months": d[2],   "days": d[4]};}%}');
        });

        it('should parse MM/DD/YYYY', async function() {
            const result = DateTimeFormatParser.buildDateTimeFormatRule('"MM/DD/YYYY"');
            result.tokens.should.eql( 'MM  "/" DD  "/" YYYY ');
            result.action.should.eql('{% (d) => {return {"$class" : "ParsedDateTime",   "months": d[0],   "days": d[2],   "years": d[4]};}%}');
        });

        it('should parse MM/DD/YYYY HH:mm:ss Z', async function() {
            const result = DateTimeFormatParser.buildDateTimeFormatRule('"MM/DD/YYYY HH:mm:ss Z"');
            result.tokens.should.eql( 'MM  "/" DD  "/" YYYY  " " HH  ":" mm  ":" ss Z');
            result.action.should.eql('{% (d) => {return {"$class" : "ParsedDateTime",   "months": d[0],   "days": d[2],   "years": d[4],   "hours": d[6],   "minutes": d[8],   "seconds": d[10],   "timezone": d[11]};}%}');
        });

        it('should fail to parse MM/MMM/YYYY', async function() {
            (()=> DateTimeFormatParser.buildDateTimeFormatRule('"MM/MMM/YYYY"')).should.throw('Duplicate month');
        });

        it('should fail to parse D/DD/YYYY', async function() {
            (()=> DateTimeFormatParser.buildDateTimeFormatRule('"D/DD/YYYY"')).should.throw('Duplicate day');
        });

    });
});