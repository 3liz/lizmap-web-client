<?php

/**
 * Manage short link permalink.
 *
 * @author    3liz
 * @copyright 2026 3liz
 *
 * @see      http://3liz.com
 *
 * @license Mozilla Public License : http://www.mozilla.org/MPL/
 */
class permalinkCtrl extends jController
{
    protected $permalinkParameters = array(
        'bbox',
        'layers',
        'styles',
        'opacities',
        'categories',
    );

    /**
     * @var null|string The repository key string
     */
    protected $repository;

    /**
     * @var null|string The qgis project key
     */
    protected $project;

    /**
     * Permalink controller entrypoint.
     *
     * @return jResponseJson
     */
    public function index()
    {
        $repository = $this->param('repository');
        $project = $this->param('project');
        $lizmapProject = lizmap::getProject($repository.'~'.$project);
        if ($lizmapProject) {

            $this->repository = $repository;
            $this->project = $project;
            if ($this->param('o') == 'add') {
                return $this->add();
            }
            if ($this->param('o') == 'g') {
                return $this->get();
            }
        }

        jMessage::add(jLocale::get('view~dictionnary.permalink.error.parameters'), 'error');

        return $this->error();
    }

    /**
     * Return error message to the client.
     *
     * @return jResponseJson
     */
    public function error()
    {
        $messages = jMessage::getAll();
        jMessage::clearAll();

        /** @var jResponseJson $rep */
        $rep = $this->getResponse('json');
        $rep->data = $messages;

        return $rep;
    }

    /**
     * Get the given permalink record by id, returns an error if the record does not exists.
     *
     * @return jResponseJson
     */
    public function get()
    {
        if (!$this->param('id')) {
            jMessage::add(jLocale::get('view~dictionnary.permalink.error.parameters'), 'error');

            return $this->error();
        }
        $id = $this->param('id');

        try {
            $dao = jDao::get('lizmap~permalink');

            $conditions = jDao::createConditions();
            $conditions->addCondition('id', '=', $id);
            $conditions->addCondition('repository', '=', $this->repository);
            $conditions->addCondition('project', '=', $this->project);

            $existingRec = $dao->findBy($conditions);

            if ($existingRec == null || $existingRec->rowCount() != 1) {
                throw new Exception(jLocale::get('view~dictionnary.permalink.error.get.not.found'));
            }

            // update last_usage_date timestamp
            $dao->updateLastUsageDate($id);

            /** @var jResponseJson $rep */
            $rep = $this->getResponse('json');
            foreach ($existingRec as $plink) {
                $rep->data = array(
                    'repository' => $plink->repository,
                    'project' => $plink->project,
                    'plink' => json_decode($plink->url_parameters),
                );

                break;
            }

            return $rep;

        } catch (Exception $e) {
            jLog::log($e->getMessage(), 'lizmapadmin');
            jLog::logEx($e, 'error');
            jMessage::add($e->getMessage(), 'error');

            return $this->error();
        }

    }

    /**
     * Inserts a new permalink record. Returns the permalink id if no errors occur.
     *
     * @return jResponseJson
     */
    public function add()
    {
        $permalinkToInsert = $this->encodeJsonParameters();
        if (!$permalinkToInsert) {
            return $this->error();
        }

        // prepare the insert
        $dao = jDao::get('lizmap~permalink');

        try {
            $id = $this->getPermalinkHash($permalinkToInsert);
            $conditions = jDao::createConditions();
            $conditions->addCondition('id', '=', $id);
            $conditions->addCondition('repository', '=', $this->repository);
            $conditions->addCondition('project', '=', $this->project);

            $existingRec = $dao->findBy($conditions);

            if ($existingRec == null || $existingRec->rowCount() != 1) {
                // insert record
                $record = jDao::createRecord('lizmap~permalink');
                $record->id = $id;
                $record->url_parameters = $permalinkToInsert;
                $record->repository = $this->repository;
                $record->project = $this->project;

                $rec = $dao->insert($record);
                if ($rec != 1) {
                    throw new Exception(jLocale::get('view~dictionnary.permalink.error.add'));
                }
            }

        } catch (Exception $e) {
            jLog::log($e->getMessage(), 'lizmapadmin');
            jLog::logEx($e, 'error');
            jMessage::add($e->getMessage(), 'error');

            return $this->error();
        }

        /** @var jResponseJson $rep */
        $rep = $this->getResponse('json');
        $rep->data = array('permalink' => $id);

        return $rep;
    }

    /**
     * Validates client permalink parameters. Returns the corresponding json encoded string.
     *
     * @return string
     */
    private function encodeJsonParameters()
    {
        $raw_permalink = $this->param('permalink');

        if (
            !$raw_permalink
            || !is_array($raw_permalink)
        ) {
            jMessage::add(jLocale::get('view~dictionnary.permalink.error.parameters'), 'error');

            return '';
        }

        try {
            if (count(array_keys($raw_permalink)) == 0) {
                throw new Exception(jLocale::get('view~dictionnary.permalink.error.parameters'));
            }

            $sanitizedPermalinkKeys = array_filter($raw_permalink, function ($k) {
                return in_array($k, $this->permalinkParameters);
            }, ARRAY_FILTER_USE_KEY);

            if (count($sanitizedPermalinkKeys) == 0) {
                throw new Exception(jLocale::get('view~dictionnary.permalink.error.parameters'));
            }

            // validate values
            if (
                !array_key_exists('bbox', $sanitizedPermalinkKeys)
                || !is_array($sanitizedPermalinkKeys['bbox'])
                || count($sanitizedPermalinkKeys['bbox']) != 4
            ) {
                throw new Exception(jLocale::get('view~dictionnary.permalink.error.parameters.bbox'));
            }

            if (array_key_exists('layers', $sanitizedPermalinkKeys)) {
                $lCount = count($sanitizedPermalinkKeys['layers']);
                if (
                    !array_key_exists('styles', $sanitizedPermalinkKeys)
                    || count($sanitizedPermalinkKeys['styles']) !== $lCount
                    || !array_key_exists('opacities', $sanitizedPermalinkKeys)
                    || count($sanitizedPermalinkKeys['opacities']) !== $lCount
                ) {
                    throw new Exception(jLocale::get('view~dictionnary.permalink.error.parameters'));
                }
            }
            $jsonPermalink = json_encode($sanitizedPermalinkKeys);

            if (!$jsonPermalink) {
                throw new Exception(jLocale::get('view~dictionnary.permalink.error.parameters'));
            }

            return $jsonPermalink;

        } catch (Exception $e) {
            jMessage::add($e->getMessage(), 'error');

            return '';
        }
    }

    /**
     * Get sha256 hash for the given encoded permalink string.
     *
     * @param string $permalink
     *
     * @return string
     */
    private function getPermalinkHash($permalink)
    {
        $hash_base64 = base64_encode(hash('sha256', $permalink, true));
        $hash_urlsafe = strtr($hash_base64, '+/', '-_');
        $hash_urlsafe = rtrim($hash_urlsafe, '=');

        // Shorten the string to 12 char
        return substr($hash_urlsafe, 0, 12);
    }
}
