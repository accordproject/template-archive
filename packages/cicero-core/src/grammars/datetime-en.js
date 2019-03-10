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
MMM -> "Jan" {% (d) => {return 1;}%} | 
       "Feb" {% (d) => {return 2;}%} | 
	   "Mar" {% (d) => {return 3;}%} |
	   "Apr" {% (d) => {return 4;}%} | 
	   "May" {% (d) => {return 5;}%} |
	   "Jun" {% (d) => {return 6;}%} |
	   "Jul" {% (d) => {return 7;}%} |
	   "Aug" {% (d) => {return 8;}%} |
	   "Sep" {% (d) => {return 9;}%} |
	   "Oct" {% (d) => {return 10;}%} |
	   "Nov" {% (d) => {return 11;}%} |
	   "Dec" {% (d) => {return 12;}%}

# long month name
MMMM -> "January" {% (d) => {return 1;}%} | 
       "February" {% (d) => {return 2;}%} | 
	   "March" {% (d) => {return 3;}%} |
	   "April" {% (d) => {return 4;}%} | 
	   "May" {% (d) => {return 5;}%} |
	   "June" {% (d) => {return 6;}%} |
	   "July" {% (d) => {return 7;}%} |
	   "August" {% (d) => {return 8;}%} |
	   "September" {% (d) => {return 9;}%} |
	   "October" {% (d) => {return 10;}%} |
	   "November" {% (d) => {return 11;}%} |
	   "December" {% (d) => {return 12;}%}
`;

module.exports = DATE_TIME_GRAMMAR_EN;