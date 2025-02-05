/** @type {import('stylelint').Config} */

export default {
    "extends": "stylelint-config-standard",
    "rules": {
        "block-no-empty": null,  // To fix, or to disable per file ?
        "declaration-block-no-duplicate-properties": null, // Candidate to fix ?
        "declaration-block-no-shorthand-property-overrides": null,
        "declaration-block-single-line-max-declarations": null,
        "declaration-property-value-no-unknown": null,
        "declaration-property-value-keyword-no-deprecated": null,  // To fix ?
        "font-family-no-missing-generic-family-keyword": null,
        "media-feature-name-no-unknown": null,
        "no-descending-specificity": null,
        "no-duplicate-selectors": null,  // Candidate to fix ?
        "no-empty-source": null,
        "selector-class-pattern": ".*",
        "selector-id-pattern": ".*"
    },
    "ignoreFiles": [
        "docs/**/*.css",
        "lizmap/vendor/**/*.css",
        "lizmap/www/assets/css/bootstrap.min.css",
        "lizmap/www/assets/css/dataTables.bootstrap.min.css",
        "lizmap/www/assets/css/jquery.dataTables.min.css",
        "lizmap/www/assets/css/responsive.dataTables.min.css",
        "lizmap/www/assets/jelix/**/*.css",
        "lizmap/www/assets/js/jquery/**/*.css",
        "tests/units/vendor/**/*.css",
        "vendor/**/*.css",
        "www/assets/**/*.css",
    ]
};
