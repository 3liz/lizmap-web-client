var url = "http://lizmap.local:8130/index.php/lizmap/service?repository=testsrepository&project=base_layers&SERVICE=WFS&REQUEST=GetCapabilities&VERSION=1.0.0";
var unauthorizedUrl = "http://lizmap.local:8130/index.php/lizmap/service?repository=montpellier&project=montpellier&SERVICE=WFS&REQUEST=GetCapabilities&VERSION=1.0.0";

window.addEventListener('load', function() {

    document.getElementById('launch-request').addEventListener('click', function() {

        document.getElementById('response').value="";
        document.getElementById('status').textContent = "";

        var request = new XMLHttpRequest();
        request.open("GET", url);
        if (document.getElementById('cache-disabled').checked) {
            request.setRequestHeader('Cache-Control', 'no-cache');
        }
        request.onload = function() {
            document.getElementById('status').textContent = request.status?request.status:'no code';
            document.getElementById('response').value = request.responseText;
        };
        request.send();
    })

    document.getElementById('launch-request-bad').addEventListener('click', function() {

        var request = new XMLHttpRequest();
        request.open("GET", unauthorizedUrl);
        request.onload = function() {
            document.getElementById('status_bad').textContent = request.status?request.status:'no code';
            document.getElementById('response_bad').value = request.responseText;
        };
        request.send();
    })

});
