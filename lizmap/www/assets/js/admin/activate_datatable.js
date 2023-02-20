
$(document).ready(function () {

    // Activate datatable for the project list table
    if ($('table.lizmap_project_list').length) {

        // Activate the datatable functionality
        // for the projet list table
        var columnDefs = [
            {
                "targets": [2, 3],
                "visible": false,
                "searchable": false
            },{
                "targets": 'lzmplugv',
                "render": function ( data, type, row, meta ) {
                    if (type == 'display') {
                        return data.replace(/\.0/g,'.').replace(/^0/,'');
                    }
                    return data;
                }
            }
        ];
        if ($('table.lizmap_project_list').hasClass('has_inspection_data')) {
            columnDefs.push(
                {
                    "targets": [6, 8],
                    "visible": false,
                    "searchable": false
                }
            );
        }

        var project_table = $('table.lizmap_project_list').DataTable({
            "paging": false,
            'autoWidth': true,
            'scrollX': 'true',
            'scrollY': '65vh',
            'scrollCollapse': true,
            "info": true,
            "columnDefs": columnDefs
        });

        /**
         * Display the project detail in the right sidebar
         *
         * @param {Array} data The project data
         * @param {Boolean} has_inspection_data If the project has inspection data
         */
        function displayProjectDetail(data, has_inspection_data) {
            // Project title
            let title = data[1] ? data[1] : null;
            $('#dd_title_value').html(title);

            // Project abstract
            let abstract = data[2] ? data[2] : null;
            $('#dd_abstract_value').html(abstract);

            // Project image
            $('#dd_image_value').html(
                '<img src="' + data[3] + '"/>'
            );

            // Invalid layers
            var invalid_layers = null;
            if (has_inspection_data) {
                invalid_layers = data[6] ? data[6] : null;
            }
            $('#dd_invalid_layers_value').html(invalid_layers);

            // QGIS Logs
            var qgis_logs = '';
            if (has_inspection_data) {
                qgis_logs = data[8] ? data[8] : null;
            }
            $('#dd_qgis_logs_value').html(qgis_logs);
            $('#dd_qgis_logs_label, #dd_qgis_logs_value').toggle(has_inspection_data);

            // Hide dd & dt without data
            $('#lizmap_project_list_sidebar_content dd').each(function() {
                let has_val = ($(this).html() != '');
                $(this).toggle(has_val);
                $(this).prev('dt:first').toggle(has_val);
            });

            // Display the sidebar
            $('#lizmap_project_list_sidebar').removeClass('collapsed');
        }

        // Activate the click on a project line in the table
        $('table.lizmap_project_list tbody').on('click', 'tr', function () {
            // Check if the table has QGIS projects inspection data
            var has_inspection_data = false;
            if ($('table.lizmap_project_list').hasClass('has_inspection_data')) {
                has_inspection_data = true;
            }

            // Remove previous selected
            $('tr.selected').removeClass('selected');
            $(this).toggleClass('selected');
            let data = project_table.row('.selected').data();

            // Get the HTML to display in the sidebar with the project details
            displayProjectDetail(data, has_inspection_data);
        });

        // Click on first row
        $('table.lizmap_project_list tbody tr:eq(0)').click();

        // Adjust header
        project_table.tables().columns.adjust();;


    }
});
