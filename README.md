# Versions of Lizmap Web Client

The [raw JSON URL](https://raw.githubusercontent.com/3liz/lizmap-web-client/versions/versions.json) is used in 
Lizmap QGIS plugin. Keep in mind there is a cache from GitHub about this file.

## GitHub Action

In each Lizmap branch, there is a GitHub action to run the script [add_version.py](./add_version.py) when a
tag is published. The script is managing the update of the [versions.json](./versions.json) file.

## Manual edit

This file must be edited manually when :
* a new major version is prepared : create the new release, and change `status` to the oldest branch.
* a known issue with QGIS Desktop/Server

## Structure

```json
{
    "branch": "3.3",                       # Name of the release
    "first_release_date": "2019-09-02",    # First date of the release, YYYY-MM-DD
    "latest_release_date": "2021-01-14",   # Last date of the release, YYYY-MM-DD
    "latest_release_version": "3.3.13",    # Last full version X.Y.Z
    "qgis_min_version_recommended": 20000, # Minimum recommended, inclusive, usually even major version
    "qgis_max_version_recommended": 31500, # Maximum recommended, exclusive, usually odd major version
    "status": "dev"                        # The status of the branch
}
```

* The `status` which can be `dev`, `feature_freeze`, `stable` and `retired`
* QGIS Desktop will check `qgis_min <= Qgis.QGIS_VERSION_INT < qgis_max`
* `latest_release_version` must have a value for now, even if there isn't any release. The `date` will be empty.
