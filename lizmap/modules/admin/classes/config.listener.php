<?php

class configListener extends jEventListener
{
    public function onmasteradminGetMenuContent($event)
    {
        // Create the "lizmap" parent menu item
        $bloc = new masterAdminMenuItem('lizmap', 'LizMap', '', 50);

        // Access the Lizmap service configuration (admins)
        if (jAcl2::check('lizmap.admin.services.view')) {
            $bloc->childItems[] = new masterAdminMenuItem(
                'lizmap_configuration',
                jLocale::get('admin~admin.menu.configuration.main.label'),
                jUrl::get('admin~config:index'),
                110,
                'lizmap'
            );
        }

        // Access the list of Lizmap repositories
        if (jAcl2::check('lizmap.admin.repositories.view')) {
            $bloc->childItems[] = new masterAdminMenuItem(
                'lizmap_maps',
                jLocale::get('admin~admin.menu.lizmap.repositories.label'),
                jUrl::get('admin~maps:index'),
                111,
                'lizmap'
            );
        }

        // Access the list of Lizmap projects
        if (jAcl2::check('lizmap.admin.project.list.view')) {
            $bloc->childItems[] = new masterAdminMenuItem(
                'lizmap_project_list',
                jLocale::get('admin~admin.menu.lizmap.project.list.label'),
                jUrl::get('admin~qgis_projects:index'),
                112,
                'lizmap'
            );
        }

        // Configure the landing page content
        if (jAcl2::check('lizmap.admin.home.page.update')) {
            $bloc->childItems[] = new masterAdminMenuItem(
                'lizmap_landing_page_content',
                jLocale::get('admin~admin.menu.lizmap.landingPageContent.label'),
                jUrl::get('admin~landing_page_content:index'),
                115,
                'lizmap'
            );
        }

        // Configure the theme
        if (jAcl2::check('lizmap.admin.theme.update')) {
            $bloc->childItems[] = new masterAdminMenuItem(
                'lizmap_theme',
                jLocale::get('admin~admin.menu.lizmap.theme.label'),
                jUrl::get('admin~theme:index'),
                120,
                'lizmap'
            );
        }

        if (count($bloc->childItems)) {
            // Add the bloc
            $event->add($bloc);
        }

        // Server menu item
        $bloc = new masterAdminMenuItem('server', jLocale::get('admin~admin.menu.server.label'), '', 60);

        // Information taken from QGIS Server with the help of Lizmap plugin
        if (jAcl2::check('lizmap.admin.server.information.view')) {
            $bloc->childItems[] = new masterAdminMenuItem(
                'lizmap_server_information',
                jLocale::get('admin~admin.menu.server.information.label'),
                jUrl::get('admin~server_information:index'),
                110,
                'server'
            );
        }

        // Child for lizmap logs
        if (jAcl2::check('lizmap.admin.lizmap.log.view')) {
            $bloc->childItems[] = new masterAdminMenuItem(
                'lizmap_logs',
                jLocale::get('admin~admin.menu.lizmap.logs.label'),
                jUrl::get('admin~logs:index'),
                125,
                'server'
            );
        }

        if (count($bloc->childItems)) {
            // Add the bloc
            $event->add($bloc);
        }
    }

    public function onjauthdbAdminGetViewInfo(jEvent $event)
    {
        if (/* !$event->himself && */ jAcl2::check('acl.user.view')) {
            $user = $event->tpl->get('id');

            $groups = jAcl2DbUserGroup::getGroupList($user);
            $userGroups = array();
            foreach ($groups as $group) {
                if ($group->grouptype == jAcl2DbUserGroup::GROUPTYPE_PRIVATE) {
                    continue;
                }
                $userGroups[$group->id_aclgrp] = $group;
            }

            $groups = jAcl2DbUserGroup::getGroupList();
            $allGroups = array();
            foreach ($groups as $group) {
                if (isset($userGroups[$group->id_aclgrp])) {
                    continue;
                }
                $allGroups[] = $group;
            }

            $tpl = new jTpl();
            $tpl->assign('user', $user);
            $tpl->assign('usergroups', $userGroups);
            $tpl->assign('groups', $allGroups);

            $event->add($tpl->fetch('admin~user_groups'));
        }
    }
}
