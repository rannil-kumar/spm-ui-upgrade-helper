#!/usr/bin/sh

ERROR=
if [[ -z "$1" ]]; then
  echo ERROR: Missing version argument
  ERROR=true
fi
if [[ -z "$2" ]]; then
  echo ERROR: Missing input folder argument
  ERROR=true
fi
if [[ -z "$3" ]]; then
  echo ERROR: Missing output folder argument
  ERROR=true
fi
if [[ -n "$ERROR" ]]; then
    echo Usage: ./spm-ui-upgrade-helper.sh \<version\> \<input folder\> \<output folder\> [\<additional rules\>] [\<additional ignore\>]
    exit 1
fi

VERSION=$1
INPUT_FOLDER_CMD="-v $2:/home/workspace/input"
OUTPUT_FOLDER_CMD="-v $3:/home/workspace/output"

if [[ -z "$4" ]]; then
  ADDITIONAL_RULES_CMD=
else
  ADDITIONAL_RULES_CMD="-v $4:/home/workspace/rules"
fi
if [[ -z "$5" ]]; then
  ADDITIONAL_IGNORE_CMD=
else
  ADDITIONAL_IGNORE_CMD="-v $5:/home/workspace/ignore"
fi

if [[ "$DETACH" == "false" ]]; then
  DETACH_CMD=
else
  DETACH_CMD=--detach
fi

echo Starting spm-ui-upgrade-helper
echo
echo     VERSION = $VERSION
echo     INPUT_FOLDER_CMD = $INPUT_FOLDER_CMD
echo     OUTPUT_FOLDER_CMD = $OUTPUT_FOLDER_CMD
echo     ADDITIONAL_RULES_CMD = $ADDITIONAL_RULES_CMD
echo     ADDITIONAL_IGNORE_CMD = $ADDITIONAL_IGNORE_CMD
echo     DETACH_CMD = $DETACH_CMD
echo

docker stop spm-ui-upgrade-helper
docker rm spm-ui-upgrade-helper
echo Logging in to wh-govspm-docker-local.artifactory.swg-devops.com...
docker login wh-govspm-docker-local.artifactory.swg-devops.com
if [ "$?" != 0 ]; then echo "Error: Could not log in to Docker repo."; exit 1; fi
docker pull wh-govspm-docker-local.artifactory.swg-devops.com/artifactory/wh-govspm-docker-local/spm-ui-upgrade-helper/spm-ui-upgrade-helper:$VERSION
if [ "$?" != 0 ]; then echo "Error: Could not pull $VERSION version."; exit 1; fi
docker run $DETACH_CMD -p 3000:3000 -p 4000-4002:4000-4002 \
    $UIUH_DEV_CMD \
    $INPUT_FOLDER_CMD \
    $OUTPUT_FOLDER_CMD \
    $ADDITIONAL_RULES_CMD \
    $ADDITIONAL_IGNORE_CMD \
    --name spm-ui-upgrade-helper \
    wh-govspm-docker-local.artifactory.swg-devops.com/artifactory/wh-govspm-docker-local/spm-ui-upgrade-helper/spm-ui-upgrade-helper:$VERSION
if [ "$?" != 0 ]; then echo "Error: Could not run $VERSION version."; exit 1; fi
docker ps