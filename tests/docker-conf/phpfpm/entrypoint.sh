#!/bin/sh

set -e
set -x

sh /bin/appctl.sh launch

echo "launch exec $@"
exec "$@"
