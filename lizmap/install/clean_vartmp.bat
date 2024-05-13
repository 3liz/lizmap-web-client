rem script for upgrade versions higher then lizmap 3.0
rem file to put in the folder install
cd ..
cd var
del /q log\*
for /d %%x in (log\*) do @rd /s /q "%%x"
del /q mails\*
for /d %%x in (mails\*) do @rd /s /q "%%x"
del /q uploads\*
for /d %%x in (uploads\*) do @rd /s /q "%%x"
cd ..\..
cd temp
del /q lizmap\*
for /d %%x in (lizmap\*) do @rd /s /q "%%x"
