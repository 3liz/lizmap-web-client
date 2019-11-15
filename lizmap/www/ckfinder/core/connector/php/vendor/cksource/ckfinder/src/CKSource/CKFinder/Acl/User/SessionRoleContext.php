<?php

/*
 * CKFinder
 * ========
 * https://ckeditor.com/ckeditor-4/ckfinder/
 * Copyright (c) 2007-2019, CKSource - Frederico Knabben. All rights reserved.
 *
 * The software, this file and its contents are subject to the CKFinder
 * License. Please read the license.txt file before using, installing, copying,
 * modifying or distribute this file or part of its contents. The contents of
 * this file is part of the Source Code of CKFinder.
 */

namespace CKSource\CKFinder\Acl\User;

/**
 * The SessionRoleContext class.
 *
 * SessionRoleContext is used to get the user role from the defined $_SESSION field.
 */
class SessionRoleContext implements RoleContextInterface
{
    /**
     * The $_SESSION field name to use.
     *
     * @var string $sessionRoleField
     */
    protected $sessionRoleField;

    /**
     * Sets the $_SESSION field name to use.
     *
     * @param string $sessionRoleField
     */
    public function __construct($sessionRoleField)
    {
        $this->sessionRoleField = $sessionRoleField;
    }

    /**
     * Returns the role name of the current user.
     *
     * @return null|string
     */
    public function getRole()
    {
        if (strlen($this->sessionRoleField) && isset($_SESSION[$this->sessionRoleField])) {
            return (string) $_SESSION[$this->sessionRoleField];
        }

        return null;
    }
}
