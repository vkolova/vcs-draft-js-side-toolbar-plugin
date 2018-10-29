#!/bin/bash

npm run build
cd lib
tar cvzf vcs-draft-js-side-toolbar-plugin-v18.9.10-1.tar.gz *
aws s3 cp --acl public-read vcs-draft-js-side-toolbar-plugin-v18.9.10-1.tar.gz "s3://vectorworks-cloud-static/packages/vcs-draft-js-side-toolbar-plugin-v18.9.10-1.tar.gz"
rm -rf vcs-draft-js-side-toolbar-plugin-v18.9.10-1.tar.gz

