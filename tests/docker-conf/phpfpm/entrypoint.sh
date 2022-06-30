#!/bin/sh

set -e
set -x

if [ "$1" != "appctl.sh" ]; then
  /bin/appctl.sh launch
fi

echo "launch exec $@"
exec "$@"
