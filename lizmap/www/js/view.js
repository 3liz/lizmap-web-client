(function ($) {
    $.fn.uniformHeight = function () {
        var maxHeight = 0,
            wrapper,
            wrapperHeight;
        return this.each(function () {
            // Applying a wrapper to the contents of the current element to get reliable height
            wrapper = $(this).wrapInner('<div class="wrapper" />').children('.wrapper');
            wrapperHeight = wrapper.outerHeight();
            maxHeight = Math.max(maxHeight, wrapperHeight);
            // Remove the wrapper
            wrapper.children().unwrap();
        }).height(maxHeight);
    }
})(jQuery);

var addDescriptionSlider = function(){
    $('.liz-project-img').parent().mouseenter(function(){
      var self = $(this);
      self.find('.liz-project-desc').slideDown();
      self.css('cursor','pointer');
    }).mouseleave(function(){
      var self = $(this);
      self.find('.liz-project-desc').hide();
    }).click(function(){
      var self = $(this);
      window.location = self.parent().find('a.liz-project-view').attr('href');
      return false;
    });
}

var resizeThumbnails = function(){
    $(".thumbnail h5").height('auto');
    $('.thumbnails').height('auto');
    $('.thumbnails').each(function () {
        $(this).find('.thumbnail h5').height(Math.max.apply(null, $(this).find('.thumbnail h5').map(function() { return $(this).height(); })));
        $(this).find('.thumbnail').uniformHeight();
    });
}

var searchProjects = function(){
    // Hide search if there are no projects
    if ($("#content.container li .liz-project-title").length === 0) {
        $("#search").hide();
        return;
    }

    // Activate tooltips
    $('#toggle-search, #search-project').tooltip();

    // Handle keywords/title toggle
    $('#toggle-search').click(function(){
        // Reboot search
        $('#search-project').val('');
        $("#content.container .liz-repository-project-item").show();
        $("#content.container .liz-repository-title").show();

        if ($(this).text() === '#'){
            $(this).text('T');

            $('.project-keyword').addClass('hide');
            $('#search-project-keywords-selected').text('');
        }else{
            $(this).text('#');
        }
    });

    var onlyUnique = function (value, index, self) {
        return self.indexOf(value) === index;
    }

    // Get unique keywords for visible projects
    var getProjectsKeywords = function() {
        var keywordList = [];
        var selector = '.liz-repository-project-item :visible .keywordList';

        $(selector).each(function () {
            if ($(this).text() !== '') {
                keywordList = keywordList.concat($(this).text().toUpperCase().split(', '));
            }
        });

        return keywordList.filter(onlyUnique);
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
                var keywordList = $(this).text().toUpperCase().split(', ');

                var showProject = selectedKeywords.every(function (currentValue) {
                    return (keywordList.indexOf(currentValue) !== -1);
                });

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

    // Display keywords based on displayed projects
    var displayRemainingKeywords = function () {
        var projectKeywords = getProjectsKeywords();
        var selectedKeywords = getSelectedKeywords();

        // Hide all keywords
        $('#search-project-result .project-keyword').addClass('hide');

        for (var index = 0; index < projectKeywords.length; index++) {
            if (selectedKeywords.indexOf(projectKeywords[index]) === -1) {
                $('#search-project-result .project-keyword').filter(function () {
                    return $(this).text().toUpperCase() === projectKeywords[index];
                }).removeClass('hide');
            }
        }
        unHighlightkeywords();
    }

    var uniqueKeywordList = getProjectsKeywords();

    var keywordsHTML = '';
    for (var index = 0; index < uniqueKeywordList.length; index++) {
        keywordsHTML += '<span class="project-keyword hide">' + uniqueKeywordList[index].toLowerCase() + '</span>';
    }
    $('#search-project-result').html(keywordsHTML);

    // Add click handler on project keywords
    $('.project-keyword').click(function(){
        // Move keyword in #search-project-keywords-selected
        $('#search-project-keywords-selected').append('<span class="project-keyword"><span class="keyword-label">' + $(this).text() +'</span><span class="remove-keyword">x</span></span>');
        // Add close event
        $('#search-project-keywords-selected .remove-keyword').click(function(){
            $(this).parent().remove();
            filterProjectsBySelectedKeywords();
            if ($('#search-project-keywords-selected .remove-keyword').length === 0){
                $('#search-project-result .project-keyword').addClass('hide');
            }else{
                displayRemainingKeywords();
            }
        });
        // Hide projects then display projects with selected keyword
        filterProjectsBySelectedKeywords();
        // Empty search input
        $('#search-project').val('')
        // Display remaining keywords for visible projects not yet selected
        displayRemainingKeywords();
    });

    // Handle search
    $("#search-project").keyup(function () {
        // Scroll to projects
        $('html').animate({
            scrollTop: $("#anchor-top-projects").offset().top - $('#header').height()
        }, 500);

        var searchedTerm = this.value.trim().toUpperCase();

        // Search by keywords
        if ($('#toggle-search').text() === '#'){
            displayRemainingKeywords();
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
        }else{ // Search by title
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
}

$( window ).load(function() {
    addDescriptionSlider();
    resizeThumbnails();
    searchProjects();
});

$(window).resize(function () {
    resizeThumbnails();
});
