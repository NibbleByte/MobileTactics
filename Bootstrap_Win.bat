::
:: Constants
::
set InternalTools=%CD%/Internal Tools

set Client=%CD%/MobileClient/LocalFiles
set ClientJS=%CD%/MobileClient/LocalFiles/Javascript


::
:: Link the Core folder
::
rmdir "%ClientJS%/Core" /S /Q
mklink /D "%ClientJS%/Core" "%CD%/Core"

::
:: Link the client folder to internal tools.
::
rmdir "%InternalTools%/_Client" /S /Q
mklink /D "%InternalTools%/_Client" "%Client%"


::
:: Check for errors
::
@echo off
if %errorlevel% neq 0 (
	echo.
	echo.
	echo ERROR Happened!
	pause
)