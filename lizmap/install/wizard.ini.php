
; path related to the ini file. By default, the ini file is expected to be into the myapp/install/ directory.
pagesPath = "../../lib/installwizard/pages/,wizardpages/"
customPath = "wizardcustom/"
start = welcome
tempPath = "../../temp/lizmap/"
supportedLang = en,fr


[welcome.step]
next=checkjelix

[checkjelix.step]
next=dbprofile
databases=sqlite,mysql,pgsql

[dbprofile.step]
next=installapp
availabledDrivers = sqlite3,mysqli,pgsql

[installapp.step]
next=end

[end.step]
noprevious = on
