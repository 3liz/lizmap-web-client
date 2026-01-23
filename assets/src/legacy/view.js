/**
 * @module legacy/view.js
 * @name View
 * @copyright 2023 3Liz
 * @license MPL-2.0
 */

var searchProjects = function(){
    // Hide search if there are no projects
    if (document.querySelectorAll("#content.container li .liz-project-title").length === 0) {
        document.querySelector("#search").style.display = "none";
        return;
    }

    // Activate tooltips
    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    tooltipTriggerList.forEach(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl, {
        trigger: 'hover'
    }));

    // Handle keywords/title toggle
    document.querySelector('#toggle-search').addEventListener('click', function() {
        if (this.textContent === '#') {
            this.textContent = 'T';

            document.querySelectorAll('.project-keyword').forEach(el => el.classList.add('hide'));
            document.querySelector('#search-project-keywords-selected').textContent = '';
        } else {
            this.textContent = '#';

            document.querySelectorAll('.project-keyword').forEach(el => el.classList.remove('hide'));
        }

        // Relaunch search
        document.querySelectorAll("#content.container .liz-repository-project-item").forEach(el => el.style.display = "block");
        document.querySelectorAll("#content.container .liz-repository-title").forEach(el => el.style.display = "block");
        document.querySelector("#search-project").dispatchEvent(new Event('keyup'));
    });

    var onlyUnique = function (value, index, self) {
        return self.indexOf(value) === index;
    };

    // Get unique keywords for visible projects
    var getVisibleProjectsKeywords = function() {
        var keywordList = [];
        var selector = ".liz-repository-project-item:not([style='display:none']) .keywordList";

        document.querySelectorAll(selector).forEach(function (el) {
            if (el.textContent !== '') {
                var keywordsSplitByComma = el.textContent.toUpperCase().split(', ');
                if (isGraph) {
                    for (var index = 0; index < keywordsSplitByComma.length; index++) {
                        keywordList = keywordList.concat(keywordsSplitByComma[index].split('/'));
                    }
                } else {
                    keywordList = keywordList.concat(keywordsSplitByComma);
                }
            }
        });

        return keywordList.filter(onlyUnique);
    };

    // For graph
    var getEdges = function () {
        var edgeList = [];

        document.querySelectorAll(".liz-repository-project-item:not([style='display:none']) .keywordList").forEach(function (el) {
            if (el.textContent !== '') {
                var keywordsSplitByComma = el.textContent.toUpperCase().split(', ');
                for (var index = 0; index < keywordsSplitByComma.length; index++) {
                    var keywordsInGraph = keywordsSplitByComma[index].split('/');

                    // Get edges
                    for (var i = 0; i < keywordsInGraph.length - 1; i++) {
                        edgeList.push([keywordsInGraph[i], keywordsInGraph[i + 1]]);
                    }
                }
            }
        });
        return edgeList;
    };

    // Function to show only projects with selected keywords
    var filterProjectsBySelectedKeywords = function () {
        var selectedKeywords = getSelectedKeywords();

        if (selectedKeywords.length === 0) {
            document.querySelectorAll("#content.container .liz-repository-project-item").forEach(el => el.style.display = "block");
            document.querySelectorAll("#content.container .liz-repository-title").forEach(el => el.style.display = "block");
        } else {
            // Hide everything then show projects and titles corresponding to the selected keywords
            document.querySelectorAll("#content.container .liz-repository-project-item").forEach(el => el.style.display = "none");
            document.querySelectorAll("#content.container .liz-repository-title").forEach(el => el.style.display = "none");

            // Show project when its keywords match all keywords in selectedKeywords
            document.querySelectorAll('.keywordList').forEach(function (el) {
                var showProject = false;
                var keywordListSplitByComma = el.textContent.toUpperCase().split(', ');

                // Graph
                if (isGraph) {
                    var path = selectedKeywords.join('/');
                    for (var index = 0; index < keywordListSplitByComma.length; index++) {
                        if (keywordListSplitByComma[index].indexOf(path) !== -1) {
                            showProject = true;
                            break;
                        }
                    }
                } else {
                    showProject = selectedKeywords.every(function (currentValue) {
                        return (keywordListSplitByComma.indexOf(currentValue) !== -1);
                    });
                }

                if (showProject) {
                    el.closest('.liz-repository-project-item').style.display = "block";
                    el.closest('.liz-repository-project-list').previousElementSibling.style.display = "block";
                }
            });
        }
    };

    // Returns array of selected keywords
    var getSelectedKeywords = function () {
        var selectedKeywords = [];
        document.querySelectorAll('#search-project-keywords-selected .keyword-label').forEach(function (el) {
            selectedKeywords.push(el.textContent.toUpperCase());
        });

        return selectedKeywords;
    };

    var unHighlightkeywords = function (){
        document.querySelectorAll('#search-project-result .project-keyword').forEach(function (el) {
            el.textContent = el.textContent;
        });
    };

    // Display possible keywords to choose based on displayed projects and previous keywords selection
    var displayKeywordChoices = function () {
        var selectedKeywords = getSelectedKeywords();

        if (selectedKeywords.length === 0) {
            // Display all keywords
            document.querySelectorAll('#search-project-result .project-keyword').forEach(el => el.classList.remove('hide'));
        } else {
            // Hide all keywords
            document.querySelectorAll('#search-project-result .project-keyword').forEach(el => el.classList.add('hide'));

            var visibleProjectKeywords = getVisibleProjectsKeywords();

            for (var index = 0; index < visibleProjectKeywords.length; index++) {
                if (selectedKeywords.indexOf(visibleProjectKeywords[index]) === -1) {
                    document.querySelectorAll('#search-project-result .project-keyword.hide').forEach(function (el) {
                        if (el.textContent.toUpperCase() === visibleProjectKeywords[index]) {
                            el.classList.remove('hide');
                        }
                    });
                }
            }

            if (isGraph) {
                // Hide all keywords
                document.querySelectorAll('#search-project-result .project-keyword').forEach(el => el.classList.add('hide'));
                var visibleProjectEdges = getEdges();
                var lastSelectedKeyword = selectedKeywords[selectedKeywords.length - 1];

                var hiddenKeywords = document.querySelectorAll('#search-project-result .project-keyword.hide');

                hiddenKeywords.forEach(function (hiddenKeyword) {
                    visibleProjectEdges.forEach(function (edge) {
                        if (edge[0] === lastSelectedKeyword && edge[1] === hiddenKeyword.textContent.toUpperCase()) {
                            hiddenKeyword.classList.remove('hide');
                        }
                    });
                });
            }
        }
        unHighlightkeywords();
    };

    // Search when user type in
    document.querySelector("#search-project").addEventListener('keyup', function () {
        // Scroll to projects
        const anchorTopProjects = document.querySelector("#anchor-top-projects");
        const header = document.querySelector("#header");
        if (anchorTopProjects && header) {
            window.scrollTo({
                top: anchorTopProjects.offsetTop - header.offsetHeight,
                behavior: "smooth"
            });
        }

        var searchedTerm = this.value.trim().toUpperCase();

        // Search by keywords
        if (document.querySelector('#toggle-search').textContent === '#') {
            displayKeywordChoices();
            if (searchedTerm === '' && getSelectedKeywords().length === 0) {
                document.querySelectorAll('#search-project-result .project-keyword').forEach(el => el.classList.add('hide'));
            } else {
                document.querySelectorAll('#search-project-result .project-keyword:not(.hide)').forEach(function (el) {
                    var keyword = el.textContent.toUpperCase();
                    // Set keyword visibility and bold on string part found
                    if (keyword.indexOf(searchedTerm) !== -1) {
                        var re = new RegExp(searchedTerm, "g");
                        var keywordHighlighted = keyword.replace(re, '<span class="highlight">' + searchedTerm + '</span>');
                        el.innerHTML = keywordHighlighted.toLowerCase();
                    } else {
                        el.classList.add('hide');
                    }
                });
            }
        } else { // Search by title
            // If the search bar is empty, show everything
            if (searchedTerm === "") {
                document.querySelectorAll("#content.container .liz-repository-project-item").forEach(el => el.style.display = "block");
                document.querySelectorAll("#content.container .liz-repository-title").forEach(el => el.style.display = "block");
            }
            // Hide everything then show projects and titles corresponding to the search bar
            else {
                document.querySelectorAll("#content.container .liz-repository-project-item").forEach(el => el.style.display = "none");
                document.querySelectorAll("#content.container .liz-repository-title").forEach(el => el.style.display = "none");

                document.querySelectorAll("#content.container li .liz-project-title").forEach(function (el) {
                    if (el.textContent.toUpperCase().indexOf(searchedTerm) !== -1) {
                        el.closest('.liz-repository-project-item').style.display = "block";
                        el.closest('.liz-repository-project-list').previousElementSibling.style.display = "block";
                    }
                });
            }
        }
    });

    // Init
    var isGraph = false;
    var uniqueKeywordList = getVisibleProjectsKeywords();

    // Activate keywords search if any
    if (uniqueKeywordList.length > 0){
        // If at least one keyword contains a slash, we toggle to graph search mode
        for (var index = 0; index < uniqueKeywordList.length; index++) {
            var keyword = uniqueKeywordList[index];
            if (keyword.indexOf('/') !== -1) {
                isGraph = true;
                // Get unique keywords in graph mode
                uniqueKeywordList = getVisibleProjectsKeywords();
                break;
            }
        }

        var keywordsHTML = '';
        for (let index = 0; index < uniqueKeywordList.length; index++) {
            keywordsHTML += '<span class="project-keyword hide">' + uniqueKeywordList[index].toLowerCase() + '</span>';
        }
        document.querySelector('#search-project-result').innerHTML = keywordsHTML;

        // Add click handler on project keywords
        document.querySelectorAll('.project-keyword').forEach(function (el) {
            el.addEventListener('click', function () {
                // Move keyword in #search-project-keywords-selected
                document.querySelector('#search-project-keywords-selected').insertAdjacentHTML('beforeend', '<span class="project-keyword"><span class="keyword-label">' + this.textContent + '</span><span class="remove-keyword">x</span></span>');
                // Add close event
                document.querySelectorAll('#search-project-keywords-selected .remove-keyword').forEach(function (closeEl) {
                    closeEl.addEventListener('click', function () {
                        this.parentElement.remove();
                        filterProjectsBySelectedKeywords();
                        if (document.querySelectorAll('#search-project-keywords-selected .remove-keyword').length === 0) {
                            document.querySelectorAll('#search-project-result .project-keyword').forEach(el => el.classList.add('hide'));
                        } else {
                            displayKeywordChoices();
                        }
                    });
                });
                // Hide projects then display projects with selected keyword
                filterProjectsBySelectedKeywords();
                // Empty search input
                document.querySelector('#search-project').value = '';
                // Display remaining keywords for visible projects not yet selected
                displayKeywordChoices();
            });
        });
    }else{
        document.querySelector('#toggle-search').style.display = 'none';
        document.querySelector('#toggle-search').parentElement.classList.remove('input-group');
    }
}

var addPrefetchOnClick = function () {
    const links = [{
        url: lizUrls.map,
        type: 'text/html',
        as: 'document',
        params: {},
    },{
        url: lizUrls.config,
        type: 'application/json',
        as: 'fetch',
        params: {},
    },{
        url: lizUrls.keyValueConfig,
        type: 'application/json',
        as: 'fetch',
        params: {},
    },{
        url: lizUrls.ogcService,
        type: 'text/xml',
        as: 'fetch',
        params: {
            SERVICE: 'WMS',
            REQUEST: 'GetCapabilities',
            VERSION: '1.3.0',
        },
    },{
        url: lizUrls.ogcService,
        type: 'text/xml',
        as: 'fetch',
        params: {
            SERVICE: 'WFS',
            REQUEST: 'GetCapabilities',
            VERSION: '1.0.0',
        },
    },{
        url: lizUrls.ogcService,
        type: 'text/xml',
        as: 'fetch',
        params: {
            SERVICE: 'WMTS',
            REQUEST: 'GetCapabilities',
            VERSION: '1.0.0',
        },
    }];
    document.querySelectorAll('a.liz-project-view').forEach(function (link) {
        link.addEventListener('click', function () {
            var projElem = this.closest('div').querySelector('div.liz-project');
            if (!projElem) {
                alert('no project');
                return false;
            }
            var repId = projElem.dataset.lizmapRepository;
            var projId = projElem.dataset.lizmapProject;
            links.forEach(link => {
                const params = new URLSearchParams();
                params.append('repository', repId);
                params.append('project', projId);
                for (const key in link.params) {
                    params.append(key, link.params[key]);
                }
                // Create link tag
                const linkTag = document.createElement('link');
                linkTag.rel = 'prefetch';
                linkTag.href = link.url + '?' + params;
                linkTag.type = link.type;
                linkTag.as = link.as;
                // Inject tag in the head of the document
                document.head.appendChild(linkTag);
            });

            return true;
        });
    });
}

window.addEventListener('load', function () {
    // Initialize global variables
    const lizmapVariablesJSON = document.getElementById('lizmap-vars')?.innerText;
    if (lizmapVariablesJSON) {
        try {
            const lizmapVariables = JSON.parse(lizmapVariablesJSON);
            for (const variable in lizmapVariables) {
                globalThis[variable] = lizmapVariables[variable];
            }
        } catch {
            console.warn('JSON for Lizmap global variables is not valid!');
        }
    }
    searchProjects();
    addPrefetchOnClick();
});
