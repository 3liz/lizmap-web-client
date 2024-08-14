#!/usr/bin/python

import json
import sys

from datetime import datetime


if len(sys.argv) != 2:
    print('One argument is required.')
    exit(0)

tag_name = sys.argv[1]
tag = tag_name.split('.')
if len(tag) > 4 or len(tag) <= 2:
    print('Tag must be major.minor.bugfix or major.minor.bugfix-prefix.number')
    exit(0)

major = tag[0]
minor = tag[1]

json_file = 'versions.json'
with open(json_file, 'r') as f:
    versions = json.load(f)

for version in versions:
    if version['branch'] == f'{major}.{minor}':
        date = datetime.today().strftime('%Y-%m-%d')
        version['latest_release_date'] = date

        if not version['first_release_date']:
            # First stable release on the branch
            print(f'First release for branch for {major}.{minor}')
            # 'bugfix' variable must be equal to 0
            version['first_release_date'] = date
            if len(tag) == 3:
                # major.minor.bugfix
                if version['status'] in ('dev', 'feature_freeze', 'stable') and len(tag) == 3:
                    # We only update if the status is not retired or security_bugfix_only
                    version['status'] = "stable"
            elif len(tag) == 4 and 'rc' in tag[2] and version['status'] in ('dev', 'feature_freeze'):
                # major.minor.bugfix-rc.1
                version['status'] = "feature_freeze"

        version['latest_release_version'] = f'{tag_name}'
        break
else:
    print(f'Branch for {tag_name} is not found.')
    exit(0)

with open('versions.json', 'w') as f:
    json.dump(versions, f, sort_keys=True, indent=4)
    f.write("\n")

print(f"Version {tag_name} added into versions.json")
