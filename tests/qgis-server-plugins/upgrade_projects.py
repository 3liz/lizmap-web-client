#!/usr/bin/env python3

import argparse
import atexit
import os
import pathlib
import sys

from qgis.core import QgsApplication, QgsProject

qgis_application = None


def start_qgis_application(enable_gui=False, verbose=False, cleanup=True):
    global qgis_application

    # In python3 we need to convert to a bytes object (or should
    # QgsApplication accept a QString instead of const char* ?)
    try:
        argvb = list(map(os.fsencode, sys.argv))
    except AttributeError:
        argvb = sys.argv

    qgis_application = QgsApplication(argvb, enable_gui)
    qgis_application.setPrefixPath('/usr', True)
    qgis_application.initQgis()

    if cleanup:
        print("Installing cleanup hook")

        @atexit.register
        def exitQgis():
            if qgis_application:
                qgis_application.exitQgis()

    if verbose:
        print(qgis_application.showSettings())

    # Add a hook to qgis  message log
    def write_log_message(message, tag, level):
        print(f'QGIS: {tag}({level}): {message}', file=sys.stderr)

    QgsApplication.instance().messageLog().messageReceived.connect(write_log_message)

    print("QGIS initialized......")


def stop_qgis_application():
    """ Cleans up and exits QGIS
    """
    global qgis_application

    qgis_application.exitQgis()
    del qgis_application


def upgrade_projects():

    for qgs_file in pathlib.Path('/tmp/qgis-projects').glob('*.qgs'):
        if qgs_file.name in ("embed_child.qgs", "relations_project_embed.qgs"):
            # Fixme, flag QgsProject.FlagDontResolveLayers is not working with embedded layers
            print(f"---- Skipping {qgs_file.name}")
            continue

        print(f"Processing {qgs_file.name}")

        project = QgsProject()
        # p.read(str(qgs_file))
        # noinspection PyUnresolvedReferences
        project.read(str(qgs_file), QgsProject.FlagDontResolveLayers)
        project.write()


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Run headless qgis app and exit')
    parser.add_argument('--verbose', action='store_true', default=False)
    parser.add_argument('--disable-exit-hook', action='store_true', default=False)

    args = parser.parse_args()

    #  We MUST set the QT_QPA_PLATFORM to prevent
    #  Qt trying to connect to display
    os.environ['QT_QPA_PLATFORM'] = 'offscreen'

    start_qgis_application(verbose=args.verbose, cleanup=not args.disable_exit_hook)

    upgrade_projects()
