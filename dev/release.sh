#!/bin/sh

set -e

if [ "$#" -ne 2 ]; then
    echo "Bad numbers of arguments"
    echo "This script is to prepare a new release."
    echo "release.sh YYYY-MM-DD VERSION"
    echo "Be careful, original files will be updated"
    exit 1
fi

DATE="$1"
VERSION="$2"

echo "## Updating files to be able to release a new version of Lizmap ####"

echo "Date    : "$1
echo "Version : "$2

echo "README.md"
sed -i "1 s/[.0-9-]\+$/$2/" README.md

echo "lizmap/project.xml"
sed -i "s@<version date=\"[0-9-]\+\">[a-z.0-9-]\+</version>@<version date=\"$1\">$2</version>@g" lizmap/project.xml

for file in lizmap/modules/**/module.xml
do
    sed -i "s@<version date=\"[0-9-]\+\">[a-z.0-9-]\+</version>@<version date=\"$1\">$2</version>@g" "$file"
    echo "$file"
done

git add README.md
git add lizmap/project.xml
git add lizmap/modules/*/module.xml
git commit -m "Bump to version $2"
