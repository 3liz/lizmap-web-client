<?php
/**
* Displays an embedded map based on one Qgis project.
* @package   lizmap
* @subpackage view
* @author    3liz
* @copyright 2011 3liz
* @link      http://3liz.com
* @license    Mozilla Public License : http://www.mozilla.org/MPL/
*/

include jApp::getModulePath('view').'controllers/lizMap.classic.php';

class embedCtrl extends lizMapCtrl {

    function index() {
        $req = jApp::coord()->request;
        $req->params['h'] = 0;
        $req->params['l'] = 0;

        $rep = parent::index();

        if ( $rep->getType() != 'html' )
            return $rep;

        // add embed specific css
        $bp = jApp::config()->urlengine['basePath'];
        $rep->addCSSLink($bp.'css/embed.css');
        $themePath = $bp.'themes/'.jApp::config()->theme.'/';
        $rep->addCSSLink($themePath.'css/embed.css');
        // force undisplay home
        $rep->addStyle('#mapmenu li.home','display:none;');
        // do not display locate by layer
        // display tooltip at bottom
        $jsCode = "
        $( document ).ready( function() {
          lizMap.events.on({
            'uicreated':function(evt){
              // it's an embedded content
              $('#content').addClass('embed');

              // move tooltip placement
              $('#mapmenu .nav-list > li > a').tooltip('destroy').tooltip({placement:'bottom'});

              //move search tool
              var search = $('#nominatim-search');
              if ( search.length != 0 ) {
                $('#mapmenu').append(search);
                $('#nominatim-search div.dropdown-menu').removeClass('pull-right').addClass('pull-left');
              }

              //calculate dock position and size
              $('#dock').css('top', ($('#mapmenu').height()+10)+'px');
              lizMap.updateContentSize();

              // force mini-dock and sub-dock position
              $('#mini-dock').css('top', $('#dock').css('top'));
              $('#sub-dock').css('top', $('#dock').css('top'));

              // Force display popup on the map
              lizMap.config.options.popupLocation = 'map';

              // Force close tools
              if ( $('#mapmenu li.locate').hasClass('active') )
                $('#button-locate').click();
              if ( $('#mapmenu li.switcher').hasClass('active') )
                $('#button-switcher').click();
              if ( $('#overview-toggle').hasClass('active') )
                $('#overview-toggle').click();
            },
            'dockopened': function(evt) {
                // one tool at a time
                var activeMenu = $('#mapmenu ul li.nav-minidock.active a');
                if ( activeMenu.length != 0 )
                    activeMenu.click();
            },
            'minidockopened': function(evt) {
                // one tool at a time
                var activeMenu = $('#mapmenu ul li.nav-dock.active a');
                if ( activeMenu.length != 0 )
                    activeMenu.click();

                // adapte locateByLayer display

                if ( evt.id == 'locate' ) {
                  // autocompletion items for locatebylayer feature
                  $('div.locate-layer select').hide();
                  $('span.custom-combobox').show();
                  $('#locate div.locate-layer input.custom-combobox-input').autocomplete('option', 'position', {my : 'left top', at: 'left bottom'});
                }
            }
          });
        });
        ";
        $rep->addJSCode($jsCode);

        // Get repository key
        $repository = $this->repositoryKey;
        // Get the project key
        $project = $this->projectKey;

        $rep->body->assign('auth_url_return',
            jUrl::get('view~map:index',
                array(
                    "repository"=>$repository,
                    "project"=>$project,
                )
            )
        );

        return $rep;
  }

  protected function getProjectDockables() {
    $assign = parent::getProjectDockables();
    $available = array('switcher', 'metadata', 'locate', 'measure', 'tooltip-layer');//, 'print', 'permaLink'
    $dAssign = array();
    foreach ( $assign['dockable'] as $dock ) {
        if ( in_array( $dock->id, $available ) )
            $dAssign[] = $dock;
    }
    $assign['dockable'] = $dAssign;
    $mdAssign = array();
    foreach ( $assign['minidockable'] as $dock ) {
        if ( in_array( $dock->id, $available ) )
            $mdAssign[] = $dock;
    }
    $assign['minidockable'] = $mdAssign;
    $bdAssign = array();
    foreach ( $assign['bottomdockable'] as $dock ) {
        if ( in_array( $dock->id, $available ) )
            $bdAssign[] = $dock;
    }
    $assign['bottomdockable'] = $bdAssign;
    $rdAssign = array();
    foreach ( $assign['rightdockable'] as $dock ) {
        if ( in_array( $dock->id, $available ) )
            $rdAssign[] = $dock;
    }
    $assign['rightdockable'] = $rdAssign;
    return $assign;
  }
}