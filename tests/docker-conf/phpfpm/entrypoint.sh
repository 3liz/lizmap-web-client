#!/bin/sh

set -e
set -x

/bin/appctl.sh launch

echo "launch exec $@"
exec "$@"
