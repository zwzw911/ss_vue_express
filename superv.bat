REM @SETLOCAL
REM @SET PATHEXT=%PATHEXT:;.JS;=;%
REM node  "%~dp0\node_modules\forever\bin\forever"  start "express\bin\www"

@SETLOCAL
@SET PATHEXT=%PATHEXT:;.JS;=;%
node --harmony  "%~dp0\node_modules\supervisor\lib\cli-wrapper.js" "express\bin\www" %*