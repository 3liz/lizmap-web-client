<?php

/**
 * Lizmap announcement controller for the frontend map view.
 *
 * @author    3liz
 * @copyright 2026 3liz
 *
 * @see      http://3liz.com
 *
 * @license Mozilla Public License : http://www.mozilla.org/MPL/
 */
class announcementCtrl extends jController
{
    /**
     * Get pending announcements for the current user and project.
     *
     * @return jResponseJson
     */
    public function pending()
    {
        /** @var jResponseJson $rep */
        $rep = $this->getResponse('json');

        $repository = $this->param('repository', '');
        $project = $this->param('project', '');

        $dao = jDao::get('lizmap~announcement', 'lizlog');
        $activeAnnouncements = $dao->findActive();

        $isConnected = jAuth::isConnected();
        $usr_login = '';
        $userGroups = array();

        if ($isConnected) {
            $usr_login = jAuth::getUserSession()->login;
            $groups = jAcl2DbUserGroup::getGroupList($usr_login);
            foreach ($groups as $group) {
                $userGroups[] = $group->id_aclgrp;
            }
        }

        $viewDao = jDao::get('lizmap~announcementView', 'lizlog');

        $pending = array();
        foreach ($activeAnnouncements as $announcement) {
            // Filter by repository
            if (!empty($announcement->target_repository) && $announcement->target_repository !== $repository) {
                continue;
            }

            // Filter by project
            if (!empty($announcement->target_project) && $announcement->target_project !== $project) {
                continue;
            }

            // Filter by groups
            if (!empty($announcement->target_groups)) {
                $targetGroups = explode(',', $announcement->target_groups);
                $targetGroups = array_map('trim', $targetGroups);
                if (!$isConnected || empty(array_intersect($targetGroups, $userGroups))) {
                    continue;
                }
            }

            // Check view count for authenticated users
            if ($isConnected && $announcement->max_display_count > 0) {
                $view = $viewDao->getByAnnouncementAndUser($announcement->id, $usr_login);
                if ($view && $view->view_count >= $announcement->max_display_count) {
                    continue;
                }
            }

            $pending[] = array(
                'id' => (int) $announcement->id,
                'title' => $announcement->title,
                'content' => $announcement->content,
            );
        }

        $rep->data = array('announcements' => $pending);

        return $rep;
    }

    /**
     * Mark an announcement as seen by the current user.
     *
     * @return jResponseJson
     */
    public function markSeen()
    {
        /** @var jResponseJson $rep */
        $rep = $this->getResponse('json');

        if (!jAuth::isConnected()) {
            $rep->data = array('status' => 'ok');

            return $rep;
        }

        $announcementId = $this->intParam('id');
        if (!$announcementId) {
            $rep->data = array('status' => 'error', 'message' => 'Missing announcement id');

            return $rep;
        }

        $usr_login = jAuth::getUserSession()->login;
        $viewDao = jDao::get('lizmap~announcementView', 'lizlog');

        $view = $viewDao->getByAnnouncementAndUser($announcementId, $usr_login);
        if ($view) {
            $view->view_count = $view->view_count + 1;
            $viewDao->update($view);
        } else {
            $record = jDao::createRecord('lizmap~announcementView', 'lizlog');
            $record->announcement_id = $announcementId;
            $record->usr_login = $usr_login;
            $record->view_count = 1;
            $viewDao->insert($record);
        }

        $rep->data = array('status' => 'ok');

        return $rep;
    }
}
