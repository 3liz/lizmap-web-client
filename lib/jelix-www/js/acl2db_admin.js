function setColorToSelect(select) {
    var val = select.value;
    if (val == '') {
        select.classList.add('right-no');
        select.classList.remove('right-forbidden')
        select.classList.remove('right-yes')
    }
    else if (val == 'n') {
        select.classList.add('right-forbidden');
        select.classList.remove('right-no')
        select.classList.remove('right-yes')

    }
    else {
        select.classList.add('right-yes');
        select.classList.remove('right-forbidden')
        select.classList.remove('right-no')
    }
}

window.addEventListener('load', function() {
    document.querySelectorAll('#rights-list select').forEach(setColorToSelect);

    var rightsTable = document.getElementById('rights-list');
    if (rightsTable) {
        rightsTable.addEventListener('change', function(event) {
            setColorToSelect(event.target);
            var rightResult = event.target.value;
            if (event.target.classList.contains('user-right-authorization')) {
                var hasYes = false;
                var hasForbidden = false;
                var tdList = event.target.parentNode.parentNode.querySelectorAll('td[data-right]');
                tdList.forEach(function(td) {
                    var grpRight =  td.getAttribute('data-right');
                    if (grpRight == 'y') {
                        hasYes = true;
                    }
                    else if (grpRight == 'n') {
                        hasForbidden = true;
                    }
                });

                if (rightResult != 'n') {
                    if (hasForbidden) {
                        rightResult = 'n';
                    }
                    else if (hasYes) {
                        rightResult = 'y'
                    }
                }
                var imgResult = event.target.parentNode.parentNode.querySelector('td.rights-result img');
                var labelResult, imgResultUri;
                if (rightResult == 'y') {
                    labelResult = rightsTable.getAttribute('data-yes-title');
                    imgResultUri = rightsTable.getAttribute('data-yes-img');
                }
                else {
                    labelResult = rightsTable.getAttribute('data-no-title');
                    imgResultUri = rightsTable.getAttribute('data-no-img');
                }
                imgResult.setAttribute('src', imgResultUri);
                imgResult.setAttribute('alt', labelResult);
                imgResult.setAttribute('title', labelResult);
            }
        })
    }
})
