/**
 * @module legacy/view.js
 * @name View
 * @copyright 2023 3Liz
 * @license MPL-2.0
 */

var searchProjects = function(){
    // Hide search if there are no projects
    if ($("#content.container li .liz-project-title").length === 0) {
        $("#search").hide();
        return;
    }

    // Activate tooltips
    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl, {
        trigger: 'hover'
    }));

    // Handle keywords/title toggle
    $('#toggle-search').click(function(){
        if ($(this).text() === '#'){
            $(this).text('T');

            $('.project-keyword').addClass('hide');
            $('#search-project-keywords-selected').text('');
        }else{
            $(this).text('#');

            $('.project-keyword').removeClass('hide');
        }

        // Relaunch search
        $("#content.container .liz-repository-project-item").show();
        $("#content.container .liz-repository-title").show();
        $("#search-project").keyup();
    });

    var onlyUnique = function (value, index, self) {
        return self.indexOf(value) === index;
    }

    // Get unique keywords for visible projects
    var getVisibleProjectsKeywords = function() {
        var keywordList = [];
        var selector = '.liz-repository-project-item :visible .keywordList';

        $(selector).each(function () {
            if ($(this).text() !== '') {
                var keywordsSplitByComma = $(this).text().toUpperCase().split(', ');
                if (isGraph) {
                    for (var index = 0; index < keywordsSplitByComma.length; index++) {
                        keywordList = keywordList.concat(keywordsSplitByComma[index].split('/'));
                    }
                }else{
                    keywordList = keywordList.concat(keywordsSplitByComma);
                }
            }
        });

        return keywordList.filter(onlyUnique);
    }

    // For graph
    var getEdges = function () {
        var edgeList = [];

        $('.liz-repository-project-item :visible .keywordList').each(function () {
            if ($(this).text() !== '') {
                var keywordsSplitByComma = $(this).text().toUpperCase().split(', ');
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
    }

    // Function to show only projects with selected keywords
    var filterProjectsBySelectedKeywords = function () {
        var selectedKeywords = getSelectedKeywords();

        if (selectedKeywords.length === 0) {
            $("#content.container .liz-repository-project-item").show();
            $("#content.container .liz-repository-title").show();
        } else {
            // Hide everything then show projects and titles corresponding to the selected keywords
            $("#content.container .liz-repository-project-item").hide();
            $("#content.container .liz-repository-title").hide();

            // Show project when its keywords match all keywords in selectedKeywords
            $('.keywordList').each(function () {
                var showProject = false;
                var keywordListSplitByComma = $(this).text().toUpperCase().split(', ');

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
                    $(this).closest('.liz-repository-project-item').show();
                    $(this).closest('.liz-repository-project-list').prev('.liz-repository-title').show();
                }
            });
        }
    }

    // Returns array of selected keywords
    var getSelectedKeywords = function () {
        var selectedKeywords = [];
        $('#search-project-keywords-selected .keyword-label').each(function () {
            selectedKeywords.push($(this).text().toUpperCase());
        });

        return selectedKeywords;
    }

    var unHighlightkeywords = function (){
        $('#search-project-result .project-keyword').each(function () {
            $(this).text($(this).text());
        });
    }

    // Display possible keywords to choose based on displayed projects and previous keywords selection
    var displayKeywordChoices = function () {
        var selectedKeywords = getSelectedKeywords();

        if (selectedKeywords.length === 0) {
            // Display all keywords
            $('#search-project-result .project-keyword').removeClass('hide');
        } else {
            // Hide all keywords
            $('#search-project-result .project-keyword').addClass('hide');

            var visibleProjectKeywords = getVisibleProjectsKeywords();

            for (var index = 0; index < visibleProjectKeywords.length; index++) {
                if (selectedKeywords.indexOf(visibleProjectKeywords[index]) === -1) {
                    $('#search-project-result .project-keyword.hide').filter(function () {
                        return ($(this).text().toUpperCase() === visibleProjectKeywords[index]);
                    }).removeClass('hide');
                }
            }

            if (isGraph) {
                // Hide all keywords
                $('#search-project-result .project-keyword').addClass('hide');
                var visibleProjectEdges = getEdges();
                var lastSelectedKeyword = selectedKeywords[selectedKeywords.length - 1];

                var hiddenKeywords = $('#search-project-result .project-keyword.hide');

                for (let index = 0; index < hiddenKeywords.length; index++) {
                    var hiddenKeyword = hiddenKeywords.eq(index);

                    for (var i = 0; i < visibleProjectEdges.length; i++) {
                        if (visibleProjectEdges[i][0] === lastSelectedKeyword
                            && visibleProjectEdges[i][1] === hiddenKeyword.text().toUpperCase()) {
                            hiddenKeyword.removeClass('hide');
                        }
                    }
                }
            }
        }
        unHighlightkeywords();
    }

    // Search when user type in
    $("#search-project").keyup(function () {
        // Scroll to projects
        $('html').animate({
            scrollTop: $("#anchor-top-projects").offset().top - $('#header').height()
        }, 500);

        var searchedTerm = this.value.trim().toUpperCase();

        // Search by keywords
        if ($('#toggle-search').text() === '#') {
            displayKeywordChoices();
            if (searchedTerm === '' && getSelectedKeywords().length === 0) {
                $('#search-project-result .project-keyword').addClass('hide');
            } else {
                $('#search-project-result .project-keyword:visible').each(function () {
                    var keyword = $(this).text().toUpperCase();
                    // Set keyword visibility and bold on string part found
                    if (keyword.indexOf(searchedTerm) !== -1) {
                        var re = new RegExp(searchedTerm, "g");
                        var keywordHighlighted = keyword.replace(re, '<span class="highlight">' + searchedTerm + '</span>');
                        $(this).html(keywordHighlighted.toLowerCase());
                    } else {
                        $(this).addClass('hide');
                    }
                });
            }
        } else { // Search by title
            // If the search bar is empty, show everything
            if (searchedTerm === "") {
                $("#content.container .liz-repository-project-item").show();
                $("#content.container .liz-repository-title").show();
            }
            // Hide everything then show projects and titles corresponding to the search bar
            else {
                $("#content.container .liz-repository-project-item").hide();
                $("#content.container .liz-repository-title").hide();

                $("#content.container li .liz-project-title").filter(function () {
                    return -1 != $(this).text().toUpperCase().indexOf(searchedTerm);
                }).closest('.liz-repository-project-item').show();

                $("#content.container li .liz-project-title").filter(function () {
                    return -1 != $(this).text().toUpperCase().indexOf(searchedTerm);
                }).closest('.liz-repository-project-list').prev('.liz-repository-title').show();

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
        $('#search-project-result').html(keywordsHTML);

        // Add click handler on project keywords
        $('.project-keyword').click(function () {
            // Move keyword in #search-project-keywords-selected
            $('#search-project-keywords-selected').append('<span class="project-keyword"><span class="keyword-label">' + $(this).text() + '</span><span class="remove-keyword">x</span></span>');
            // Add close event
            $('#search-project-keywords-selected .remove-keyword').click(function () {
                $(this).parent().remove();
                filterProjectsBySelectedKeywords();
                if ($('#search-project-keywords-selected .remove-keyword').length === 0) {
                    $('#search-project-result .project-keyword').addClass('hide');
                } else {
                    displayKeywordChoices();
                }
            });
            // Hide projects then display projects with selected keyword
            filterProjectsBySelectedKeywords();
            // Empty search input
            $('#search-project').val('')
            // Display remaining keywords for visible projects not yet selected
            displayKeywordChoices();
        });
    }else{
        $('#toggle-search').hide().parent().removeClass('input-group');
    }
}

window.addEventListener('load', function () {
    searchProjects();
});
