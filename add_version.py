#!/usr/bin/python

import json
import sys

from datetime import datetime


if len(sys.argv) != 2:
    print('One argument is required.')
    exit(0)

tag = sys.argv[1].split('.')
if len(tag) != 3:
    print('Tag must be major.minor.bugfix')
    exit(0)

for item in tag:
    try:
        int(item)
    except ValueError:
        print('The component "{}" is not an integer, skipping the tag {}.'.format(item, sys.argv[1]))
        exit(0)

major, minor, bugfix = tag

json_file = 'versions.json'
with open(json_file, 'r') as f:
    versions = json.load(f)

for version in versions:
    if version['branch'] == '{}.{}'.format(major, minor):
        version['latest_release_date'] = datetime.today().strftime('%Y-%m-%d')
        version['latest_release_version'] = '{}.{}.{}'.format(major, minor, bugfix)
        break
else:
    print('Branch for {}.{}.{} is not found.'.format(major, minor, bugfix))
    exit(0)

with open('versions.json', 'w') as f:
    json.dump(versions, f, sort_keys=True, indent=4)

print("Version {} added into versions.json".format(sys.argv[1]))
