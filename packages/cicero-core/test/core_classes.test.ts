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

import Argument from '../src/argument';
import ArgumentType from '../src/argumenttype';
import CiceroFunction from '../src/function';
import Contract from '../src/contract';

describe('Core Classes', () => {
    describe('Argument', () => {
        it('should create an Argument', () => {
            const arg = new Argument('name', 'type');
            expect(arg.getName()).toBe('name');
            expect(arg.getType()).toBe('type');
        });
    });

    describe('ArgumentType', () => {
        it('should create an ArgumentType', () => {
            const type = new ArgumentType('type');
            expect(type.getName()).toBe('type');
        });
    });

    describe('Function', () => {
        it('should create a Function', () => {
            const func = new CiceroFunction('name', []);
            expect(func.getName()).toBe('name');
            expect(func.getArguments()).toEqual([]);
        });
    });

    describe('Contract', () => {
        it('should have a constructor', () => {
            expect(Contract).not.toBeNull();
        });
    });
});
