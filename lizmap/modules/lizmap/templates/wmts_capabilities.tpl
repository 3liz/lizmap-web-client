<?xml version="1.0" encoding="utf-8"?>
<Capabilities version="1.0.0" xmlns="http://www.opengis.net/wmts/1.0"
                xmlns:gml="http://www.opengis.net/gml" xmlns:ows="http://www.opengis.net/ows/1.1"
                xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                xsi:schemaLocation="http://www.opengis.net/wmts/1.0 http://schemas.opengis.net/wmts/1.0/wmtsGetCapabilities_response.xsd">
    <ows:ServiceIdentification>
        <ows:Title>Service de visualisation WMTS</ows:Title>
        <ows:ServiceType>OGC WMTS</ows:ServiceType>
        <ows:ServiceTypeVersion>1.0.0</ows:ServiceTypeVersion>
    </ows:ServiceIdentification>
    <ows:ServiceProvider>
        <ows:ProviderName></ows:ProviderName>
        <ows:ProviderSite xlink:href=""/>
        <ows:ServiceContact>
            <ows:IndividualName></ows:IndividualName>
            <ows:PositionName></ows:PositionName>
            <ows:ContactInfo>
                <ows:Phone>
                    <ows:Voice/>
                    <ows:Facsimile/>
                </ows:Phone>
                <ows:Address>
                    <ows:DeliveryPoint></ows:DeliveryPoint>
                    <ows:City></ows:City>
                    <ows:AdministrativeArea/>
                    <ows:PostalCode></ows:PostalCode>
                    <ows:Country></ows:Country>
                    <ows:ElectronicMailAddress></ows:ElectronicMailAddress>
                </ows:Address>
            </ows:ContactInfo>
        </ows:ServiceContact>
    </ows:ServiceProvider>
    <ows:OperationsMetadata>
        <ows:Operation name="GetCapabilities">
            <ows:DCP>
                <ows:HTTP>
                    <ows:Get xlink:href="{$url|escxml}">
                        <ows:Constraint name="GetEncoding">
                            <ows:AllowedValues>
                                <ows:Value>KVP</ows:Value>
                            </ows:AllowedValues>
                        </ows:Constraint>
                    </ows:Get>
                </ows:HTTP>
            </ows:DCP>
        </ows:Operation>
        <ows:Operation name="GetTile">
            <ows:DCP>
                <ows:HTTP>
                    <ows:Get xlink:href="{$url|escxml}">
                        <ows:Constraint name="GetEncoding">
                            <ows:AllowedValues>
                                <ows:Value>KVP</ows:Value>
                            </ows:AllowedValues>
                        </ows:Constraint>
                    </ows:Get>
                </ows:HTTP>
            </ows:DCP>
        </ows:Operation>
    </ows:OperationsMetadata>
    <Contents>
    {foreach $layers as $l}
    <Layer>
        <ows:Identifier>{$l->name}</ows:Identifier>
        <ows:Title>{$l->title}</ows:Title>
        <Style isDefault="true">
            <ows:Identifier>default</ows:Identifier>
            <ows:Title>default</ows:Title>
        </Style>
        <ows:WGS84BoundingBox>
            <ows:LowerCorner>{$l->lowerCorner->x} {$l->lowerCorner->y}</ows:LowerCorner>
            <ows:UpperCorner>{$l->upperCorner->x} {$l->upperCorner->y}</ows:UpperCorner>
        </ows:WGS84BoundingBox>
        <Format>{$l->imageFormat}</Format>
        {foreach $l->tileMatrixSetLinkList as $tileMatrixSetLink}
        <TileMatrixSetLink>
            <TileMatrixSet>{$tileMatrixSetLink->ref}</TileMatrixSet>
            <TileMatrixSetLimits>
                {foreach $tileMatrixSetLink->tileMatrixLimits as $tileMatrixLimit}
                <TileMatrixLimits>
                    <TileMatrix>{$tileMatrixLimit->id}</TileMatrix>
                    <MinTileRow>{$tileMatrixLimit->minRow}</MinTileRow>
                    <MaxTileRow>{$tileMatrixLimit->maxRow}</MaxTileRow>
                    <MinTileCol>{$tileMatrixLimit->minCol}</MinTileCol>
                    <MaxTileCol>{$tileMatrixLimit->maxCol}</MaxTileCol>
                </TileMatrixLimits>
                {/foreach}
            </TileMatrixSetLimits>
        </TileMatrixSetLink>
        {/foreach}
    </Layer>
    {/foreach}
    {foreach $tileMatrixSetList as $tileMatrixSet}
    <TileMatrixSet>
        <ows:Identifier>{$tileMatrixSet->ref}</ows:Identifier>
        <ows:SupportedCRS>{$tileMatrixSet->ref}</ows:SupportedCRS>
        {foreach $tileMatrixSet->tileMatrixList as $k=>$tileMatrix}
        <TileMatrix>
            <ows:Identifier>{$k}</ows:Identifier>
            <ScaleDenominator>{$tileMatrix->scaleDenominator|number_format:16,'.',''}</ScaleDenominator>
            <TopLeftCorner>{$tileMatrix->left} {$tileMatrix->top}</TopLeftCorner>
            <TileWidth>256</TileWidth>
            <TileHeight>256</TileHeight>
            <MatrixWidth>{$tileMatrix->col}</MatrixWidth>
            <MatrixHeight>{$tileMatrix->row}</MatrixHeight>
        </TileMatrix>
        {/foreach}
    </TileMatrixSet>
    {/foreach}
    </Contents>
</Capabilities>
