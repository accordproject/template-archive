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

const MONETARY_AMOUNT_GRAMMAR =
`
# currency code
CCC -> [A-Z] [A-Z] [A-Z] {% (d) => { return '' + d[0] + d[1] + d[2];} %}

# currency symbol
K -> "€" {% (d) => { return "EUR";}%} | 
     "£" {% (d) => {return "GBP";}%} | 
	   "zł" {% (d) => {return "PLN";}%} |
	   "$" {% (d) => {return "USD";}%} | 
	   "¥" {% (d) => {return "YEN";}%} |
	   [A-Z] [A-Z] [A-Z] {% (d) => {return d;} %}
`;

module.exports = MONETARY_AMOUNT_GRAMMAR;