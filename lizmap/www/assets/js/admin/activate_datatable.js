
$(document).ready(function() {

    // Activate datatable for the project list table
    if ($('table.lizmap_project_list').length) {
        $('table.lizmap_project_list').DataTable({
            "paging":   false,
            scrollY:        '50vh',
            scrollCollapse: true,
            "info":     true
        });
    }
});
