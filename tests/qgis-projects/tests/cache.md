# Test CLI cache

**Project : cache**

Not possible to make this test on lizmap.com because we need the CLI

## Procedure

This test is to check the cache.
- [ ] Config the tile cache as file cache
- [ ] Create a subset of the cache with the lizmap command line:
  - `php lizmap/scripts/script.php lizmap~wmts:capabilities testsrepository cache`
  - `php lizmap/scripts/script.php lizmap~wmts:capabilities -v  testsrepository cache Quartiers EPSG:3857`
  - `php lizmap/scripts/script.php lizmap~wmts:seeding -v -f testsrepository cache Quartiers EPSG:3857 10 10`
- [ ] Check the tile cache size, you have to find 9 files
  - `find /tmp/testsrepository/cache/Quartiers/EPSG_3857/lizmap_/ -type f | wc -l`
- [ ] Run the request `http://lizmap.local:8130/index.php/lizmap/service/?repository=testsrepository&project=cache&LAYERS=Quartiers&STYLES=défaut&VERSION=1.0.0&EXCEPTIONS=application%2Fvnd.ogc.se_inimage&FORMAT=image%2Fpng&DPI=96&TRANSPARENT=true&SERVICE=WMTS&REQUEST=GetTile&LAYER=Quartiers&STYLE=default&TILEMATRIXSET=EPSG%3A3857&TILEMATRIX=10&TILEROW=373&TILECOL=523`
- [ ] Check the tile cache size has not changed, you have to find 9 files
  - `find /tmp/testsrepository/cache/Quartiers/EPSG_3857/lizmap_/ -type f | wc -l`
- [ ] Create the needed cache for the map with the lizmap command line:
  - `php lizmap/scripts/script.php lizmap~wmts:capabilities testsrepository cache`
  - `php lizmap/scripts/script.php lizmap~wmts:capabilities -v  testsrepository cache Quartiers EPSG:3857`
  - `php lizmap/scripts/script.php lizmap~wmts:seeding -v -f testsrepository cache Quartiers EPSG:3857 10 15`
- [ ] Check the tile cache size, you have to find 293 files
  - `find /tmp/testsrepository/cache/Quartiers/EPSG_3857/lizmap_/ -type f | wc -l`
- [ ] Go to the lizmap landing page and activate the browser mobile screen to use 1280x800 screen
- [ ] Go to the permalink map without authentication `http://localhost:8130/index.php/view/map/?repository=testsrepository&project=cache&bbox=425367.933686%2C5402026.205439%2C437311.219354%2C5408953.311127&crs=EPSG%3A3857`
- [ ] Check the tile cache size has not changed, you have to find 293 files
  - `find /tmp/testsrepository/cache/Quartiers/EPSG_3857/lizmap_/ -type f | wc -l`
- [ ] Authenticate as admins
- [ ] Go to the permalink map with authentication `http://localhost:8130/index.php/view/map/?repository=testsrepository&project=cache&bbox=425367.933686%2C5402026.205439%2C437311.219354%2C5408953.311127&crs=EPSG%3A3857`
- [ ] Check the tile cache size has not changed, you have to find 293 files
  - `find /tmp/testsrepository/cache/Quartiers/EPSG_3857/lizmap_/ -type f | wc -l`
- [ ] Authenticate as no admins
- [ ] Go to the permalink map with authentication `http://localhost:8130/index.php/view/map/?repository=testsrepository&project=cache&bbox=425367.933686%2C5402026.205439%2C437311.219354%2C5408953.311127&crs=EPSG%3A3857`
- [ ] Check the tile cache size has not changed, you have to find 293 files
  - `find /tmp/testsrepository/cache/Quartiers/EPSG_3857/lizmap_/ -type f | wc -l`
