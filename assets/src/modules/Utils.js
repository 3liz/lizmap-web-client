export default class Utils {

    /**
     * @param {String} text - file content
     * @param {String} fileType - file's MIME type
     * @param {String} fileName - file'name with extension
     */
    static downloadFileFromString(text, fileType, fileName) {
        var blob = new Blob([text], { type: fileType });

        var a = document.createElement('a');
        a.download = fileName;
        a.href = URL.createObjectURL(blob);
        a.dataset.downloadurl = [fileType, a.download, a.href].join(':');
        a.style.display = "none";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => { URL.revokeObjectURL(a.href); }, 1500);
    }

    /**
     * Send an ajax POST request to download a file
     *
     * @param {String} url
     * @param {Array} parameters
     * @param {Function} callback optionnal callback executed when download ends
     *
     */
    static downloadFile(url, parameters, callback) {
        var xhr = new XMLHttpRequest();
        xhr.open('POST', url, true);
        xhr.responseType = 'arraybuffer';
        xhr.onload = function () {
            if (this.status === 200) {
                var filename = "";
                var disposition = xhr.getResponseHeader('Content-Disposition');
                if (disposition && disposition.indexOf('attachment') !== -1) {
                    var filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
                    var matches = filenameRegex.exec(disposition);
                    if (matches != null && matches[1]) filename = matches[1].replace(/['"]/g, '');
                }

                let type = xhr.getResponseHeader('Content-Type');

                // Firefox >= 98 opens blob in its pdf viewer
                // This is a hack to force download as in Chrome
                if (navigator.userAgent.toLowerCase().indexOf('firefox') > -1 && type == 'application/pdf') {
                    type = 'application/octet-stream';
                }
                const blob = new File([this.response], filename, { type: type });
                const downloadUrl = URL.createObjectURL(blob);

                if (filename) {
                    // use HTML5 a[download] attribute to specify filename
                    const a = document.createElement('a');
                    a.href = downloadUrl;
                    a.download = filename;
                    a.dispatchEvent(new MouseEvent('click'));
                } else {
                    window.open(downloadUrl);
                }

                setTimeout(() => URL.revokeObjectURL(downloadUrl), 100); // cleanup
            }

            // Execute callback if any
            if (typeof callback === 'function') {
                callback();
            }
        };
        xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
        xhr.send($.param(parameters, true));
    }

    static getResolutionFromScale(scale) {
        const resolution = 1 / ((1/scale) * 39.37 * 96);
        return resolution;
    }
}
