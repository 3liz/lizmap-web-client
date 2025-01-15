export function arrayBufferToBase64(buffer) {
    var binary = '';
    var bytes = new Uint8Array(buffer);
    var len = bytes.byteLength;
    for (var i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
};

export function rmErrorsLog() {
    // Remove errors log
    cy.exec('./../lizmap-ctl docker-exec rm -f /srv/lzm/lizmap/var/log/errors.log', {failOnNonZeroExit: false})
}

export function clearErrorsLog() {
    // Clear errors log
    cy.exec('./../lizmap-ctl docker-exec truncate -s 0 /srv/lzm/lizmap/var/log/errors.log')
}

export function rmLizmapAdminLog() {
    // Remove errors log
    cy.exec('./../lizmap-ctl docker-exec rm -f /srv/lzm/lizmap/var/log/errors.log', {failOnNonZeroExit: false})
}

export function clearLizmapAdminLog() {
    // Clear errors log
    cy.exec('./../lizmap-ctl docker-exec truncate -s 0 /srv/lzm/lizmap/var/log/errors.log')
}

export function serverMetadata() {

     return cy.request ({
        url: 'index.php/view/app/metadata',
        headers: {
            authorization: 'Basic YWRtaW46YWRtaW4=',
        },
        failOnStatusCode: false,
    })
}
