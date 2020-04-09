# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
# 
# http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#

# Auto-completion script for cicero commands
# > cicero pa[TAB]
# This will be auto-completed to cicero parse

_cicero_entry='cicero'

_cicero_commands='parse draft normalize trigger invoke initialize archive compile get'

_cicero_options='--version --help'

_cicero()
{
  local cur prev
  COMPREPLY=()
  cur="${COMP_WORDS[COMP_CWORD]}"
  prev="${COMP_WORDS[COMP_CWORD-1]}"

  case "$cur" in
    -*) COMPREPLY=( $(compgen -W "${_cicero_options}" -- ${cur}) ) ;;
    *) COMPREPLY=( $(compgen -W "${_cicero_commands}" -- ${cur}) ) ;;
  esac

  return 0
}

complete -F _cicero $_cicero_entry
