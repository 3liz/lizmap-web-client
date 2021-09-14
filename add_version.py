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
        print(f'The component "{item}" is not an integer, skipping the tag {sys.argv[1]}.')
        exit(0)

major, minor, bugfix = tag

json_file = 'versions.json'
with open(json_file, 'r') as f:
    versions = json.load(f)

for version in versions:
    if version['branch'] == f'{major}.{minor}':
        version['latest_release_date'] = datetime.today().strftime('%Y-%m-%d')
        version['latest_release_version'] = f'{major}.{minor}.{bugfix}'
        break
else:
    print(f'Branch for {major}.{minor}.{bugfix} is not found.')
    exit(0)

with open('versions.json', 'w') as f:
    json.dump(versions, f, sort_keys=True, indent=4)

print(f"Version {sys.argv[1]} added into versions.json")
