# Build and testing the Lizmap Docker image

First you have to install [Docker](https://www.docker.com/) on your computer.

Then you should go in the root of the repository, and follow these instructions:


* if you have to install all developer tools indicating into the [CONTRIBUTING.md](../CONTRIBUTING.md) file
  of the root directory, execute `make package`. Else if you don't want to install
  them, you can use the docker container of `dev/`. Execute `make -C dev/ build`.
* execute `make docker-build-ci`
* at the end of the execution of this command, it displays `Successfully tagged
  3liz/lizmap-web-client:X.Y.Z-D` where `X.Y.Z-D` are numbers. This is the version of the image.
* download sources files from https://github.com/3liz/lizmap-docker-compose/ and install
  them somewhere. This repository has a Docker Compose file which defines a
  "stack" to run nginx+qgis+lizmap.
* In the directory of lizmap-docker-compose, execute `make start LIZMAP_VERSION_TAG=X.Y.Z-D`
  (by replacing X.Y.Z-D by the version you get previously above)
* You can use your web browser to play with lizmap, at the address http://localhost:8090
