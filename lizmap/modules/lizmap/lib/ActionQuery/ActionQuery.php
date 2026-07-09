<?php

namespace Lizmap\ActionQuery;

use Lizmap\App\AppContextInterface;
use Lizmap\App\SqlTools;

class ActionQuery
{
    /** @var \jDbConnection */
    private $cnx;
    private AppContextInterface $appContext;

    private string $repository;
    private string $project;
    private string $layerId;

    public function __construct($cnx, string $repository, string $project, string $layerId, AppContextInterface $appContext)
    {
        $this->cnx = $cnx;
        $this->repository = $repository;
        $this->project = $project;
        $this->layerId = $layerId;
        $this->appContext = $appContext;
    }

    /**
     * Build the parameter array passed as a JSON object to lizmap_get_data.
     *
     * @param string                $scope     project|layer|feature
     * @param null|\qgisVectorLayer $qgisLayer
     * @param int|string            $featureId
     *
     * @return array<string, null|int|string>
     */
    public function buildParams(
        string $actionName,
        string $scope,
        $qgisLayer,
        $featureId,
        string $wkt,
        string $mapCenter,
        string $mapExtent
    ): array {
        $params = array(
            'lizmap_repository' => $this->repository,
            'lizmap_project' => $this->project,
            'action_name' => $actionName,
            'action_scope' => $scope,
            'layer_name' => null,
            'layer_schema' => null,
            'layer_table' => null,
            'feature_id' => null,
            'map_center' => $mapCenter,
            'map_extent' => $mapExtent,
            'wkt' => $wkt,
        );

        $params['user_login'] = $this->appContext->userIsConnected() ? $this->appContext->getUserSession()->login : 'anonymous';

        if ($qgisLayer && in_array($scope, array('layer', 'feature'))) {
            $layerDatasource = $qgisLayer->getDatasourceParameters();
            $params['layer_name'] = $qgisLayer->getName();
            $params['layer_schema'] = $layerDatasource->schema;
            $params['layer_table'] = $layerDatasource->tablename;
            $params['feature_id'] = $featureId;
        }

        return $params;
    }

    /**
     * Build the SQL string and the ordered values list for the prepared statement.
     *
     * @param array<string, null|int|string> $params        Output of buildParams()
     * @param object                         $action        Action config object (must expose ->options)
     * @param array<string, mixed>           $clientOptions Options sent by the client
     *
     * @return array{0: string, 1: list<mixed>} [$sql, $sqlValues]
     */
    public function buildSql(array $params, object $action, array $clientOptions): array
    {
        $i = 1;
        $sqlParts = array();
        $sqlValues = array();

        foreach ($params as $key => $value) {
            $caster = ($key === 'feature_id') ? 'integer' : 'text';
            $sqlParts[] = "'{$key}', (\${$i})::{$caster}";
            $sqlValues[] = $value;
            ++$i;
        }

        foreach ($action->options as $key => $configValue) {
            $sqlParts[] = "'{$key}', (\${$i})::text";
            $clientValue = $clientOptions[$key] ?? '';
            [$validFilter, $block_items] = SqlTools::validateExpressionFilter($clientValue);
            if ($clientValue && $validFilter) {
                $sqlValues[] = $clientValue;
            } else {
                $this->appContext->logMessage(
                    'Choose the config value because the client option param contains dangerous chars : '.implode(', ', $block_items),
                    'lizmapadmin'
                );
                $sqlValues[] = $configValue;
            }
            ++$i;
        }

        $sql = '
            SELECT public.lizmap_get_data(
                json_build_object(
                '.implode(",\n", $sqlParts).'
                )
            ) AS data
        ';

        return array($sql, $sqlValues);
    }

    /**
     * Execute the prepared statement inside a transaction and return the decoded data.
     *
     * @param list<mixed> $sqlValues
     *
     * @return mixed Decoded JSON data returned by lizmap_get_data
     *
     * @throws \Exception on query failure (after rollback + log)
     */
    public function execute(string $sql, array $sqlValues)
    {
        $this->cnx->beginTransaction();

        try {
            $resultset = $this->cnx->prepare($sql);
            $resultset->execute($sqlValues);
            if ($resultset->id() === false) {
                throw new \Exception($this->cnx->errorCode());
            }
            $this->cnx->commit();
        } catch (\Exception $e) {
            $this->cnx->rollback();
            $this->appContext->logMessage(
                'Error in project '.$this->repository.'/'.$this->project.
                ', layer '.$this->layerId.
                ', while running the action with the PostgreSQL query : '.$sql.' → '.$e->getMessage(),
                'lizmapadmin'
            );

            throw $e;
        }

        $data = array();
        foreach ($resultset as $r) {
            if ($r->data) {
                $data = json_decode($r->data);
            }
        }

        return $data;
    }
}
