{ifacl2 'lizmap.admin.project.list.view'}
{meta_html js $j_basepath.'assets/js/qgis-projects-list.js'}

<h2>{@admin.menu.lizmap.project.list.label@}</h2>

<div id="lizmap_project_list_container" data-base-url='{$baseurl}'>
    <div id="lizmap_project_list">
        {zone 'admin~project_list', ["repository" => $repository, 'repositoriesList' => $repositoriesList]}
    </div>
</div>

{/ifacl2}
