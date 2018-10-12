@echo off
REM cd C:\Program Files\MongoDB\Server\3.6\bin
C:\"Program Files"\MongoDB\Server\3.6\bin\mongod.exe --logpath C:\data\mongodb.log --logappend --dbpath C:\data --directoryperdb --serviceName MongoDB --install
pause