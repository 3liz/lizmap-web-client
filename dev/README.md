# Build environnement for lizmap

This directory contains a Docker image, allowing to build Lizmap
without needing to install Composer and Npm on the workstation directly.

## Build Lizmap package

To build Lizmap and to have a zip package of Lizmap, run this command
from the `dev` directory:

```
make package
```

It is equals to do `make package` from the root directory, but it uses
a docker image to build the package.

## Build a Lizmap docker image

Just follow original instruction. From the parent directory, execute:
```
make docker-build
```

You can do also `make docker-tag docker-clean` if you build the image to release it.
