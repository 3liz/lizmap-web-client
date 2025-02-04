/**
 * To do transform a buffer to base64
 * @param buffer
 */
export function arrayBufferToBase64(buffer) {
    var binary = '';
    var bytes = new Uint8Array(buffer);
    var len = bytes.byteLength;
    for (var i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
}

/**
 * Remove all logs from "errors.logs" using docker
 */
export function rmErrorsLog() {
    cy.exec('./../lizmap-ctl docker-exec rm -f /srv/lzm/lizmap/var/log/errors.log', {failOnNonZeroExit: false})
}

/**
 * Clear errors log using docker
 */
export function clearErrorsLog() {
    cy.exec('./../lizmap-ctl docker-exec truncate -s 0 /srv/lzm/lizmap/var/log/errors.log')
}


// export function rmLizmapAdminLog() {
//     //
//     cy.exec('./../lizmap-ctl docker-exec rm -f /srv/lzm/lizmap/var/log/lizmap-admin.log', {failOnNonZeroExit: false})
// }

/**
 * Clear Lizmap admin log using docker
 */
export function clearLizmapAdminLog() {
    cy.exec('./../lizmap-ctl docker-exec truncate -s 0 /srv/lzm/lizmap/var/log/lizmap-admin.log')
}
