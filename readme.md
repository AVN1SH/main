For staged files (git staged changes):
bash

git diff --name-only --cached | xargs -I{} bash -c 'mkdir -p "/destination/folder/$(dirname "{}")" && cp "{}" "/destination/folder/{}"'


For unstaged/tracked changes:
bash

git diff --name-only | xargs -I{} bash -c 'mkdir -p "/destination/folder/$(dirname "{}")" && cp "{}" "/destination/folder/{}"'


For both staged + unstaged changes combined:
bash

git diff --name-only HEAD | xargs -I{} bash -c 'mkdir -p "/destination/folder/$(dirname "{}")" && cp "{}" "/destination/folder/{}"'