window.onload = () => {
    const repIdInput = document.getElementById('jforms_admin_config_section_repository');
    if (repIdInput.hasAttribute('readonly')) {
        return;
    }
    document.getElementById('jforms_admin_config_section_path').addEventListener('change', (evt) => {
        const repVal = evt.target.value;
        const repName = repVal.trim().replace('_', ' ').replace('-', ' ').replace(/^\/+/, '').replace(/\/+$/, '').split('/').pop();
        document.getElementById('jforms_admin_config_section_label').value = repName[0].toUpperCase() + repName.slice(1).toLowerCase();
        document.getElementById('jforms_admin_config_section_repository').value = repName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replaceAll(/[^a-z0-9]/g, '');
    });
};
