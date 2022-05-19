/**
 * @package      jelix
 * @subpackage   forms
 * @author       Laurent Jouanneau
 * @copyright    2020 Laurent Jouanneau
 * @link         https://jelix.org
 * @licence      GNU Lesser General Public Licence see LICENCE file or http://www.gnu.org/licenses/lgpl.html
 */

/**
 *
 * @param {String} divDOMSelector
 * @param {jFormsImageDialog} imageDialog
 * @param {Object} options. Ex {maxWidth: 0, maxHeight: 0, width: 800, height: 600}
 */
function jFormsImageSelector (divDOMSelector, imageDialog, options) {
    this.div = document.querySelector(divDOMSelector);
    this.btnFileSelector = this.div.querySelector('.jforms-image-select-btn');
    this.btnExistingBtn = this.div.querySelector('.jforms-image-modify-btn');
    this.fileSelector = this.div.querySelector('.jforms-image-input');
    this.imgPreview = this.div.querySelector('.jforms-image-preview');
    this.hiddenInput = null;
    this.imgDialog = imageDialog;

    var defaults = {
        imageParameters: {
            maxWidth: 0, // max width of the final image. the image is resized if needed
            maxHeight: 0, // max height of the final image. the image is resized  if needed
        },
        callback: function(result) {}
    };


    if (this.fileSelector.dataset.imgWidth) {
        defaults.imageParameters.width = parseInt(this.fileSelector.dataset.imgWidth, 10);
    }

    if (this.fileSelector.dataset.imgHeight) {
        defaults.imageParameters.height = parseInt(this.fileSelector.dataset.imgHeight, 10);
    }

    if (this.fileSelector.dataset.imgMaxWidth) {
        defaults.imageParameters.maxWidth = parseInt(this.fileSelector.dataset.imgMaxWidth, 10);
    }

    if (this.fileSelector.dataset.imgMaxHeight) {
        defaults.imageParameters.maxHeight = parseInt(this.fileSelector.dataset.imgMaxHeight, 10);
    }

    if ('imageParameters' in options) {
        defaults.imageParameters = Object.assign({}, defaults.imageParameters, options.imageParameters);
    }
    if ('callback' in options) {
        defaults.callback = options.callback;
    }

    var actual = Object.assign({}, defaults);

    this.imageParameters = actual.imageParameters;
    this.selectionCallback = actual.callback;

    this.imageParameters = Object.assign({}, {format:''}, this.imageParameters);

    if (this.btnExistingBtn) {
        this.btnExistingBtn.addEventListener('click', (ev) => {
            var img = document.querySelector(this.btnExistingBtn.dataset.currentImage);
            if (img) {
                this.fileSelector.removeAttribute('disabled');
                this.editImage(img, this.btnExistingBtn.dataset.currentFileName);
            }
        }, false);
    }

    this.btnFileSelector.addEventListener('click', (ev) => {
        this.fileSelector.removeAttribute('disabled');
        this.fileSelector.click();
    }, false);

    this.fileSelector.addEventListener('change', this.selectorHandler.bind(this), false);
}

jFormsImageSelector.prototype = {

    _getDt : function() {
        var dt = new DataTransfer();
        if (!(typeof dt.items.add === "function")) {
            dt = new ClipboardEvent('').clipboardData;
            if (!(typeof dt.items.add === "function")) {
                dt = null;
            }
        }
        return dt;
    },

    editImage: function(imgElt, filename) {

        var format = 'image/jpeg';
        var m = filename.match(/\.(jpg|jpeg|png)$/i);
        if (m) {
            if (m[1] == 'png') {
                format = 'image/png';
            }
        }

        this.imgDialog.openFromImage(imgElt, this.imageParameters)
            .then((canvas) => {
                if (canvas) {
                    canvas = this.resizeCanvas(canvas, this.imageParameters.maxWidth, this.imageParameters.maxHeight);
                    this._saveCanvas(canvas, format, filename)
                }
            });
    },

    selectorHandler: function (ev) {
        if (this.fileSelector.files.length == 0) {
            this._removeHidden();
            return;
        }
        var file = this.fileSelector.files[0];
        if (/^image\/\w+$/.test(file.type)) {
            var format = this.imageParameters.format || file.type;
            this.imgDialog.openFromInputFile(file, this.imageParameters)
                .then((canvas) => {
                    if (canvas) {
                        canvas = this.resizeCanvas(canvas, this.imageParameters.maxWidth, this.imageParameters.maxHeight);
                        this._saveCanvas(canvas, format, file.name)
                    }
                });
        }
        else {
            if (this.imgPreview) {
                this.imgPreview.style.display = 'none';
                this._removeHidden();
            }
            window.alert('Not an image');
        }
    },

    _removeHidden: function() {
        if (this.hiddenInput) {
            this.hiddenInput.parentNode.removeChild(this.hiddenInput);
        }
        this.hiddenInput = null;
    },
    _saveCanvas: function(canvas, format, fileName) {
        var content = canvas.toDataURL(format);
        if (this.imgPreview) {
            this.imgPreview.src = content;
            this.imgPreview.style.display = 'inline';
        }

        var dt = this._getDt();
        if (dt && typeof canvas.toBlob == "function") {
            // we are using the input type=file to send the result
            canvas.toBlob((blob) => {
                var f = new File([blob], fileName, {type: format});
                dt.items.add(f);
                this.fileSelector.files = dt.files;
                this._removeHidden();
                this.selectionCallback(canvas);
            }, format);
        }
        else {
            // don't send the selected file, as it doesn't correspond to the edited image
            this.fileSelector.setAttribute('disabled', true);
            content = content.substring(content.indexOf("base64,")+7);
            var hiddenInput = document.createElement('input');
            hiddenInput.setAttribute('name', this.fileSelector.name+'_jforms_edited_image');
            hiddenInput.setAttribute('type', 'hidden');
            hiddenInput.setAttribute('value', JSON.stringify({
                'name': fileName,
                'type': format,
                'content': content
            }));
            this.hiddenInput = hiddenInput;
            this.fileSelector.parentNode.insertBefore(hiddenInput, this.fileSelector);
            this.selectionCallback(canvas);
        }
    },

    /**
     * Resize the canvas so it fits into size [maxWidth, maxHeight]
     * @param {HTMLCanvasElement} canvas
     * @param {Number} maxWidth
     * @param {Number} maxHeight
     * @returns {HTMLCanvasElement} new canvas
     */
    resizeCanvas: function(canvas, maxWidth, maxHeight) {

        if (maxWidth == 0 && maxHeight == 0) {
            return canvas;
        }

        if (maxWidth == 0) {
            maxWidth = Infinity;
        }

        if (maxHeight == 0) {
            maxHeight = Infinity;
        }

        if (maxWidth >= maxHeight) {
            if (canvas.width < canvas.height) {
                [ maxWidth, maxHeight] = [maxHeight, maxWidth];
            }
        }
        else {
            if (canvas.width >= canvas.height) {
                [ maxWidth, maxHeight] = [maxHeight, maxWidth];
            }
        }

        var newWidth = canvas.width;
        var newHeight = canvas.height;

        if (newWidth < maxWidth && newHeight < maxHeight) {
            return canvas;
        }

        if (maxWidth == Infinity) {
            if (canvas.height <= maxHeight) {
                return canvas;
            }
            newHeight = maxHeight;
            newWidth = Math.floor(newHeight * canvas.width / canvas.height);
        }
        else if (maxHeight == Infinity) {
            if (canvas.width <= maxWidth) {
                return canvas;
            }
            newWidth = maxWidth;
            newHeight =  Math.floor(newWidth * canvas.height / canvas.width);
        }
        else if (maxWidth != newWidth || maxHeight != newHeight) {
            var rMax = maxWidth / maxHeight;
            var rCan = newWidth / newHeight;
            if (rMax > rCan) {
                newWidth = Math.floor(newWidth / newHeight * maxHeight);
                newHeight = maxHeight;
            }
            else if (rMax < rCan) {
                newHeight = Math.floor(newHeight / newWidth * maxWidth);
                newWidth = maxWidth;
            }
        }

        var newCanvas = document.createElement("canvas");
        var newContext = newCanvas.getContext("2d");

        newCanvas.width = newWidth;
        newCanvas.height = newHeight;

        newContext.imageSmoothingEnabled = true;
        newContext.imageSmoothingQuality = "high";
        newContext.drawImage(canvas, 0, 0, canvas.width, canvas.height, 0, 0, newCanvas.width, newCanvas.height);
        return newCanvas;
    }
};


function jFormsImageDialog(eltSelector, options) {
    this.dialog = document.querySelector(eltSelector);
    this.cropper = null;
    this.imgContainer = this.dialog.querySelector('.jforms-image-dialog-img-container');
    this.imgCanvas = this.dialog.querySelector('.jforms-image-dialog-editor');
    this.initListeners();

    var defaults = {
        width: 800,
        height: 700,

        title: "Image editor",
        okLabel : "Ok",
        cancelLabel: "Cancel"
    };

    if (this.dialog.dataset.dialogWidth) {
        defaults.width = this.dialog.dataset.dialogWidth;
    }
    if (this.dialog.dataset.dialogHeight) {
        defaults.height = this.dialog.dataset.dialogHeight;
    }
    if (this.dialog.dataset.dialogTitle) {
        defaults.title = this.dialog.dataset.dialogTitle;
    }
    if (this.dialog.dataset.dialogOkLabel) {
        defaults.okLabel = this.dialog.dataset.dialogOkLabel;
    }
    if (this.dialog.dataset.dialogCancelLabel) {
        defaults.cancelLabel = this.dialog.dataset.dialogCancelLabel;
    }

    var actual = Object.assign({}, defaults, options);

    this.dialogMarginWidth = 80;
    this.dialogMarginHeight = 200;
    this.dialogTitle = actual.title;
    this.dialogOkLabel = actual.okLabel || "Ok";
    this.dialogCancelLabel = actual.cancelLabel || "Cancel";

    this.dialogWidth = actual.width;
    if (this.dialogWidth === 'auto') {
        this.dialogWidth = Math.min(1024, document.documentElement.clientWidth-this.dialogMarginWidth-20);
    }
    else {
        this.dialogWidth = parseInt(this.dialogWidth, 10);
    }

    this.dialogHeight = actual.height;
    if (this.dialogHeight === 'auto') {
        this.dialogHeight = Math.min(1024, document.documentElement.clientHeight-this.dialogMarginHeight-20);
    }
    else {
        this.dialogHeight = parseInt(this.dialogHeight, 10);
    }

    this.sourceImg = null;
    this.sourceFile = null;
}

jFormsImageDialog.prototype = {
    initListeners: function() {
        var me = this;
        /*this.dialog.querySelector('.zoomin').addEventListener('click', function(evt) {
            var containerData = me.cropper.getContainerData();
            me.cropper.zoomTo(1.5, {
                x: containerData.width / 2,
                y: containerData.height / 2,
            });
        }, false);
        this.dialog.querySelector('.zoomout').addEventListener('click', function(evt) {
            var containerData = me.cropper.getContainerData();
            me.cropper.zoomTo(.5, {
                x: containerData.width / 2,
                y: containerData.height / 2,
            });
        }, false);*/

        this.dialog.querySelector('.rotateleft').addEventListener('click', function(evt) {
            var dt = me.cropper.getCropBoxData();
            var cd = me.cropper.getContainerData();

            me.cropper.rotate(-90);
            var newdt = {
                left: dt.top,
                top: cd.width - dt.left - dt.width,
                width: dt.height,
                height: dt.width
            };
            me.cropper.setCropBoxData(newdt);

        }, false);
        this.dialog.querySelector('.rotateright').addEventListener('click', function(evt) {
            var dt = me.cropper.getCropBoxData();
            var cd = me.cropper.getContainerData();
            me.cropper.rotate(90);

            var newdt = {
                left: cd.height - dt.top - dt.height,
                top: dt.left,
                width: dt.height,
                height: dt.width
            };
            me.cropper.setCropBoxData(newdt);

        }, false);

        this.dialog.querySelector('.cropreset').addEventListener('click', function(evt) {
            me.cropper.reset();
            me.cropper.setData({
                x: 0,
                y: 0,
                width: me.imgCanvas.width,
                height: me.imgCanvas.height
            });

        }, false);
    },

    openFromImage: function(imgElt, options) {
        return this.openImage(options, null, imgElt);
    },

    /**
     *
     * @param {File} file
     * @param {Object} options for the final image
     * @returns {Promise<unknown>}
     */
    openFromInputFile: function(file, options) {
        return this.openImage(options, file);
    },

    openImage : function(options, sourceFile, sourceImg) {
        var defaults = {
            maxWidth: 0, // max width of the final image. the image is resized, unless width and height are set
            maxHeight: 0, // max height of the final image. the image is resized, unless width and height are set
            width: 0, // width of the final image
            height: 0 // width of the final image
        };
        this.imageOptions = Object.assign({}, defaults, options);

        var me = this;
        // we need a square container in order to have enough space to rotate
        // the image without resizing it
        var containerSize = (this.dialogWidth > this.dialogHeight ? this.dialogHeight:this.dialogWidth);
        this.imgContainer.style.width = containerSize+'px';
        this.imgContainer.style.height = containerSize+'px';

        if (sourceFile) {
            var URL = window.URL || window.webkitURL;
            var src = URL.createObjectURL(sourceFile);
            return this.initCanvas(src)
                .then(function() {
                    URL.revokeObjectURL(src);
                    return me.openDialog();
                });
        }
        else {
            return this.initCanvas(sourceImg.src)
                .then(function() {
                    return me.openDialog();
                });
        }
    },

    initCanvas : function (imgSrc) {
        var canvas = this.imgCanvas;
        return new Promise(function(resolve, reject) {
            var img = document.createElement("img");
            img.onload = function() {
                var ctx = canvas.getContext("2d");
                //var size = img.width;
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0, img.width, img.height);
                resolve();
            };
            img.src = imgSrc;
        });
    },

    initCropper: function() {
        var me = this;
        return new Promise(function(resolve, reject) {
            var options = {
                viewMode: 2,
                dragMode: 'crop',
                modal: true,
                guides: true,
                center: true,
                //movable: true,
                rotatable: true,
                scalable: false,
                //aspectRatio: 16 / 9,
                //preview: '.img-preview',
                ready: function (e) {
                    //console.log(e.type);
                    me.cropper.setData({
                        x: 0,
                        y: 0,
                        width: me.imgCanvas.width,
                        height: me.imgCanvas.height
                    });
                    resolve();
                },
                /*cropstart: function (e) {
                    //console.log(e.type, e.detail.action);
                },
                cropmove: function (e) {
                    //console.log(e.type, e.detail.action);
                },
                cropend: function (e) {
                    //console.log(e.type, e.detail.action);
                },
                crop: function (e) {
                    //console.log(e.detail, e.type);
                },
                zoom: function (e) {
                    //console.log(e.type, e.detail.ratio);
                }*/
            };

            /*var data = {
                loaded: true,
                name: file.name,
                type: file.type,
                url: URL.createObjectURL(file),
            };*/
            me.cropper = new Cropper(me.imgCanvas, options);
        });
    },
    openDialog : function() {
        var me = this;
        return new Promise(function(resolve, reject) {
            $(me.dialog).dialog({
                autoOpen: true,
                width: me.dialogWidth+me.dialogMarginWidth,
                height: me.dialogHeight+me.dialogMarginHeight,
                modal: true,
                title: me.dialogTitle,
                buttons: [
                    {
                        text: me.dialogOkLabel,
                        click: function() {
                            var cropOptions = {
                                imageSmoothingEnabled: true,
                                imageSmoothingQuality: "high"
                            };
                            var canvas = me.cropper.getCroppedCanvas(cropOptions);
                            $(this).dialog("close");
                            resolve(canvas);
                        }
                    },
                    {
                        text: me.dialogCancelLabel,
                        click: function() {
                            $(this).dialog("close");
                            resolve(null);
                        }
                    },
                ],
                open: function( event, ui ) {
                    me.initCropper();
                },
                close: function() {
                    me.cropper.destroy();
                    me.cropper = null;
                }
            });
        })
    }
};



function jFormsInitImageControl(divId) {
    var div = document.getElementById(divId);
    var imageDialog = new jFormsImageDialog("#"+divId+" .jforms-image-dialog", {});
    div.imageFormControl = new jFormsImageSelector("#"+divId, imageDialog, {});
}

function jFormsImageSelectorBtnEnable (divDOMSelector, enable) {
    var div = document.querySelector(divDOMSelector);
    var btnFileSelector = div.querySelector('.jforms-image-select-btn');
    var btnExistingBtn = div.querySelector('.jforms-image-modify-btn');
    if (enable) {
        btnFileSelector.removeAttribute("disabled");
        if (btnExistingBtn) {
            btnExistingBtn.removeAttribute("disabled");
        }
    } else {
        btnFileSelector.setAttribute("disabled", "disabled");
        if (btnExistingBtn) {
            btnExistingBtn.setAttribute("disabled", "disabled");
        }
    }
}
