#!/bin/bash

set -e

if [ "$1" == "" ]; then
  echo "Error: path to your old Lizmap directory is missing."
  echo "Give at first parameter the path of 'lizmap' of your old Lizmap directory"
  echo ""
  echo "Erreur: le chemin vers le répertoire de votre ancienne instance lizmap est manquant."
  echo "Donnez en premier paramètre le chemin vers le répertoire 'lizmap' de votre ancienne instance Lizmap"

  exit 1
fi

if [ ! -d $1 ]; then
  echo "Error: given path is not a directory."
  echo "Give at first parameter the path of 'lizmap' of your old Lizmap directory"
  echo ""
  echo "Erreur: le chemin donné n'est pas un répertoire."
  echo "Donnez en premier paramètre le chemin vers le répertoire 'lizmap' de votre ancienne instance"
  exit 1
fi

LIZMAP_OLD_DIR="$1"

if [ ! -f "$1/project.xml" -o ! -f "$1/install/backup.sh"  ]; then
  echo "Error: the given path is not a lizmap directory. project.xml is not found."
  echo "Give at first parameter the path of 'lizmap' of your old  Lizmap directory"
  echo ""
  echo "Erreur: le chemin donné n'est pas un répertoire lizmap. Le fichier project.xml n'est pas trouvé."
  echo "Donnez en premier paramètre le chemin vers le répertoire 'lizmap' de votre ancienne instance Lizmap"
  exit 1
fi


LIZMAP_OLD_DIR="$1"

SCRIPTDIR=$(dirname $0)
LIZMAP_NEW_DIR=$SCRIPTDIR/..

echo "* Copy configuration files and data from $LIZMAP_OLD_DIR"
mkdir -p ${LIZMAP_NEW_DIR}/tmp_backup
$LIZMAP_OLD_DIR/install/backup.sh ${LIZMAP_NEW_DIR}/tmp_backup

$LIZMAP_NEW_DIR/install/restore.sh ${LIZMAP_NEW_DIR}/tmp_backup

rm -rf ${LIZMAP_NEW_DIR}/tmp_backup

COMPOSER_FILE="${LIZMAP_NEW_DIR}/my-packages/composer.json"
if [ -f $COMPOSER_FILE ]; then
  echo "* update lizmap/my-packages/composer.json and move some modules"
  echo "  from lizmap-modules to lizmap/my-packages/ if possible."

  MODULES_DIR=${LIZMAP_NEW_DIR}/lizmap-modules/
  php $LIZMAP_NEW_DIR/install/tools/update_packages_version.php $COMPOSER_FILE $MODULES_DIR

  if ! command -v composer &> /dev/null
  then
      echo "Warning: Composer is not installed, you must install it and run "
      echo "         composer update --working-dir=${LIZMAP_NEW_DIR}/my-packages/"
      echo "        in order to update modules into lizmap/my-packages/"
  else
      echo "* install or update modules into lizmap/my-packages/"
      composer update --working-dir="${LIZMAP_NEW_DIR}/my-packages/"
  fi
fi
echo "* launch configurator"

if [ -d "${LIZMAP_NEW_DIR}/my-packages/vendor/jelix/multiauth-module" ]; then
    echo "* replace ldapdao by multiauth"
    # setup multiauth that replaces ldapdao
    php $LIZMAP_NEW_DIR/install/configurator.php multiauth
fi

php $LIZMAP_NEW_DIR/install/configurator.php -v

#echo "* launch installer"
#php $LIZMAP_NEW_DIR/install/installer.php -v
