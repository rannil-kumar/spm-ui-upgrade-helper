@echo off
setlocal

:: This is for mapping local development code onto the docker image so you can watch for changes
if "%UIUH_DEV%"=="true" (
  set UIUH_DEV_CMD=-v C:\git\spm-ui-upgrade-helper\packages\main-tool:/home/theia/packages/main-tool/ ^
      -v C:\git\spm-ui-upgrade-helper\packages\css-rules-tool:/home/theia/packages/css-rules-tool/ ^
      -v C:\git\spm-ui-upgrade-helper\packages\icon-replacer-tool:/home/theia/packages/icon-replacer-tool/ ^
      -v C:\git\spm-ui-upgrade-helper\packages\js-rules-tool:/home/theia/packages/js-rules-tool/ ^
      -v C:\git\spm-ui-upgrade-helper\packages\shared-utils:/home/theia/packages/shared-utils/ ^
      -v C:\git\spm-ui-upgrade-helper\packages\window-size-tool:/home/theia/packages/window-size-tool/ ^
      -v C:\git\spm-ui-upgrade-helper\config:/home/theia/config/
  echo Dev Mode On
) else (
  set UIUH_DEV_CMD=
  echo Dev Mode Off ^(use set UIUH_DEV=true to turn it on^)
)

if "%VERSION%" == "" (
  set VERSION=latest
)
if "%INPUT_FOLDER%" == "" (
  set INPUT_FOLDER=C:\git\spm-ui-upgrade-helper\workspace\input
)
if "%OUTPUT_FOLDER%" == "" (
  set OUTPUT_FOLDER=C:\git\spm-ui-upgrade-helper\workspace\output
)
if "%ADDITIONAL_RULES%" == "" (
  set ADDITIONAL_RULES=C:\git\spm-ui-upgrade-helper\workspace\rules
)

set INPUT_FOLDER_CMD=-v %INPUT_FOLDER%:/home/workspace/input
set OUTPUT_FOLDER_CMD=-v %OUTPUT_FOLDER%:/home/workspace/output
set ADDITIONAL_RULES_CMD=-v %ADDITIONAL_RULES%:/home/workspace/rules

echo Starting spm-ui-upgrade-helper
echo.
echo     VERSION = %VERSION%
echo     INPUT_FOLDER_CMD = %INPUT_FOLDER_CMD%
echo     OUTPUT_FOLDER_CMD = %OUTPUT_FOLDER_CMD%
echo     ADDITIONAL_RULES_CMD = %ADDITIONAL_RULES_CMD%
echo.

call docker stop spm-ui-upgrade-helper
call docker rm spm-ui-upgrade-helper
call docker run -p 3000:3000 -p 4000-4002:4000-4002 %UIUH_DEV_CMD% %INPUT_FOLDER_CMD% %OUTPUT_FOLDER_CMD% %ADDITIONAL_RULES_CMD% --name spm-ui-upgrade-helper spm-ui-upgrade-helper:%VERSION%

endlocal
