<?php

/**
 * Lizmap administration : project announcements.
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
    // Configure access via jacl2 rights management
    public $pluginParams = array(
        '*' => array('jacl2.right' => 'lizmap.admin.announcement.manage'),
    );

    /**
     * List all announcements.
     *
     * @return jResponseHtml
     */
    public function index()
    {
        /** @var jResponseHtml $rep */
        $rep = $this->getResponse('html');

        $dao = jDao::get('lizmap~announcement', 'lizlog');
        $announcements = $dao->findAll();
        $conditions = jDao::createConditions();
        $announcementCount = $dao->countBy($conditions);

        $tpl = new jTpl();
        $tpl->assign('announcements', $announcements);
        $tpl->assign('announcementCount', $announcementCount);
        $rep->body->assign('MAIN', $tpl->fetch('announcement_list'));
        $rep->body->assign('selectedMenuItem', 'lizmap_announcements');

        return $rep;
    }

    /**
     * Display the create form.
     *
     * @return jResponseHtml
     */
    public function create()
    {
        /** @var jResponseHtml $rep */
        $rep = $this->getResponse('html');

        $tpl = new jTpl();
        $tpl->assign('id', 0);
        $tpl->assign('title', '');
        $tpl->assign('content', '');
        $tpl->assign('target_repository', '');
        $tpl->assign('target_project', '');
        $tpl->assign('target_groups', '');
        $tpl->assign('selectedGroupsArray', array());
        $tpl->assign('max_display_count', 1);
        $tpl->assign('is_active', true);
        $tpl->assign('repositories', lizmap::getRepositoryList());
        $tpl->assign('groups', jAcl2DbUserGroup::getGroupList());
        $rep->body->assign('MAIN', $tpl->fetch('announcement_form'));
        $rep->body->assign('selectedMenuItem', 'lizmap_announcements');

        return $rep;
    }

    /**
     * Display the edit form.
     *
     * @return jResponseHtml|jResponseRedirect
     */
    public function edit()
    {
        $id = $this->intParam('id');
        if (!$id) {
            /** @var jResponseRedirect $rep */
            $rep = $this->getResponse('redirect');
            $rep->action = 'admin~announcement:index';

            return $rep;
        }

        /** @var jResponseHtml $rep */
        $rep = $this->getResponse('html');

        $dao = jDao::get('lizmap~announcement', 'lizlog');
        $record = $dao->get($id);

        if (!$record) {
            /** @var jResponseRedirect $rep */
            $rep = $this->getResponse('redirect');
            jMessage::add(jLocale::get('admin~admin.announcement.error.notfound'), 'error');
            $rep->action = 'admin~announcement:index';

            return $rep;
        }

        $tpl = new jTpl();
        $selectedGroupsArray = !empty($record->target_groups)
            ? array_map('trim', explode(',', $record->target_groups))
            : array();

        $tpl->assign('id', $record->id);
        $tpl->assign('title', $record->title);
        $tpl->assign('content', $record->content);
        $tpl->assign('target_repository', $record->target_repository);
        $tpl->assign('target_project', $record->target_project);
        $tpl->assign('target_groups', $record->target_groups);
        $tpl->assign('selectedGroupsArray', $selectedGroupsArray);
        $tpl->assign('max_display_count', $record->max_display_count);
        $tpl->assign('is_active', $record->is_active);
        $tpl->assign('repositories', lizmap::getRepositoryList());
        $tpl->assign('groups', jAcl2DbUserGroup::getGroupList());
        $rep->body->assign('MAIN', $tpl->fetch('announcement_form'));
        $rep->body->assign('selectedMenuItem', 'lizmap_announcements');

        return $rep;
    }

    /**
     * Save an announcement (create or update).
     *
     * @return jResponseRedirect
     */
    public function save()
    {
        /** @var jResponseRedirect $rep */
        $rep = $this->getResponse('redirect');

        $id = $this->intParam('id');
        $title = $this->param('title');
        $content = $this->param('content');

        if (!$title || !$content) {
            jMessage::add(jLocale::get('admin~admin.announcement.error.required'), 'error');
            $rep->action = 'admin~announcement:index';

            return $rep;
        }

        $dao = jDao::get('lizmap~announcement', 'lizlog');

        if ($id) {
            // Update existing
            $record = $dao->get($id);
            if (!$record) {
                jMessage::add(jLocale::get('admin~admin.announcement.error.notfound'), 'error');
                $rep->action = 'admin~announcement:index';

                return $rep;
            }
        } else {
            // Create new
            $record = jDao::createRecord('lizmap~announcement', 'lizlog');
        }

        $record->title = htmlspecialchars($title);
        $record->content = $content;
        $record->target_repository = $this->param('target_repository', '');
        $record->target_project = $this->param('target_project', '');

        // Handle groups multi-select
        $groups = $this->param('target_groups');
        if (is_array($groups)) {
            $record->target_groups = implode(',', $groups);
        } else {
            $record->target_groups = $groups ?: '';
        }

        $record->max_display_count = $this->intParam('max_display_count', 1);
        $record->is_active = $this->param('is_active') ? true : false;

        if ($id) {
            $dao->update($record);
            jMessage::add(jLocale::get('admin~admin.announcement.saved'));
        } else {
            $dao->insert($record);
            jMessage::add(jLocale::get('admin~admin.announcement.created'));
        }

        $rep->action = 'admin~announcement:index';

        return $rep;
    }

    /**
     * Toggle announcement active status.
     *
     * @return jResponseRedirect
     */
    public function toggle()
    {
        /** @var jResponseRedirect $rep */
        $rep = $this->getResponse('redirect');

        $id = $this->intParam('id');
        if ($id) {
            $dao = jDao::get('lizmap~announcement', 'lizlog');
            $record = $dao->get($id);
            if ($record) {
                $record->is_active = !$record->is_active;
                $dao->update($record);
                jMessage::add(jLocale::get('admin~admin.announcement.toggled'));
            }
        }

        $rep->action = 'admin~announcement:index';

        return $rep;
    }

    /**
     * Delete an announcement.
     *
     * @return jResponseRedirect
     */
    public function delete()
    {
        /** @var jResponseRedirect $rep */
        $rep = $this->getResponse('redirect');

        $id = $this->intParam('id');
        if ($id) {
            $dao = jDao::get('lizmap~announcement', 'lizlog');
            $dao->delete($id);
            jMessage::add(jLocale::get('admin~admin.announcement.deleted'));
        }

        $rep->action = 'admin~announcement:index';

        return $rep;
    }
}
