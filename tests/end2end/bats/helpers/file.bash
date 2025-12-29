# Fail and display path of the file or directory if it does not exist.
# This function is the logical complement of `assert_not_exists'.
#
# Globals:
#   BATSLIB_FILE_PATH_REM
#   BATSLIB_FILE_PATH_ADD
# Arguments:
#   $1 - path
# Returns:
#   0 - file or directory exists
#   1 - otherwise
# Outputs:
#   STDERR - details, on failure
assert_exists() {
  local -r file="$1"
  if [[ ! -e "$file" ]]; then
    local -r rem="${BATSLIB_FILE_PATH_REM-}"
    local -r add="${BATSLIB_FILE_PATH_ADD-}"
    batslib_print_kv_single 4 'path' "${file/$rem/$add}" \
      | batslib_decorate 'file or directory does not exist' \
      | fail
  fi
}
# Fail and display path of the file (or directory) if it exists. This
# function is the logical complement of `assert_exists'.
#
# Globals:
#   BATSLIB_FILE_PATH_REM
#   BATSLIB_FILE_PATH_ADD
# Arguments:
#   $1 - path
# Returns:
#   0 - file does not exist
#   1 - otherwise
# Outputs:
#   STDERR - details, on failure
assert_not_exists() {
  local -r file="$1"
  if [[ -e "$file" ]]; then
    local -r rem="${BATSLIB_FILE_PATH_REM-}"
    local -r add="${BATSLIB_FILE_PATH_ADD-}"
    batslib_print_kv_single 4 'path' "${file/$rem/$add}" \
      | batslib_decorate 'file or directory exists, but it was expected to be absent' \
      | fail
  fi
}

# Fail and display the number of file found in the directory if it differs
# from expected.
#
# Globals:
#   BATSLIB_FILE_PATH_REM
#   BATSLIB_FILE_PATH_ADD
# Arguments:
#   $1 - path
#   $2 - nb_files
# Returns:
#   0 - file does not exist
#   1 - otherwise
# Outputs:
#   STDERR - details, on failure
assert_count_files() {
  local -r file="$1"
  local -r nb_files="$(find "$file" -type f | wc -l)"
  if [[ "$2" != "$nb_files" ]]; then
    local -r rem="${BATSLIB_FILE_PATH_REM-}"
    local -r add="${BATSLIB_FILE_PATH_ADD-}"
    batslib_print_kv_single 4 'path' "${file/$rem/$add}" \
      | batslib_decorate "contains $nb_files files, but it was expected to contain $2" \
      | fail
  fi
}
