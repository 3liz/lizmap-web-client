/**
 * @module legacy/view.js
 * @name View
 * @copyright 2023 3Liz
 * @license MPL-2.0
 */

const searchProjects = () => {
    // Hide search if there are no projects
    if (document.querySelectorAll("#content.container li .liz-project-title").length === 0) {
        document.querySelector("#search").style.display = "none";
        return;
    }

    // Activate tooltips
    const tooltipTriggerList = [...document.querySelectorAll('[data-bs-toggle="tooltip"]')];
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

    const onlyUnique = (value, index, self) => self.indexOf(value) === index;

    // Get unique keywords for visible projects
    const getVisibleProjectsKeywords = () => {
        let keywordList = [];
        const selector = ".liz-repository-project-item:not([style*='display: none']) .keywordList";

        document.querySelectorAll(selector).forEach(el => {
            if (el.textContent.trim() !== '') {
                const keywordsSplitByComma = el.textContent.toUpperCase().split(', ');
                if (isGraph) {
                    keywordsSplitByComma.forEach(keyword => {
                        keywordList = keywordList.concat(keyword.split('/'));
                    });
                } else {
                    keywordList = keywordList.concat(keywordsSplitByComma);
                }
            }
        });

        // Ensure unique, non-empty, and trimmed keywords
        return keywordList.map(keyword => keyword.trim()).filter(onlyUnique).filter(keyword => keyword !== '');
    };

    // For graph
    const getEdges = () => {
        const edgeList = [];

        document.querySelectorAll(".liz-repository-project-item:not([style='display:none']) .keywordList").forEach(el => {
            if (el.textContent !== '') {
                const keywordsSplitByComma = el.textContent.toUpperCase().split(', ');
                keywordsSplitByComma.forEach(keyword => {
                    const keywordsInGraph = keyword.split('/');

                    // Get edges
                    for (let i = 0; i < keywordsInGraph.length - 1; i++) {
                        edgeList.push([keywordsInGraph[i], keywordsInGraph[i + 1]]);
                    }
                });
            }
        });
        return edgeList;
    };

    // Function to show only projects with selected keywords
    const filterProjectsBySelectedKeywords = () => {
        const selectedKeywords = getSelectedKeywords();

        if (selectedKeywords.length === 0) {
            document.querySelectorAll("#content.container .liz-repository-project-item").forEach(el => el.style.display = "block");
            document.querySelectorAll("#content.container .liz-repository-title").forEach(el => el.style.display = "block");
        } else {
            // Hide everything then show projects and titles corresponding to the selected keywords
            document.querySelectorAll("#content.container .liz-repository-project-item").forEach(el => el.style.display = "none");
            document.querySelectorAll("#content.container .liz-repository-title").forEach(el => el.style.display = "none");

            // Show project when its keywords match all keywords in selectedKeywords
            document.querySelectorAll('.keywordList').forEach(el => {
                let showProject = false;
                const keywordListSplitByComma = el.textContent.toUpperCase().split(', ');

                // Graph
                if (isGraph) {
                    const path = selectedKeywords.join('/');
                    showProject = keywordListSplitByComma.some(keyword => keyword.includes(path));
                } else {
                    showProject = selectedKeywords.every(currentValue => keywordListSplitByComma.includes(currentValue));
                }

                if (showProject) {
                    el.closest('.liz-repository-project-item').style.display = "block";
                    el.closest('.liz-repository-project-list').previousElementSibling.style.display = "block";
                }
            });
        }
    };

    // Returns array of selected keywords
    const getSelectedKeywords = () => {
        return [...document.querySelectorAll('#search-project-keywords-selected .keyword-label')]
            .map(el => el.textContent.toUpperCase());
    };

    const unHighlightkeywords = () => {
        document.querySelectorAll('#search-project-result .project-keyword').forEach(el => {
            el.textContent = el.textContent;
        });
    };

    // Display possible keywords to choose based on displayed projects and previous keywords selection
    const displayKeywordChoices = () => {
        const selectedKeywords = getSelectedKeywords();

        if (selectedKeywords.length === 0) {
            // Display all keywords
            document.querySelectorAll('#search-project-result .project-keyword').forEach(el => el.classList.remove('hide'));
        } else {
            // Hide all keywords initially
            document.querySelectorAll('#search-project-result .project-keyword').forEach(el => el.classList.add('hide'));

            const visibleProjectKeywords = getVisibleProjectsKeywords();

            visibleProjectKeywords.forEach(keyword => {
                if (!selectedKeywords.includes(keyword)) {
                    document.querySelectorAll('#search-project-result .project-keyword').forEach(el => {
                        if (el.textContent.toUpperCase() === keyword) {
                            el.classList.remove('hide');
                        }
                    });
                }
            });

            if (isGraph) {
                const visibleProjectEdges = getEdges();
                const lastSelectedKeyword = selectedKeywords[selectedKeywords.length - 1];

                document.querySelectorAll('#search-project-result .project-keyword.hide').forEach(hiddenKeyword => {
                    visibleProjectEdges.forEach(edge => {
                        if (edge[0] === lastSelectedKeyword && edge[1] === hiddenKeyword.textContent.toUpperCase()) {
                            hiddenKeyword.classList.remove('hide');
                        }
                    });
                });
            }
        }

        // Hide #search-project-result if no keywords are visible
        const visibleKeywords = document.querySelectorAll('#search-project-result .project-keyword:not(.hide)');
        document.querySelector('#search-project-result').style.display = visibleKeywords.length === 0 ? 'none' : '';

        unHighlightkeywords();
    };

    // Search when user types in
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

        const searchedTerm = this.value.trim().toUpperCase();

        // Search by keywords
        if (document.querySelector('#toggle-search').textContent === '#') {
            displayKeywordChoices();
            if (searchedTerm === '' && getSelectedKeywords().length === 0) {
                document.querySelectorAll('#search-project-result .project-keyword').forEach(el => el.classList.add('hide'));
            } else {
                document.querySelectorAll('#search-project-result .project-keyword:not(.hide)').forEach(el => {
                    const keyword = el.textContent.toUpperCase();
                    // Set keyword visibility and bold on string part found
                    if (keyword.includes(searchedTerm)) {
                        const re = new RegExp(searchedTerm, "g");
                        el.innerHTML = keyword.replace(re, `<span class="highlight">${searchedTerm}</span>`).toLowerCase();
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
            } else {
                // Hide everything then show projects and titles corresponding to the search bar
                document.querySelectorAll("#content.container .liz-repository-project-item").forEach(el => el.style.display = "none");
                document.querySelectorAll("#content.container .liz-repository-title").forEach(el => el.style.display = "none");

                document.querySelectorAll("#content.container li .liz-project-title").forEach(el => {
                    if (el.textContent.toUpperCase().includes(searchedTerm)) {
                        el.closest('.liz-repository-project-item').style.display = "block";
                        el.closest('.liz-repository-project-list').previousElementSibling.style.display = "block";
                    }
                });
            }
        }
    });

    // Init
    let isGraph = false;
    let uniqueKeywordList = getVisibleProjectsKeywords();

    // Activate keywords search if any
    if (uniqueKeywordList.length > 0) {
        // If at least one keyword contains a slash, we toggle to graph search mode
        uniqueKeywordList.some(keyword => {
            if (keyword.includes('/')) {
                isGraph = true;
                uniqueKeywordList = getVisibleProjectsKeywords();
                return true;
            }
            return false;
        });

        const keywordsHTML = uniqueKeywordList.map(keyword => `<span class="project-keyword hide">${keyword.toLowerCase()}</span>`).join('');
        document.querySelector('#search-project-result').innerHTML = keywordsHTML;

        // Add click handler on project keywords
        document.querySelectorAll('.project-keyword').forEach(el => {
            el.addEventListener('click', function () {
                // Move keyword in #search-project-keywords-selected
                document.querySelector('#search-project-keywords-selected').insertAdjacentHTML('beforeend', `<span class="project-keyword"><span class="keyword-label">${this.textContent}</span><span class="remove-keyword">x</span></span>`);
                // Add close event
                document.querySelectorAll('#search-project-keywords-selected .remove-keyword').forEach(closeEl => {
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
    } else {
        document.querySelector('#toggle-search').style.display = 'none';
        document.querySelector('#toggle-search').parentElement.classList.remove('input-group');
    }
};

const addPrefetchOnClick = () => {
    const links = [
        {
            url: lizUrls.map,
            type: 'text/html',
            as: 'document',
            params: {},
        },
        {
            url: lizUrls.config,
            type: 'application/json',
            as: 'fetch',
            params: {},
        },
        {
            url: lizUrls.keyValueConfig,
            type: 'application/json',
            as: 'fetch',
            params: {},
        },
        {
            url: lizUrls.ogcService,
            type: 'text/xml',
            as: 'fetch',
            params: {
                SERVICE: 'WMS',
                REQUEST: 'GetCapabilities',
                VERSION: '1.3.0',
            },
        },
        {
            url: lizUrls.ogcService,
            type: 'text/xml',
            as: 'fetch',
            params: {
                SERVICE: 'WFS',
                REQUEST: 'GetCapabilities',
                VERSION: '1.0.0',
            },
        },
        {
            url: lizUrls.ogcService,
            type: 'text/xml',
            as: 'fetch',
            params: {
                SERVICE: 'WMTS',
                REQUEST: 'GetCapabilities',
                VERSION: '1.0.0',
            },
        }
    ];

    document.querySelectorAll('a.liz-project-view').forEach(link => {
        link.addEventListener('click', function () {
            const projElem = this.closest('div.liz-project');
            if (!projElem) {
                console.warn('No project');
                return false;
            }
            const repId = projElem.dataset.lizmapRepository;
            const projId = projElem.dataset.lizmapProject;
            links.forEach(link => {
                const params = new URLSearchParams({ repository: repId, project: projId, ...link.params });
                // Create link tag
                const linkTag = document.createElement('link');
                linkTag.rel = 'prefetch';
                linkTag.href = `${link.url}?${params}`;
                linkTag.type = link.type;
                linkTag.as = link.as;
                // Inject tag in the head of the document
                document.head.appendChild(linkTag);
            });

            return true;
        });
    });
};

window.addEventListener('load', () => {
    // Initialize global variables
    const lizmapVariablesJSON = document.getElementById('lizmap-vars')?.innerText;
    if (lizmapVariablesJSON) {
        try {
            const lizmapVariables = JSON.parse(lizmapVariablesJSON);
            Object.entries(lizmapVariables).forEach(([key, value]) => {
                globalThis[key] = value;
            });
        } catch {
            console.warn('JSON for Lizmap global variables is not valid!');
        }
    }
    searchProjects();
    addPrefetchOnClick();
});
