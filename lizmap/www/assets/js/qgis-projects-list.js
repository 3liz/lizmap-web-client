
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('repository-selector').addEventListener('change', function () {
        const baseUrl = document.getElementById('lizmap_project_list_container').dataset.baseUrl;
        const repositoryFilter = this.value;
        window.location = repositoryFilter ? baseUrl + '?repository=' + repositoryFilter : baseUrl;
    });
});
