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

const DATE_TIME_GRAMMAR_EN = `
# short month name
MMM -> "Jan" {% (d) => {return 0;}%} | 
       "Feb" {% (d) => {return 1;}%} | 
	   "Mar" {% (d) => {return 2;}%} |
	   "Apr" {% (d) => {return 3;}%} | 
	   "May" {% (d) => {return 4;}%} |
	   "Jun" {% (d) => {return 5;}%} |
	   "Jul" {% (d) => {return 6;}%} |
	   "Aug" {% (d) => {return 7;}%} |
	   "Sep" {% (d) => {return 8;}%} |
	   "Oct" {% (d) => {return 9;}%} |
	   "Nov" {% (d) => {return 10;}%} |
	   "Dec" {% (d) => {return 11;}%}

# long month name
MMMM -> "January" {% (d) => {return 0;}%} | 
       "February" {% (d) => {return 1;}%} | 
	   "March" {% (d) => {return 2;}%} |
	   "April" {% (d) => {return 3;}%} | 
	   "May" {% (d) => {return 4;}%} |
	   "June" {% (d) => {return 5;}%} |
	   "July" {% (d) => {return 6;}%} |
	   "August" {% (d) => {return 7;}%} |
	   "September" {% (d) => {return 8;}%} |
	   "October" {% (d) => {return 9;}%} |
	   "November" {% (d) => {return 10;}%} |
	   "December" {% (d) => {return 11;}%}
`;

module.exports = DATE_TIME_GRAMMAR_EN;