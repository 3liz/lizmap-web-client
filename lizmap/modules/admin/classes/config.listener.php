<?php

class configListener extends jEventListener
{
    public function onmasteradminGetMenuContent($event)
    {
        if (jAcl2::check('lizmap.admin.access')) {
            // Create the "lizmap" parent menu item
            $bloc = new masterAdminMenuItem('lizmap', 'LizMap', '', 50);

            // Child for the configuration of lizmap repositories
            $bloc->childItems[] = new masterAdminMenuItem(
                'lizmap_configuration',
                jLocale::get('admin~admin.menu.configuration.main.label'),
                jUrl::get('admin~config:index'),
                110,
                'lizmap'
            );

            // Child for lizmap theme
            $bloc->childItems[] = new masterAdminMenuItem(
                'lizmap_theme',
                jLocale::get('admin~admin.menu.lizmap.theme.label'),
                jUrl::get('admin~theme:index'),
                115,
                'lizmap'
            );

            // Child for lizmap logs
            $bloc->childItems[] = new masterAdminMenuItem(
                'lizmap_logs',
                jLocale::get('admin~admin.menu.lizmap.logs.label'),
                jUrl::get('admin~logs:index'),
                120,
                'lizmap'
            );

            // Add the bloc
            $event->add($bloc);
        }
    }

    public function onjauthdbAdminGetViewInfo(jEvent $event)
    {
        if (/*!$event->himself && */jAcl2::check('acl.user.view')) {
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
