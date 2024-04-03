<?php

/**
 * Presentation editing requests.
 *
 * @author    3liz
 * @copyright 2017 3liz
 *
 * @see      http://3liz.com
 *
 * @license    Mozilla Public License
 */
class presentationCtrl extends jController
{
    /**
     * @var null|string the lizmap repository key
     */
    private $repository;

    /**
     * @var null|string the qgis project key
     */
    private $project;

    /**
     * @var string Item type : presentation or page
     */
    private $itemType;

    /**
     * @var null|int The presentation ID
     */
    private $id = -999;

    /**
     * Redirect to the appropriate action depending on the REQUEST parameter.
     *
     * @urlparam $REPOSITORY Name of the repository
     * @urlparam $PROJECT Name of the project
     * @urlparam $REQUEST Request type
     *
     * @return \jResponseHtmlFragment the request response
     */
    public function index()
    {
        // Setup
        $repository = $this->param('repository');
        $project = $this->param('project');
        $itemType = $this->param('item_type', 'presentation');
        $setup = $this->setup($repository, $project, $itemType);
        if ($setup !== null) {
            return $setup;
        }

        // Redirect to method corresponding on REQUEST param
        $request = $this->param('request', 'create');

        switch ($request) {
            case 'list':
                return $this->list();

                break;

            case 'create':
                return $this->create();

                break;

            case 'modify':
                return $this->modify();

                break;

            case 'delete':
                return $this->delete();

                break;
        }

        return $this->error(
            array(
                array(
                    'title' => jLocale::get('presentation~presentation.form.error.request.title'),
                    'detail' => jLocale::get('presentation~presentation.form.error.request.detail', array($request)),
                ),
            ),
        );
    }

    /**
     * List the available presentations.
     *
     * @return \jResponseJson The JSON containing an array of presentation objects
     */
    public function list()
    {
        // todo return only presentations available for the given user
        // check rights && check groups
        /** var \jDaoFactoryBase $dao */
        $dao = \jDao::get('presentation~presentation');
        $getPresentations = $dao->findAll();
        $presentations = $getPresentations->fetchAllAssociative();

        // Get all pages for each presentation
        $daoPage = \jDao::get('presentation~presentation_page');
        foreach ($presentations as &$presentation) {
            $conditions = jDao::createConditions();
            $conditions->addCondition('presentation_id', '=', $presentation['id']);
            $getPages = $daoPage->findBy($conditions);
            $pages = $getPages->fetchAllAssociative();
            $presentation['pages'] = $pages;
        }

        // Return html fragment response
        /** @var \jResponseJson $rep */
        $rep = $this->getResponse('json');
        $rep->data = $presentations;

        return $rep;
    }

    /**
     * Setup the request.
     *
     * @param $repository Name of the repository
     * @param $project    Name of the project
     * @param $itemType    Type of item : presentation or page
     *
     * @urlparam $REQUEST Request type
     *
     * @return null|\jResponseHtmlFragment the request response
     */
    private function setup($repository, $project, $itemType = 'presentation')
    {
        // Check presentation config
        jClasses::inc('presentation~presentationConfig');
        $presentationConfig = new presentationConfig($repository, $project);
        if (!$presentationConfig->getStatus()) {
            return $this->error($presentationConfig->getErrors());
        }

        $this->repository = $repository;
        $this->project = $project;
        $this->itemType = $itemType;

        return null;
    }

    /**
     * Provide errors.
     *
     * @param mixed $errors
     *
     * @return \jResponseHtmlFragment the errors response
     */
    public function error($errors)
    {
        // Use template to create html form content
        $tpl = new jTpl();
        $tpl->assign('errors', $errors);
        $content = $tpl->fetch('presentation~html_error');

        // Return html fragment response
        /** @var \jResponseHtmlFragment $rep */
        $rep = $this->getResponse('htmlfragment');
        $rep->addContent($content);

        return $rep;
    }

    /**
     * Check if the given id corresponds to an existing presentation.
     *
     * @param $id Id to check
     * @param $itemType Type of item : presentation or page
     *
     * @return null|jResponseHtmlFragment The error response if a problem has been detected,
     *                                    null if the presentation exists
     */
    private function checkGivenId($id, $itemType = 'presentation')
    {
        // Get the presentation with the given id
        if ($id === null) {
            return $this->error(
                array(
                    array(
                        'title' => jLocale::get('presentation~presentation.form.error.null.id.title'),
                        'detail' => jLocale::get(
                            'presentation~presentation.form.error.null.id.detail',
                            array()
                        ),
                    ),
                )
            );
        }

        // Get the corresponding presentation
        $dao = \jDao::get('presentation~presentation');
        if ($itemType == 'page') {
            $dao = \jDao::get('presentation~presentation_page');
        }
        $presentation = $dao->get($id);
        if ($presentation === null) {
            $title = jLocale::get('presentation~presentation.form.error.unknown.presentation.id.title');
            $detail = jLocale::get(
                'presentation~presentation.form.error.unknown.presentation.id.detail',
                array($id)
            );
            if ($itemType == 'page') {
                $title = jLocale::get('presentation~presentation.form.error.unknown.page.id.title');
                $detail = jLocale::get(
                    'presentation~presentation.form.error.unknown.page.id.detail',
                    array($id)
                );
            }

            return $this->error(
                array(
                    array(
                        'title' => $title,
                        'detail' => $detail,
                    ),
                )
            );
        }

        $this->id = $id;

        return null;
    }

    /**
     * Generate a valid UUID v4.
     *
     * It uses the PostgreSQL uuid_generate_v4() method
     *
     * @return null|string Valid UUID v4
     */
    private function generateUuid()
    {
        $sql = 'SELECT uuid_generate_v4()::text AS uuid';
        $cnx = \jDb::getConnection();
        $uuid = null;

        try {
            $query = $cnx->query($sql);
            while ($record = $query->fetch()) {
                $uuid = $record->uuid;
            }
        } catch (Exception $e) {
            $uuid = null;
        }

        return $uuid;
    }

    /**
     * Create a new presentation.
     *
     * @return \jResponseHtmlFragment|\jResponseRedirect The HTML form for presentation creation
     */
    public function create()
    {
        // Setup
        $repository = $this->param('repository');
        $project = $this->param('project');
        $itemType = $this->param('item_type', 'presentation');
        $presentationId = null;
        $presentationUuid = null;
        if ($itemType == 'page') {
            $presentationId = $this->intParam('presentation_id');
            // Get parent presentation
            $dao = \jDao::get('presentation~presentation');
            $parentPresentation = $dao->get($presentationId);
            $presentationUuid = $parentPresentation->uuid;
        }
        $setup = $this->setup($repository, $project, $itemType);
        if ($setup !== null) {
            return $setup;
        }

        // Get the form
        $ressourceName = 'presentation';
        if ($itemType == 'page') {
            $ressourceName = 'presentation_page';
        }
        $form = \jForms::create("presentation~{$ressourceName}", -999);
        $form->setData('submit_button', 'submit');
        $form->setData('repository', $this->repository);
        $form->setData('project', $this->project);
        $form->setData('item_type', $itemType);
        // Create unique UUID
        $uuid = $this->generateUuid();
        $form->setData('uuid', $uuid);

        if ($itemType == 'page') {
            $form->setData('presentation_id', $presentationId);
            $form->setData('presentation_uuid', $presentationUuid);
        }

        // Get login
        $login = null;
        $isConnected = \jAuth::isConnected();
        if ($isConnected) {
            $user = \jAuth::getUserSession();
            $login = $user->login;
        }
        if ($itemType == 'presentation') {
            $form->setData('created_by', $login);
            $form->setData('updated_by', $login);
        }

        // Redirect to the edit method
        /** @var \jResponseRedirect $rep */
        $rep = $this->getResponse('redirect');
        $rep->params = array(
            'project' => $this->project,
            'repository' => $this->repository,
            'status' => 'create',
            'item_type' => $itemType,
        );
        $rep->action = 'presentation~presentation:edit';

        return $rep;
    }

    /**
     * Modify an existing presentation.
     *
     * @return \jResponseHtmlFragment|\jResponseRedirect The HTML form for presentation creation
     */
    public function modify()
    {
        // Setup
        $repository = $this->param('repository');
        $project = $this->param('project');
        $itemType = $this->param('item_type', 'presentation');
        $setup = $this->setup($repository, $project, $itemType);
        if ($setup !== null) {
            return $setup;
        }

        // Check the given ID
        $id = $this->intParam('id', -999, true);
        $checkId = $this->checkGivenId($id, $itemType);
        if ($checkId !== null) {
            return $checkId;
        }

        // Get the form
        $ressourceName = 'presentation';
        if ($itemType == 'page') {
            $ressourceName = 'presentation_page';
        }
        $form = \jForms::create("presentation~{$ressourceName}", $this->id);
        $form->initFromDao("presentation~{$ressourceName}", $this->id);
        $form->setData('submit_button', 'submit');
        $form->setData('repository', $this->repository);
        $form->setData('project', $this->project);
        $form->setData('item_type', $itemType);

        // Get login
        if ($itemType == 'presentation') {
            $login = null;
            $isConnected = \jAuth::isConnected();
            if ($isConnected) {
                $user = \jAuth::getUserSession();
                $login = $user->login;
            }
            $form->setData('updated_by', $login);
        }

        // Redirect to the edit method
        /** @var \jResponseRedirect $rep */
        $rep = $this->getResponse('redirect');
        $rep->params = array(
            'project' => $this->project,
            'repository' => $this->repository,
            'id' => $this->id,
            'status' => 'modify',
            'item_type' => $itemType,
        );
        $rep->action = 'presentation~presentation:edit';

        return $rep;
    }

    /**
     * Display the editing form for a new or existing presentation.
     *
     * @return \jResponseHtmlFragment|\jResponseRedirect The HTML form for presentation creation
     */
    public function edit()
    {
        // Setup
        $repository = $this->param('repository');
        $project = $this->param('project');
        $itemType = $this->param('item_type', 'presentation');
        $setup = $this->setup($repository, $project, $itemType);
        if ($setup !== null) {
            return $setup;
        }

        // Check the given ID
        $action = $this->param('status', 'create');
        $id = $this->intParam('id', -999, true);
        $this->id = $id;
        if ($action == 'modify') {
            $checkId = $this->checkGivenId($id, $itemType);
            if ($checkId !== null) {
                return $checkId;
            }
        }

        // Get the form
        $ressourceName = 'presentation';
        if ($itemType == 'page') {
            $ressourceName = 'presentation_page';
        }
        $form = \jForms::get("presentation~{$ressourceName}", $id);
        if (!$form) {
            $form = jForms::create("presentation~{$ressourceName}", $id);
        }

        // Use template to create html form content
        $tpl = new jTpl();
        $tpl->assign('form', $form);
        $content = $tpl->fetch("presentation~{$ressourceName}_form");

        // Return html fragment response
        /** @var \jResponseHtmlFragment $rep */
        $rep = $this->getResponse('htmlfragment');
        $rep->addContent($content);

        return $rep;
    }

    /**
     * Get the target path of the root folder to store the presentation files.
     *
     * @param string $repository lizmap repository code
     * @param string $project    lizmap project code
     * @param string $uuid       presentation uuid
     *
     * @return array The target relative and full path
     */
    private function getTargetFullPath($repository, $project, $uuid)
    {
        $lizmapProject = lizmap::getProject($repository.'~'.$project);
        $repositoryPath = $lizmapProject->getRepository()->getPath();
        $targetPath = 'media/upload/presentations/'.$lizmapProject->getKey().'/'.$uuid.'/';
        $targetFullPath = $repositoryPath.$targetPath;
        if (!is_dir($targetFullPath)) {
            \jFile::createDir($targetFullPath);
        }

        return array($targetPath, $targetFullPath, $repositoryPath);
    }

    /**
     * Save the given presentation form data.
     *
     * @return \jResponseHtmlFragment|\jResponseRedirect
     */
    public function save()
    {
        $id = $this->intParam('id', -999, true);
        $itemType = $this->param('item_type', 'presentation');

        // Get the form
        $ressourceName = 'presentation';
        if ($itemType == 'page') {
            $ressourceName = 'presentation_page';
        }
        $form = \jForms::fill("presentation~{$ressourceName}", $id);

        // Setup
        $repository = $form->getData('repository');
        $project = $form->getData('project');
        $setup = $this->setup($repository, $project, $itemType);
        if ($setup !== null) {
            return $setup;
        }

        // Checks
        if (!$form->check()) {
            // Invalid form: redirect to the display action
            /** @var \jResponseRedirect $rep */
            $rep = $this->getResponse('redirect');
            $rep->action = 'presentation~presentation:edit';
            $rep->params = array(
                'project' => $this->project,
                'repository' => $this->repository,
                'id' => $this->id,
                'status' => 'error',
                'item_type' => $itemType,
            );

            return $rep;
        }

        // Uploads
        $uuid = $form->getData('uuid');
        $presentationUuid = $uuid;
        if ($itemType == 'page') {
            $presentationUuid = $form->getData('presentation_uuid');
        }
        list($targetPath, $targetFullPath, $repositoryPath) = $this->getTargetFullPath($this->repository, $this->project, $presentationUuid);

        // Save files
        if ($itemType == 'page') {
            $uuid = $form->getData('uuid');
            $fileInputs = array('background_image', 'illustration_media');
            foreach ($fileInputs as $input) {
                $fileName = $form->getData($input);
                if (!$fileName) {
                    continue;
                }
                $fileExtensionCheck = explode('.', $fileName);
                $extension = end($fileExtensionCheck);
                if ($extension === false) {
                    $extension = 'txt';
                }
                $targetFileName = "{$itemType}_{$input}_{$uuid}.{$extension}";
                $saveFile = $form->saveFile(
                    $input,
                    $targetFullPath,
                    $targetFileName
                );
                if (!$saveFile) {
                    $form->setErrorOn($input, 'Error while saving the file '.$input);

                    /** @var \jResponseRedirect $rep */
                    $rep = $this->getResponse('redirect');
                    $rep->action = 'presentation~presentation:edit';
                    $rep->params = array(
                        'project' => $this->project,
                        'repository' => $this->repository,
                        'id' => $this->id,
                        'status' => 'error',
                        'item_type' => $itemType,
                    );

                    return $rep;
                }
                $form->setData($input, $targetPath.$targetFileName);
            }
        }

        // Save the data
        try {
            $primaryKey = $form->saveToDao("presentation~{$ressourceName}", $id);
        } catch (Exception $e) {
            /** @var \jResponseRedirect $rep */
            $rep = $this->getResponse('redirect');
            $rep->action = 'presentation~presentation:edit';
            $rep->params = array(
                'project' => $this->project,
                'repository' => $this->repository,
                'id' => $this->id,
                'status' => 'error',
                'item_type' => $itemType,
            );

            return $rep;
        }
        if ($id != -999) {
            $primaryKey = $id;
        }

        // Destroy the form
        $title = $form->getData('title');
        jForms::destroy("presentation~{$ressourceName}", $id);

        // Display confirmation
        /** @var \jResponseHtmlFragment $rep */
        $rep = $this->getResponse('htmlfragment');
        $success = jLocale::get(
            'presentation~presentation.form.success.presentation.saved',
            array($title)
        );
        if ($itemType == 'page') {
            $success = jLocale::get(
                'presentation~presentation.form.success.page.saved',
                array($title)
            );
        }
        $rep->addContent($success);

        return $rep;
    }

    /**
     * Delete an existing presentation.
     *
     * @return \jResponseHtmlFragment The HTML form for presentation creation
     */
    public function delete()
    {
        // Setup
        $repository = $this->param('repository');
        $project = $this->param('project');
        $itemType = $this->param('item_type', 'presentation');
        $setup = $this->setup($repository, $project, $itemType);
        if ($setup !== null) {
            return $setup;
        }

        // Check the given ID
        $id = $this->intParam('id', -999, true);
        $checkId = $this->checkGivenId($id, $itemType);
        if ($checkId !== null) {
            return $checkId;
        }

        // Delete the given item
        /** var \jDaoFactoryBase $dao */
        $ressourceName = 'presentation';
        if ($itemType == 'page') {
            $ressourceName = 'presentation_page';
        }

        $dao = \jDao::get("presentation~{$ressourceName}");

        /** var \jDaoRecordBase $item */
        $item = $dao->get($this->id);
        $title = $item->title;

        // Prepare path to remove
        $uuid = $item->uuid;
        $presentationUuid = $uuid;
        if ($itemType == 'page') {
            $presentationUuid = $item->presentation_uuid;
        }
        list($targetPath, $targetFullPath, $repositoryPath) = $this->getTargetFullPath($this->repository, $this->project, $presentationUuid);

        try {
            $delete = $dao->delete($this->id);

            // Remove files
            if ($itemType == 'page') {
                // Remove files for the page
                foreach (array('background_image', 'illustration_media') as $field) {
                    if ($item->{$field}) {
                        $filePath = $repositoryPath.$item->{$field};
                        if (file_exists($filePath)) {
                            unlink($filePath);
                        }
                    }
                }
            } else {
                // Remove the presentation directory
                jFile::removeDir($targetFullPath);
            }

            /** var \jResponseHtmlFragment $rep */
            $rep = $this->getResponse('htmlfragment');
            $success = jLocale::get(
                'presentation~presentation.form.success.presentation.deleted',
                array($title)
            );
            if ($itemType == 'page') {
                $success = jLocale::get(
                    'presentation~presentation.form.success.page.deleted',
                    array($title)
                );
            }
            $rep->addContent($success);

            return $rep;
        } catch (Exception $e) {
            $title = jLocale::get('presentation~presentation.form.error.delete.presentation.title');
            $detail = jLocale::get(
                'presentation~presentation.form.error.delete.presentation.detail',
                array($id)
            );
            if ($itemType == 'page') {
                $title = jLocale::get('presentation~presentation.form.error.delete.page.title');
                $detail = jLocale::get(
                    'presentation~presentation.form.error.delete.page.detail',
                    array($id)
                );
            }

            return $this->error(
                array(
                    array(
                        'title' => $title,
                        'detail' => $detail,
                    ),
                ),
            );
        }
    }
}
