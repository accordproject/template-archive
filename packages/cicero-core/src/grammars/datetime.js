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

const DATE_TIME_GRAMMAR =
`
@{%
function toNumber(d) {
	return parseInt('' + d[0] + d[1]);
}
%}

# day ordinal (1 to 31)
D -> [1-31]
{% (d) => {return parseInt(d[0])}%}

# day ordinal, with leading zero (00 to 31), disallow 00
DD -> [0-3] [0-9] {% (d, location, reject) => 
   {
	   const result = toNumber(d); 
	   if (result === 0 || result > 31) {
		   return reject;
	   }
	   else {
		   return result;
	   }
   } %} | 
      [3] [0-1] {% (d) => {return toNumber(d)}%}

# month ordinal (1 to 12)
M -> [1-12]
{% (d) => {return parseInt(d[0])}%}

# month ordinal, with leading zero (01 to 12)
MM -> [0] [1-9] {% (d) => {return toNumber(d)}%} |
      [1] [0-2] {% (d) => {return toNumber(d)}%}
	   
# 24 hour (0 to 23)
H -> [0-9]
{% (d) => {return parseInt(d)}%}

# 24 hour, leading zero (00 to 23)
HH -> [0-1] [0-9] {% (d) => {return toNumber(d)}%} |
      [2] [0-3] {% (d) => {return toNumber(d)}%}

# minute, leading zero (00 to 59)
mm -> [0-5] [0-9] {% (d) => {return toNumber(d)}%}

# second, leading zero (00 to 59)
ss -> [0-5] [0-9] {% (d) => {return toNumber(d)}%}

# milliseconds, 3 digits (000 to 999)
SSS -> [0-9] [0-9] [0-9]
{% (d) => {return parseInt('' + d[0] + d[1] + d[2])}%}

# year, 4 digits (0000 to 9999)
YYYY ->[0-9] [0-9] [0-9] [0-9]
{% (d) => {return parseInt('' + d[0] + d[1] + d[2] + d[3])}%}

# Timezone Offset
Z -> ("+"|"-") [0-9] [0-9] ":" [0-9] [0-9]
{% (d) => {return d[0] + d[1] + d[2] + ":" + d[4] + d[5]}%}
`;

module.exports = DATE_TIME_GRAMMAR;