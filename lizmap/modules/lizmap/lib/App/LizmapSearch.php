<?php

namespace Lizmap\App;

class LizmapSearch
{
    public const PROFILE_NAME = 'search';

    private AppContextInterface $appContext;

    public function __construct(AppContextInterface $appContext)
    {
        $this->appContext = $appContext;
    }

    public function hasProfile()
    {
        try {
            // try to get the specific search profile
            $this->appContext->getProfile('jdb', self::PROFILE_NAME, true);
        } catch (\Exception $e) {

            return false;
        }

        return true;
    }

    public function initProfileForm(\jFormsBase $form)
    {
        $profileConf = $this->appContext->getProfile('jdb', self::PROFILE_NAME);

        $props = array('host', 'database', 'user', 'search_path');
        foreach ($props as $p) {
            $form->setData($p, $profileConf[$p]);
        }
        $form->deactivate('confirm_invalid');
        $form->deactivate('error_message');
    }

    public function check()
    {
        $ok = false;
        $profile = null;
        if ($this->hasProfile()) {
            $profile = self::PROFILE_NAME;
        }

        try {
            $cnx = $this->appContext->getDbConnection($profile);
        } catch (\Exception $e) {
            // log ?
            $this->appContext->logException($e, 'error');

            return false;
        }
        // The Lizmap FTS search is only available for PostgreSQL
        if ($cnx->dbms != 'pgsql') {
            return false;
        }
        // Check if lizmap_search table / view / materialized view exists
        // in the search_path
        $sql = "
            SELECT EXISTS (
            SELECT FROM
                pg_catalog.pg_class c
            JOIN
                pg_catalog.pg_namespace n ON
                n.oid = c.relnamespace
            WHERE
                n.nspname = ANY(current_schemas(FALSE)) AND
                -- current_schemas(FALSE) returns the list of schemas in the search_path
                c.relname = 'lizmap_search' AND
                c.relkind = ANY(ARRAY['r', 'v', 'm', 'f', 'p'])
                -- r = ordinary table, v = view, m = materialized view, f = foreign table, p = partitioned
            ) AS lizmap_search_exists;
        ";

        try {
            $res = $cnx->query($sql);
            foreach ($res as $r) {
                return $r->lizmap_search_exists;
            }
        } catch (\Exception $e) {
            $this->appContext->logException($e, 'error');

            return false;
        }

        return false;
    }
}
