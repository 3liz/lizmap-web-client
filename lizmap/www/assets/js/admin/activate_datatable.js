
$(document).ready(function () {

    const tableEl = document.querySelector('table.lizmap_project_list');
    if (!tableEl) {
        return;
    }

    // The inspection related columns, hidden when no project has inspection data.
    // Indexes must match the <thead> order in project_list.tpl.
    const INSPECTION_COLUMNS = [4, 5, 6, 7, 14, 16, 17];

    const showHiddenTitle = tableEl.getAttribute('data-show-hidden-title') || '';

    // Escape a value to be injected as HTML (innerHTML).
    function esc(value) {
        if (value === null || value === undefined) {
            return '';
        }
        return String(value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    // Default renderer: display the escaped value, sort/filter on the raw value.
    function renderValue(cell, type) {
        if (!cell) {
            return '';
        }
        return (type === 'display') ? esc(cell.v) : cell.v;
    }

    // Generic createdCell callback: apply the CSS class and tooltip precomputed
    // server side.
    function applyAttributes(td, cell) {
        if (!cell) {
            return;
        }
        if (cell.class) {
            cell.class.split(' ').filter(Boolean).forEach((c) => td.classList.add(c));
        }
        if (cell.title) {
            td.setAttribute('title', cell.title);
        }
    }

    // Project cell: a link when the project can be opened, otherwise the id and
    // an optional lock icon.
    function renderProject(cell) {
        if (cell.url) {
            return `<a target="_blank" href="${esc(cell.url)}">${esc(cell.v)}</a>`;
        }
        let html = esc(cell.v);
        if (cell.lock) {
            html += ` <span title="${esc(cell.lock_title)}">🔒</span>`;
        }
        return html;
    }

    // Target Lizmap version: display 3.9 but keep 03.09.00 for sorting.
    function formatTargetVersion(value) {
        return String(value).substr(0, 5).replace(/\.0/g, '.').replace(/^0/, '');
    }

    // Invalid layers: an unordered list of the layer names with the datasource
    // as tooltip.
    function renderInvalidLayers(layers) {
        if (!Array.isArray(layers) || layers.length === 0) {
            return '';
        }
        const items = layers.map(
            (layer) => `<li style="cursor: help;" title="${esc(layer.source)}">${esc(layer.name)}</li>`
        ).join('');
        return `<ul>${items}</ul>`;
    }

    // Columns definition, in the same order as the <thead>.
    const columns = [
        // 0 - Empty first column used by the responsive extension
        {
            data: null,
            defaultContent: '',
            orderable: false,
            createdCell: function (td) {
                if (showHiddenTitle) {
                    td.setAttribute('title', showHiddenTitle);
                }
            },
        },
        // 1 - Repository
        {
            data: 'repository',
            render: (c, type) => (type === 'display')
                ? `<a target="_blank" href="${esc(c.url)}">${esc(c.v)}</a>`
                : c.v,
            createdCell: applyAttributes,
        },
        // 2 - Project
        {
            data: 'project',
            render: (c, type) => (type === 'display') ? renderProject(c) : c.v,
            createdCell: applyAttributes,
        },
        // 3 - Layers count
        { data: 'layer_count', render: renderValue, createdCell: applyAttributes },
        // 4 - Invalid layers count (inspection)
        { data: 'invalid_layers_count', render: renderValue, createdCell: applyAttributes },
        // 5 - A QGIS log exists (inspection)
        {
            data: 'has_log',
            render: (c, type) => (type === 'display') ? (c && c.v ? '🔴' : '') : (c && c.v ? 1 : 0),
        },
        // 6 - Loading time (inspection)
        { data: 'loading_time', render: renderValue, createdCell: applyAttributes },
        // 7 - Memory usage (inspection)
        { data: 'memory_usage', render: renderValue, createdCell: applyAttributes },
        // 8 - QGIS desktop version
        {
            data: 'qgis_version',
            render: (c, type) => (type === 'display')
                ? esc(c.v) + (c.badge ? ' <span class="badge badge-warning">⚠</span>' : '')
                : c.v,
            createdCell: applyAttributes,
        },
        // 9 - Target Lizmap Web Client version
        {
            data: 'target_version',
            render: (c, type) => (type === 'display') ? formatTargetVersion(c.v) : c.v,
            createdCell: applyAttributes,
        },
        // 10 - Warnings in the CFG file
        { data: 'cfg_warnings', render: renderValue, createdCell: applyAttributes },
        // 11 - Hidden project
        { data: 'hidden', render: renderValue },
        // 12 - Authorized groups
        { data: 'acl_groups', render: renderValue },
        // 13 - Project file time
        { data: 'file_time', render: renderValue },
        // 14 - Inspection file time (inspection)
        { data: 'inspection_time', render: renderValue },
        // 15 - Projection / CRS
        { data: 'projection', render: renderValue, createdCell: applyAttributes },
        // 16 - Invalid layers list (inspection)
        {
            data: 'invalid_layers',
            render: (c, type) => (type === 'display')
                ? renderInvalidLayers(c && c.v)
                : (c && c.v ? c.v.length : 0),
        },
        // 17 - QGIS logs (inspection)
        {
            data: 'qgis_log',
            className: 'lizmap-project-qgis-log',
            render: (c, type) => (type === 'display') ? (c && c.v ? `<pre>${esc(c.v)}</pre>` : '') : (c ? c.v : ''),
        },
    ];

    // Toggle the pointer cursor on the rows depending on the hidden columns state.
    function toggleHiddenCursor(api) {
        document.querySelectorAll('table.lizmap_project_list tr').forEach((element) => {
            element.classList.toggle('has_hidden_columns', api.responsive.hasHidden());
        });
    }

    // Activate datatable on the project list table
    var project_table = $(tableEl).DataTable({
        ajax: {
            url: tableEl.getAttribute('data-url'),
            dataSrc: 'data',
        },
        columns: columns,
        "paging": false,
        // Keep the rows in the order returned by the server (grouped by repository)
        "order": [],
        'autoWidth': true,
        'scrollX': 'true',
        'scrollY': '65vh',
        'scrollCollapse': true,
        "info": true,
        // Set the <tr> data attributes used elsewhere (tests, styling)
        createdRow: function (row, data) {
            row.setAttribute('data-repository-id', data.repository_id);
            row.setAttribute('data-project-id', data.id);
        },
        // Configure the responsive tool with a full customized display
        responsive: {
            details: {
                type: 'column',
                target: 'tr',
                renderer: function (api, rowIdx, columns) {
                    let html = '';
                    let hiddenColumns = [];
                    let childrenContent = columns.map((col) => {
                        // Get the used class and title from the original cell
                        // (they are set by the createdCell callbacks above)
                        let originalTd = project_table.cell(rowIdx, col.columnIndex).node();
                        let colClass = (originalTd && originalTd.getAttribute('class')) ? originalTd.getAttribute('class') : '';
                        let colTitle = (originalTd && originalTd.getAttribute('title')) ? originalTd.getAttribute('title') : '';

                        // Get the rendered (display) content of the cell
                        let colData = project_table.cell(rowIdx, col.columnIndex).render('display');

                        if (col.hidden) hiddenColumns.push(col.title);

                        // Return the column only if it is hidden and has some data
                        if (!(col.hidden && colData)) {
                            return '';
                        }
                        return `
                            <dt id="dd_${col.columnIndex}_label">${col.title}</dt>
                            <dd id="dd_${col.columnIndex}_value" class="${esc(colClass)}" title="${esc(colTitle)}">${colData}</dd>
                        `;
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
                        let noDataSentence = document.getElementById('lizmap_project_list_no_data_label').innerText;
                        noDataSentence += ` : "${hiddenColumns.join('", "')}"`;
                        html = noDataSentence;
                    }

                    let div = document.createElement('div');
                    div.classList.add('lizmap_project_list_details')
                    div.innerHTML = html;

                    return div;
                }
            }
        },
        initComplete: function (settings, json) {
            // Hide the inspection columns (and the related legend) when no
            // project has inspection data
            if (!json || !json.hasInspectionData) {
                this.api().columns(INSPECTION_COLUMNS).visible(false);
                document.querySelectorAll('.help-inspection-only').forEach((el) => {
                    el.style.display = 'none';
                });
            }

            // Display a warning when some projects cannot be shown in the main interface
            if (json && json.hasSomeProjectsNotDisplayed) {
                const warning = document.getElementById('lizmap_project_list_not_displayed');
                if (warning) {
                    warning.style.display = '';
                }
            }

            // Adjust the header and the cursor state now that the rows exist
            this.api().columns.adjust();
            toggleHiddenCursor(this.api());
        }
    });

    // Do not let the user show the hidden columns of the responsive feature
    // for more than one row
    project_table.on('responsive-display', function (e, datatable, row, showHide, update) {
        project_table.rows().every(function () {
            if (showHide && row.index() !== this.index() && this.child.isShown()) {
                $('td', this.node()).eq(0).click();
            }
        });
    });

    // Adjust it when the size has changed
    project_table.on('responsive-resize', function (e, datatable, columns) {
        // Adjust header
        project_table.columns.adjust();

        // Toggle the cursor pointer on the lines
        toggleHiddenCursor(project_table);
    });

});
