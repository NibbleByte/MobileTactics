::
:: Constants
::
set InternalTools=%CD%/Internal Tools

set Core=%CD%/Core
set AssetsRepo=%CD%/MobileClient/AssetsRepo
set Client=%CD%/MobileClient/www
set ClientJS=%CD%/MobileClient/www/Javascript


::
:: Link the Core folder
::
rmdir "%ClientJS%/Core" /S /Q
mklink /D "%ClientJS%/Core" "%Core%"

::
:: Link the client folder to internal tools.
::
rmdir "%InternalTools%/_Core" /S /Q
mklink /D "%InternalTools%/_Core" "%Core%"

rmdir "%InternalTools%/_Client" /S /Q
mklink /D "%InternalTools%/_Client" "%Client%"

::
:: Link the asset distribution folder.
::
rmdir "%AssetsRepo%/_Client" /S /Q
mklink /D "%AssetsRepo%/_Client" "%Client%"


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