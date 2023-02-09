export function arrayBufferToBase64(buffer) {
    var binary = '';
    var bytes = new Uint8Array(buffer);
    var len = bytes.byteLength;
    for (var i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
};

export function serverMetadata() {

     return cy.request ({
        url: 'index.php/view/app/metadata',
        headers: {
            authorization: 'Basic YWRtaW46YWRtaW4=',
        },
        failOnStatusCode: false,
    })
}
