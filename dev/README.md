# Build environnement for lizmap

## Build Lizmap package

from the `dev` directory
```
make build
```

or from the parent directory:
```
make -C dev build
```
## Build Lizmap image

from the parent directory:
```
make docker-build docker-tag docker-clean
```
