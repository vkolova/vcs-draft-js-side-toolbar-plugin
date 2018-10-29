#!/bin/bash

if [ "$#" -ne 1 ]; then
    echo "usage: ./publish.sh version"
    exit 1
fi

version="$1"

npm run build
tar cvzf "vcs-draft-js-side-toolbar-plugin-${version}.tar.gz" lib package.json
aws s3 cp --acl public-read "vcs-draft-js-side-toolbar-plugin-${version}.tar.gz" "s3://vectorworks-cloud-static/packages/vcs-draft-js-side-toolbar-plugin-${version}.tar.gz"
rm -rf "vcs-draft-js-side-toolbar-plugin-${version}.tar.gz"
