#!/bin/bash
COMMAND="$1"

#if [ "$COMMAND" -eq "" ]; then
#    echo "Error: command is missing"
#    exit 1;
#fi

case $COMMAND in
    reset)
      ldapdelete -x -c -D cn=admin,dc=tests,dc=lizmap -w passlizmap -f /customldif/reset/ldap_delete.ldif
      ldapadd -x -c -D cn=admin,dc=tests,dc=lizmap -w passlizmap -f /customldif/prepopulate/ldap_users.ldif
      ;;
    setup)
      ldapadd -x -D cn=admin,dc=tests,dc=lizmap -w passlizmap -f /customldif/prepopulate/ldap_users.ldif
      #ldapsearch -x -D cn=admin,dc=tests,dc=lizmap -w passlizmap -b "dc=tests,dc=jelix" "(objectClass=*)"
      ;;
    showusers)
      ldapsearch -x -D cn=admin,dc=tests,dc=lizmap -w passlizmap -b "dc=tests,dc=lizmap" "(objectClass=*)"
      ;;
    *)
        echo "wrong command"
        exit 2
        ;;
esac
