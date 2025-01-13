window.onload = () => {
    let textarea = document.getElementById('lizmap-admin-log');
    textarea.scrollTop = textarea.scrollHeight;

    textarea = document.getElementById('lizmap-error-log');
    if (textarea) {
        textarea.scrollTop = textarea.scrollHeight;
    }
};
