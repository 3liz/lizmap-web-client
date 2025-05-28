#!/bin/bash

set -e

if [ "$1" == "" ]; then
  echo "Error: path to your Lizmap 3.5 directory is missing."
  echo "Give at first parameter the path of 'lizmap' of your Lizmap 3.5 directory"
  echo ""
  echo "Erreur: le chemin vers le répertoire de votre lizmap 3.5 est manquant."
  echo "Donnez en premier paramètre le chemin vers le répertoire 'lizmap' de votre instance Lizmap 3.5"

  exit 1
fi

if [ ! -d $1 ]; then
  echo "Error: given path is not a directory."
  echo "Give at first parameter the path of 'lizmap' of your Lizmap 3.5 directory"
  echo ""
  echo "Erreur: le chemin donné n'est pas un répertoire."
  echo "Donnez en premier paramètre le chemin vers le répertoire 'lizmap' de votre instance Lizmap 3.5"
  exit 1
fi

LIZMAP35_DIR="$1"

if [ ! -f "$1/project.xml" -o ! -f "$1/install/backup.sh"  ]; then
  echo "Error: the given path is not a lizmap directory. project.xml is not found."
  echo "Give at first parameter the path of 'lizmap' of your Lizmap 3.5 directory"
  echo ""
  echo "Erreur: le chemin donné n'est pas un répertoire lizmap. Le fichier project.xml n'est pas trouvé."
  echo "Donnez en premier paramètre le chemin vers le répertoire 'lizmap' de votre instance Lizmap 3.5"
  exit 1
fi

if [ ! -f "$1/var/config/mainconfig.ini.php" ]; then
  echo "Error: given path is not Lizmap 3.5. mainconfig.ini.php is not found."
  echo "Give at first parameter the path of 'lizmap' of your Lizmap 3.5 directory"
  echo ""
  echo "Erreur: le chemin donné n'est pas lizmap 3.5. Le fichier mainconfig.ini.php n'est pas trouvé."
  echo "Donnez en premier paramètre le chemin vers le répertoire 'lizmap' de votre instance Lizmap 3.5"
  exit 1
fi

LIZMAP35_DIR="$1"

SCRIPTDIR=$(dirname $0)
LIZMAP36_DIR=$SCRIPTDIR/..

echo "* Copy configuration files and data from $LIZMAP35_DIR"
mkdir -p ${LIZMAP36_DIR}/tmp_backup
$LIZMAP35_DIR/install/backup.sh ${LIZMAP36_DIR}/tmp_backup

$LIZMAP36_DIR/install/restore.sh ${LIZMAP36_DIR}/tmp_backup

rm -rf ${LIZMAP36_DIR}/tmp_backup

COMPOSER_FILE="${LIZMAP36_DIR}/my-packages/composer.json"
if [ -f $COMPOSER_FILE ]; then
  echo "* update lizmap/my-packages/composer.json and move some modules"
  echo "  from lizmap-modules to lizmap/my-packages/ if possible."

  MODULES_DIR=${LIZMAP36_DIR}/lizmap-modules/
  php $LIZMAP36_DIR/install/tools/update_packages_version.php $COMPOSER_FILE $MODULES_DIR

  if ! command -v composer &> /dev/null
  then
      echo "Warning: Composer is not installed, you must install it and run "
      echo "         composer update --working-dir=${LIZMAP36_DIR}/my-packages/"
      echo "        in order to update modules into lizmap/my-packages/"
  else
      echo "* install or update modules into lizmap/my-packages/"
      composer update --working-dir="${LIZMAP36_DIR}/my-packages/"
  fi
fi
echo "* launch configurator"
php $LIZMAP36_DIR/install/configurator.php -v

#echo "* launch installer"
#php $LIZMAP36_DIR/install/installer.php -v
