#!/bin/bash

set -e
set -x

if [ "$1" != "appctl.sh" ]; then
  /bin/appctl.sh launch
fi
