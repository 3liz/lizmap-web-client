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
        $setup = $this->setup($repository, $project);
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

            case 'detail':
                return $this->detail();

                break;
        }

        return $this->error(
            array(
                array(
                    'title' => 'Not supported request',
                    'detail' => 'The request "'.$request.'" is not supported!',
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
     *
     * @urlparam $REQUEST Request type
     *
     * @return null|\jResponseHtmlFragment the request response
     */
    private function setup($repository, $project)
    {
        // Check presentation config
        jClasses::inc('presentation~presentationConfig');
        $presentationConfig = new presentationConfig($repository, $project);
        if (!$presentationConfig->getStatus()) {
            return $this->error($presentationConfig->getErrors());
        }

        $this->repository = $repository;
        $this->project = $project;

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
     *
     * @return null|jResponseHtmlFragment The error response if a problem has been detected,
     *                                    null if the presentation exists
     */
    private function checkGivenId($id)
    {
        // Get the presentation with the given id
        if ($id === null) {
            return $this->error(
                array(
                    array(
                        'title' => 'Parameter id is not valid',
                        'detail' => 'The required parameter id must be a positive integer !',
                    ),
                )
            );
        }

        // Get the corresponding presentation
        $dao = \jDao::get('presentation~presentation');
        $presentation = $dao->get($id);
        if ($presentation === null) {
            return $this->error(
                array(
                    array(
                        'title' => 'No presentation for the given id',
                        'detail' => 'There is no presentation with id = "'.$id.'" !',
                    ),
                )
            );
        }

        $this->id = $id;

        return null;
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
        $setup = $this->setup($repository, $project);
        if ($setup !== null) {
            return $setup;
        }

        // Get the form
        $form = \jForms::create('presentation~presentation', -999);
        $form->setData('submit_button', 'submit');
        $form->setData('repository', $this->repository);
        $form->setData('project', $this->project);

        // Get login
        $login = null;
        $isConnected = \jAuth::isConnected();
        if ($isConnected) {
            $user = \jAuth::getUserSession();
            $login = $user->login;
        }
        $form->setData('created_by', $login);
        $form->setData('updated_by', $login);

        // Redirect to the edit method
        /** @var \jResponseRedirect $rep */
        $rep = $this->getResponse('redirect');
        $rep->params = array(
            'project' => $this->project,
            'repository' => $this->repository,
            'status' => 'create',
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
        $setup = $this->setup($repository, $project);
        if ($setup !== null) {
            return $setup;
        }

        // Check the given ID
        $id = $this->intParam('id', -999, true);
        $checkId = $this->checkGivenId($id);
        if ($checkId !== null) {
            return $checkId;
        }

        // Get the form
        $form = \jForms::create('presentation~presentation', $this->id);
        $form->initFromDao('presentation~presentation', $this->id);
        $form->setData('submit_button', 'submit');
        $form->setData('repository', $this->repository);
        $form->setData('project', $this->project);

        // Get login
        $login = null;
        $isConnected = \jAuth::isConnected();
        if ($isConnected) {
            $user = \jAuth::getUserSession();
            $login = $user->login;
        }
        $form->setData('updated_by', $login);

        // Redirect to the edit method
        /** @var \jResponseRedirect $rep */
        $rep = $this->getResponse('redirect');
        $rep->params = array(
            'project' => $this->project,
            'repository' => $this->repository,
            'id' => $this->id,
            'status' => 'modify',
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
        $setup = $this->setup($repository, $project);
        if ($setup !== null) {
            return $setup;
        }

        // Check the given ID
        $action = $this->param('status', 'create');
        $id = $this->intParam('id', -999, true);
        $this->id = $id;
        if ($action == 'modify') {
            $checkId = $this->checkGivenId($id);
            if ($checkId !== null) {
                return $checkId;
            }
        }

        // Get the form
        $form = \jForms::get('presentation~presentation', $id);
        if (!$form) {
            $form = jForms::create('presentation~presentation', $id);
        }

        // Use template to create html form content
        $tpl = new jTpl();
        $tpl->assign('form', $form);
        $content = $tpl->fetch('presentation~presentation_form');

        // Return html fragment response
        /** @var \jResponseHtmlFragment $rep */
        $rep = $this->getResponse('htmlfragment');
        $rep->addContent($content);

        return $rep;
    }

    /**
     * Save the given presentation form data.
     *
     * @return \jResponseHtmlFragment|\jResponseRedirect
     */
    public function save()
    {
        $id = $this->intParam('id', -999, true);

        // Get the form
        $form = \jForms::fill('presentation~presentation', $id);

        // Setup
        $repository = $form->getData('repository');
        $project = $form->getData('project');
        $setup = $this->setup($repository, $project);
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
            );

            return $rep;
        }

        // Save the data
        $primaryKey = $form->saveToDao('presentation~presentation', $id);

        // Destroy the form
        $title = $form->getData('title');
        jForms::destroy('presentation~presentation', $id);

        // Display confirmation
        /** @var \jResponseHtmlFragment $rep */
        $rep = $this->getResponse('htmlfragment');
        $rep->addContent("The presentation '{$title}' has been successfully saved");

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
        $setup = $this->setup($repository, $project);
        if ($setup !== null) {
            return $setup;
        }

        // Check the given ID
        $id = $this->intParam('id', -999, true);
        $checkId = $this->checkGivenId($id);
        if ($checkId !== null) {
            return $checkId;
        }

        // Delete the given presentation
        /** var \jDaoFactoryBase $dao */
        $dao = \jDao::get('presentation~presentation');
        $presentation = $dao->get($this->id);

        try {
            $delete = $dao->delete($this->id);

            /** var \jResponseHtmlFragment $rep */
            $rep = $this->getResponse('htmlfragment');
            $content = "The presentation '{$presentation->title}' has been successfully deleted";
            $rep->addContent($content);

            return $rep;
        } catch (Exception $e) {
            return $this->error(
                array(
                    array(
                        'title' => 'The presentation cannot be deleted',
                        'detail' => 'An error occurred while deleting the presentation n°"'.$this->id.'" !',
                    ),
                ),
            );
        }
    }

    /**
     * Returns the HTML to setup a given presentation.
     *
     * This will show a list of pages and buttons to add or remove pages.
     *
     * @return \jResponseHtmlFragment the HTML content
     */
    public function detail()
    {
        // Setup
        $repository = $this->param('repository');
        $project = $this->param('project');
        $setup = $this->setup($repository, $project);
        if ($setup !== null) {
            return $setup;
        }

        // Check the given ID
        $id = $this->intParam('id', -999, true);
        $checkId = $this->checkGivenId($id);
        if ($checkId !== null) {
            return $checkId;
        }

        // Use template to create html form content
        $content = "Detail presentation for {$this->id}";

        // Return html fragment response
        /** @var \jResponseHtmlFragment $rep */
        $rep = $this->getResponse('htmlfragment');
        $rep->addContent($content);

        return $rep;
    }
}
