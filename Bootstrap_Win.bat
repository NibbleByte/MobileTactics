::
:: Constants
::
set ClientJS=%CD%/MobileClient/LocalFiles/Javascript

::
:: Link the Core folder
::
rmdir "%ClientJS%/Core" /S /Q
mklink /D "%ClientJS%/Core" "%CD%/Core"

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