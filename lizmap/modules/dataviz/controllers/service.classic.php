<?php

use Lizmap\App\Checker;
use Lizmap\Project\Project;
use Lizmap\Project\UnknownLizmapProjectException;
use Lizmap\Request\Proxy;
use LizmapDataviz\Plot\PlotFactory;

/**
 * PHP Dataviz service to get plot config.
 *
 * @author    3liz
 * @copyright 2017 3liz
 *
 * @see      http://3liz.com
 *
 * @license    Mozilla Public License
 */
class serviceCtrl extends jController
{
    /**
     * @var null|Project the Lizmap project
     */
    private $lizmapProject;

    /**
     * @var datavizConfig
     */
    private $config;

    /**
     * @var bool If the basic authentication is used
     */
    private $basicAuthUsed = false;

    /**
     * @var bool Debug mode
     */
    private $debugMode;

    /**
     * Redirect to the appropriate action depending on the REQUEST parameter.
     *
     * @urlparam $REPOSITORY Name of the repository
     * @urlparam $PROJECT Name of the project
     * @urlparam $REQUEST Request type
     *
     * @return jResponseBinary|jResponseJson the request response
     */
    public function index()
    {
        // Optional BASIC authentication
        $ok = Checker::checkCredentials($_SERVER);
        if (!$ok) {
            return $this->error(
                array(
                    'code' => 401,
                    'error_code' => 'wrong_credentials',
                    'title' => jLocale::get('dataviz~dataviz.log.wrong_credentials.title'),
                    'detail' => jLocale::get('dataviz~dataviz.log.wrong_credentials.detail'),
                )
            );
        }

        $rep = $this->processRequest();
        Checker::logoutCredentials($_SERVER);

        return $rep;
    }

    /**
     * Process the request.
     *
     * @return jResponseBinary|jResponseJson the request response
     */
    protected function processRequest()
    {
        // Get the debug mode status
        $services = lizmap::getServices();
        $this->debugMode = $services->debugMode;

        // Check project
        $repository = $this->param('repository');
        $project = $this->param('project');
        $plotConfigParameter = $this->param('plot_config');

        if ($this->debugMode == '1') {
            jLog::log('Dataviz - repository: '.$repository.' - project: '.$project, 'lizmapadmin');
        }

        // Check if basic authentication is used
        if (isset($_SERVER['PHP_AUTH_USER'])) {
            $this->basicAuthUsed = true;
        }

        if ($this->debugMode == '1') {
            jLog::log('Dataviz - basic authentication  = '.json_encode($this->basicAuthUsed), 'lizmapadmin');
        }

        // Check the repository exists
        $lizmapRepository = lizmap::getRepository($repository);
        if (!$lizmapRepository) {
            return $this->error(
                array(
                    'code' => 404,
                    'error_code' => 'repository_not_found',
                    'title' => jLocale::get('dataviz~dataviz.log.repository_not_found.title'),
                    'detail' => jLocale::get('dataviz~dataviz.log.repository_not_found.detail', array($repository)),
                )
            );
        }

        // Check project
        try {
            $lizmapProject = lizmap::getProject($repository.'~'.$project);
            if (!$lizmapProject) {
                return $this->error(
                    array(
                        'code' => 404,
                        'error_code' => 'project_not_found',
                        'title' => jLocale::get('dataviz~dataviz.log.project_not_found.title'),
                        'detail' => jLocale::get('dataviz~dataviz.log.project_not_found.detail', array($project, $repository)),
                    )
                );
            }
        } catch (UnknownLizmapProjectException $e) {
            return $this->error(
                array(
                    'code' => 404,
                    'error_code' => 'project_not_found',
                    'title' => jLocale::get('dataviz~dataviz.log.project_not_found.title'),
                    'detail' => jLocale::get('dataviz~dataviz.log.project_not_found.detail', array($project, $repository)),
                )
            );
        }
        $this->lizmapProject = $lizmapProject;

        // Redirect if no rights to access this repository
        if (!$lizmapProject->checkAcl()) {
            return $this->error(
                array(
                    'code' => 403,
                    'error_code' => 'access_denied',
                    'title' => jLocale::get('dataviz~dataviz.log.access_denied.title'),
                    'detail' => jLocale::get('dataviz~dataviz.log.access_denied.detail'),
                )
            );
        }

        // Check dataviz config only for plots configured for this project layers
        // If a plot_config is given and basic authentication is used for the connected user,
        // do not raise an error, as the dataviz configuration might be empty
        jClasses::inc('dataviz~datavizConfig');
        $datavizConfig = new datavizConfig($repository, $project);
        if (empty($plotConfigParameter) && !$this->basicAuthUsed) {
            if (!$datavizConfig->getStatus()) {
                return $this->error(
                    $datavizConfig->getErrors(),
                );
            }
        }
        // Get the content of dataviz configuration
        $config = $datavizConfig->getConfig();

        // Do not report errors also for dataviz API if there is an empty configuration
        if (empty($config) && empty($plotConfigParameter) && !$this->basicAuthUsed) {
            return $this->error(
                $datavizConfig->getErrors(),
            );
        }
        $this->config = $config;

        // Redirect to method corresponding on REQUEST param
        $request = $this->param('request', 'getplot');
        if (strtolower($request) == 'getplot') {
            return $this->GetPlot();
        }

        return $this->error(
            array(
                'code' => 400,
                'error_code' => 'request_not_supported',
                'title' => jLocale::get('dataviz~dataviz.log.request_not_supported.title'),
                'detail' => jLocale::get('dataviz~dataviz.log.request_not_supported.detail', array($request)),
            )
        );
    }

    /**
     * Provide errors.
     *
     * @param mixed $errors
     *
     * @return jResponseJson the errors response
     */
    protected function error($errors)
    {
        /** @var jResponseJson $rep */
        $rep = $this->getResponse('json');

        // HTTP status code
        if (array_key_exists('code', $errors)) {
            $code = (int) $errors['code'];
            $rep->setHttpStatus(
                $code,
                Proxy::getHttpStatusMsg($code)
            );
        }
        $rep->data = array('errors' => $errors);

        return $rep;
    }

    /**
     * Get Plot config.
     *
     * @return jResponseBinary|jResponseJson the GetPlot response, or the errors
     */
    protected function GetPlot()
    {
        // Get params
        $plot_id = $this->intParam('plot_id');
        $exp_filter = trim((string) $this->param('exp_filter'));
        $plotConfigParameter = $this->param('plot_config');

        if ($this->debugMode == '1') {
            jLog::log('Dataviz - parameter plot_id     = '.$plot_id, 'lizmapadmin');
            jLog::log('Dataviz - parameter exp_filter  = '.$exp_filter, 'lizmapadmin');
            $logPlotConfigParameter = $plotConfigParameter;
            if (is_array($plotConfigParameter)) {
                $logPlotConfigParameter = json_encode($plotConfigParameter);
            }
            jLog::log('Dataviz - parameter plot_config = '.$logPlotConfigParameter, 'lizmapadmin');
        }

        // Get the plot configuration from Lizmap config file
        $plotConfig = null;
        if ($this->config !== null && array_key_exists($plot_id, $this->config['layers'])) {
            $plotConfig = $this->config['layers'][$plot_id];
            if ($this->debugMode == '1') {
                jLog::log('Dataviz - a plot configuration exists for this plot_id = '.$plot_id, 'lizmapadmin');
            }
        }

        // Get the configuration from the parameter
        // This allow to test the plot from outside LWC
        // For example from the QGIS Lizmap plugin
        // Only if basic authentication has been used*
        if (!empty($plotConfigParameter) && !is_array($plotConfigParameter)) {
            // Convert the given string to a PHP array if needed
            if ($this->debugMode == '1') {
                jLog::log('Dataviz - the given plot_config must be converted to an Array', 'lizmapadmin');
            }
            $plotConfigParameter = json_decode($plotConfigParameter, true);
        }
        if (!empty($plotConfigParameter) && $this->basicAuthUsed && jAuth::isConnected()) {
            if ($this->debugMode == '1') {
                jLog::log('Dataviz - parameter plot_config is not empty & basic authentication is used', 'lizmapadmin');
            }

            // Transform back to object
            $configObject = json_decode(json_encode($plotConfigParameter), false);

            // Parse the plot configuration
            $parsedPlotConfig = $this->lizmapProject->parseDatavizPlotConfig($configObject);
            if (!empty($parsedPlotConfig)) {
                $plotConfig = $parsedPlotConfig;
                if ($this->debugMode == '1') {
                    jLog::log('Dataviz - plot_config is used to override the original plot configuration', 'lizmapadmin');
                }
            } else {
                if (property_exists($configObject, 'layerId')) {
                    $getLayer = $this->lizmapProject->findLayerByAnyName($configObject->layerId);
                    if (!$getLayer) {
                        return $this->error(
                            array(
                                'code' => 404,
                                'error_code' => 'layer_not_found',
                                'title' => jLocale::get('dataviz~dataviz.log.layer_not_found.title'),
                                'detail' => jLocale::get('dataviz~dataviz.log.layer_not_found.detail', array($configObject->layerId)),
                            )
                        );
                    }
                }
            }
        }

        // No valid configuration found, return the corresponding error
        if (!$plotConfig) {
            return $this->error(
                array(
                    'code' => 404,
                    'error_code' => 'plot_configuration_not_found',
                    'title' => jLocale::get('dataviz~dataviz.log.plot_configuration_not_found.title'),
                    'detail' => jLocale::get('dataviz~dataviz.log.plot_configuration_not_found.detail'),
                )
            );
        }

        // Create plot
        $type = $plotConfig['plot']['type'] ?? '';
        $dplot = PlotFactory::create($this->lizmapProject, $plotConfig);
        if (!$dplot) {
            return $this->error(
                array(
                    'code' => 400,
                    'error_code' => 'invalid_plot_type',
                    'title' => jLocale::get('dataviz~dataviz.log.invalid_plot_type.title'),
                    'detail' => jLocale::get('dataviz~dataviz.log.invalid_plot_type.detail', array($type)),
                )
            );
        }

        $fd = $dplot->fetchData($exp_filter);
        if (!$fd) {
            return $this->error(
                array(
                    'code' => 404,
                    'error_code' => 'no_data',
                    'title' => jLocale::get('dataviz~dataviz.log.no_data.title'),
                    'detail' => jLocale::get('dataviz~dataviz.log.no_data.detail', array($plotConfig['layer_id'])),
                )
            );
        }
        // We also add the URL to access the Plotly JavaScript file
        // to let the client use the same one
        $basePath = jApp::config()->urlengine['basePath'];
        $locale = substr(jApp::config()->locale, 0, 2);
        $plotly = array(
            'script' => $basePath.'assets/js/dataviz/plotly-custom.min.js',
            'locale' => $basePath.'assets/js/dataviz/plotly-locale-'.$locale.'.js',
        );

        // Stream the JSON response: the plot values are copied
        // from temporary streams, without being loaded in memory
        /** @var jResponseBinary $rep */
        $rep = $this->getResponse('binary');
        $rep->mimeType = 'application/json';
        $rep->outputFileName = 'plot.json';
        $rep->doDownload = false;
        $rep->setContentCallback(function () use ($dplot, $plotly) {
            // Write the plot JSON directly to the response output
            $output = fopen('php://output', 'w');
            $dplot->writeJson($output, array('plotly' => $plotly));
            fclose($output);
        });

        return $rep;
    }
}
