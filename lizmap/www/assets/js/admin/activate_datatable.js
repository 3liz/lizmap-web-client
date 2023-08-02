
$(document).ready(function () {

    // Activate datatable for the project list table
    if ($('table.lizmap_project_list').length) {
        let has_inspection_data = false;
        if ($('table.lizmap_project_list').hasClass('has_inspection_data')) {
            has_inspection_data = true;
        }

        // Configure the rendering of some columns
        var columnDefs = [
            // Change lizmap plugin version display
            {
                "targets": 'lizmap_plugin_version',
                "render": function (data, type, row, meta) {
                    if (type == 'display') {
                        return data.replace(/\.0/g, '.').replace(/^0/, '');
                    }
                    return data;
                }
            }
        ];
        if (has_inspection_data) {
            // Hide some columns but keep them to keep the data accessible
            columnDefs.push(
                {
                    // "targets": [columnIndexes['invalid_layers_list'], columnIndexes['qgis_log']],
                    "targets": [],
                    "visible": false,
                    "searchable": false
                }
            );
        }

        // Activate datatable on the project list table
        var project_table = $('table.lizmap_project_list').DataTable({
            "paging": false,
            'autoWidth': true,
            'scrollX': 'true',
            'scrollY': '65vh',
            'scrollCollapse': true,
            "info": true,
            "columnDefs": columnDefs,
            // Configure the responsive tool with a full customized display
            responsive: {
                details: {
                    type: 'column',
                    target: 'tr',
                    renderer: function (api, rowIdx, columns) {
                        let html = '';
                        let hiddenColumns = [];
                        let childrenContent = columns.map((col, i) => {
                            // Find the original table column
                            let colHtml = `
                                <dt id="dd_${col.columnIndex}_label">${col.title}</dt>
                            `;
                            let originalTd = project_table.cell(rowIdx, col.columnIndex).node();

                            // Get the used class and title
                            let originalTdClass = originalTd.getAttribute('class');
                            let colClass = (originalTdClass !== null) ? originalTdClass : '';
                            let originalTdTitle = originalTd.getAttribute('title');
                            let colTitle = (originalTdTitle !== null) ? originalTdTitle : '';

                            // Create the dd for the given column
                            let colData = (col.data) ? col.data : '-';
                            colHtml += `
                                <dd id="dd_${col.columnIndex}_value" class="${colClass}" title="${colTitle}">${colData}</dd>
                            `;

                            if (col.hidden) hiddenColumns.push(col.title);

                            // Return the column hidden by datatable responsive extension
                            return (col.hidden && col.data) ? colHtml : '';

                        }).join('');

                        // Display a full block only if there is some data to display
                        // Else display a sentence
                        if (childrenContent) {
                            html = `
                            <dl>
                            ${childrenContent}
                            </dl>
                            `;
                        } else {
                            noDataSentence = document.getElementById('lizmap_project_list_no_data_label').innerText;
                            noDataSentence += ` : "${hiddenColumns.join('", "')}"`;
                            html = noDataSentence;
                        }

                        let div = document.createElement('div');
                        div.classList.add('lizmap_project_list_details')
                        div.innerHTML = html;

                        return div;
                    }
                }
            }
        });

        // Do not let the user show the hidden columns of the responsive feature
        // for more than one rown
        project_table.on('responsive-display', function (e, datatable, row, showHide, update) {
            project_table.rows().every(function () {
                if (showHide && row.index() !== this.index() && this.child.isShown()) {
                    $('td', this.node()).eq(0).click();
                }
            });
        });

        // Adjust the table header at startupt
        project_table.tables().columns.adjust();

        // Adjust it when the size has changed
        project_table.on('responsive-resize', function (e, datatable, row, showHide, update) {
            // Adjust header
            project_table.tables().columns.adjust();

            // Toggle the cursor pointer on the lines
            document.querySelectorAll('table.lizmap_project_list tr').forEach((element) => {
                element.classList.toggle(
                    'has_hidden_columns',
                    project_table.responsive.hasHidden()
                );
            });
        });

        // Change Tr cursor depending of the state hidden columns
        document.querySelectorAll('table.lizmap_project_list tr').forEach((element) => {
            element.classList.toggle(
                'has_hidden_columns',
                project_table.responsive.hasHidden()
            );
        });

    }
});
