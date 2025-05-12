#!/usr/bin/python

import json
import sys

from datetime import datetime


if len(sys.argv) != 2:
    print('One argument is required with the version number, like 3.9.0')
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
    if version['branch'] != f'{major}.{minor}':
        continue

    # Current date of the release
    date = datetime.today().strftime('%Y-%m-%d')

    # As the script is running, it is currently the latest release for this branch
    version['latest_release_date'] = date
    version['latest_release_version'] = f'{tag_name}'

    # Update "status" if possible automatically, based on version name
    if len(tag) == 3:
        # major.minor.bugfix
        if version['status'] in ('dev', 'feature_freeze', 'stable') and len(tag) == 3:
            print("Update to 'stable' as the status is neither 'retired' nor 'security_bugfix_only'")
            version['status'] = "stable"
    elif len(tag) == 4 and 'rc' in tag[2] and version['status'] in ('dev', 'feature_freeze'):
        # major.minor.bugfix-rc.1
        print("Update to 'feature_freeze' as it seems an RC version")
        version['status'] = "feature_freeze"

    # Date of the first release should be the "first stable release".
    # So until the version is not "stable", the date is updated
    if not version['first_release_date'] or version['status'] in ('dev', 'feature_freeze') or tag_name.endswith('.0'):
        print(f'Update the first release for branch for {major}.{minor}')
        # 'bugfix' variable must be equal to 0
        version['first_release_date'] = date

    break
else:
    print(f'Branch for {tag_name} is not found.')
    exit(0)

with open('versions.json', 'w') as f:
    json.dump(versions, f, sort_keys=True, indent=4)
    f.write("\n")

print(f"Version {tag_name} added into versions.json")
