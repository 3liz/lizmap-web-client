<?php

use Lizmap\App;
use Lizmap\Project\Qgis;
use PHPUnit\Framework\TestCase;

/**
 * @internal
 *
 * @coversNothing
 */
class ProjectVisibilityPresetTest extends TestCase
{
    public function testFromXmlReader(): void
    {
        $xmlStr = '
        <visibility-preset has-checked-group-info="1" name="theme1" has-expanded-info="1">
          <layer visible="1" expanded="1" id="quartiers_ef5b13e3_36db_4e0d_98b3_990de580367d" style="style1"/>
          <expanded-legend-nodes id="quartiers_ef5b13e3_36db_4e0d_98b3_990de580367d"/>
          <checked-group-nodes/>
          <expanded-group-nodes>
            <expanded-group-node id="group1"/>
          </expanded-group-nodes>
        </visibility-preset>
        ';
        $oXml = App\XmlTools::xmlReaderFromString($xmlStr);
        $visibilityPreset = Qgis\ProjectVisibilityPreset::fromXmlReader($oXml);

        $this->assertEquals('theme1', $visibilityPreset->name);
        $this->assertCount(0, $visibilityPreset->checkedGroupNodes);
        $this->assertCount(1, $visibilityPreset->expandedGroupNodes);
        $this->assertCount(1, $visibilityPreset->layers);
        $this->assertInstanceOf(Qgis\ProjectVisibilityPresetLayer::class, $visibilityPreset->layers[0]);
        $data = array(
            'id' => 'quartiers_ef5b13e3_36db_4e0d_98b3_990de580367d',
            'visible' => true,
            'style' => 'style1',
            'expanded' => true,
        );
        foreach ($data as $prop => $value) {
            $this->assertEquals($value, $visibilityPreset->layers[0]->{$prop}, $prop);
        }

        $dataArray = $visibilityPreset->toKeyArray();
        $this->assertCount(1, $dataArray['layers']);
        $this->assertArrayHasKey('quartiers_ef5b13e3_36db_4e0d_98b3_990de580367d', $dataArray['layers']);
        $this->assertEquals('style1', $dataArray['layers']['quartiers_ef5b13e3_36db_4e0d_98b3_990de580367d']['style']);
        $this->assertTrue($dataArray['layers']['quartiers_ef5b13e3_36db_4e0d_98b3_990de580367d']['expanded']);
        $this->assertCount(0, $dataArray['checkedGroupNode']);
        $this->assertCount(1, $dataArray['expandedGroupNode']);

        $xmlStr = '
        <visibility-preset has-checked-group-info="1" name="theme1" has-expanded-info="1">
          <layer visible="0" expanded="1" id="sousquartiers_7c49d0fc_0ee0_4308_a66d_45c144e59872" style="défaut"/>
          <expanded-legend-nodes id="sousquartiers_7c49d0fc_0ee0_4308_a66d_45c144e59872"/>
          <layer visible="1" expanded="1" id="quartiers_ef5b13e3_36db_4e0d_98b3_990de580367d" style="style1"/>
          <expanded-legend-nodes id="quartiers_ef5b13e3_36db_4e0d_98b3_990de580367d"/>
          <checked-group-nodes/>
          <expanded-group-nodes>
            <expanded-group-node id="group1"/>
          </expanded-group-nodes>
        </visibility-preset>
        ';
        $oXml = App\XmlTools::xmlReaderFromString($xmlStr);
        $visibilityPreset = Qgis\ProjectVisibilityPreset::fromXmlReader($oXml);

        $this->assertEquals('theme1', $visibilityPreset->name);
        $this->assertCount(0, $visibilityPreset->checkedGroupNodes);
        $this->assertCount(1, $visibilityPreset->expandedGroupNodes);
        $this->assertCount(2, $visibilityPreset->layers);
        $this->assertInstanceOf(Qgis\ProjectVisibilityPresetLayer::class, $visibilityPreset->layers[0]);
        $data = array(
            'id' => 'sousquartiers_7c49d0fc_0ee0_4308_a66d_45c144e59872',
            'visible' => false,
            'style' => 'défaut',
            'expanded' => true,
        );
        foreach ($data as $prop => $value) {
            $this->assertEquals($value, $visibilityPreset->layers[0]->{$prop}, $prop);
        }
        $data = array(
            'id' => 'quartiers_ef5b13e3_36db_4e0d_98b3_990de580367d',
            'visible' => true,
            'style' => 'style1',
            'expanded' => true,
        );
        foreach ($data as $prop => $value) {
            $this->assertEquals($value, $visibilityPreset->layers[1]->{$prop}, $prop);
        }

        $dataArray = $visibilityPreset->toKeyArray();
        $this->assertCount(2, $dataArray['layers']);
        $this->assertArrayHasKey('sousquartiers_7c49d0fc_0ee0_4308_a66d_45c144e59872', $dataArray['layers']);
        $this->assertEquals('défaut', $dataArray['layers']['sousquartiers_7c49d0fc_0ee0_4308_a66d_45c144e59872']['style']);
        $this->assertTrue($dataArray['layers']['sousquartiers_7c49d0fc_0ee0_4308_a66d_45c144e59872']['expanded']);
        $this->assertArrayHasKey('quartiers_ef5b13e3_36db_4e0d_98b3_990de580367d', $dataArray['layers']);
        $this->assertEquals('style1', $dataArray['layers']['quartiers_ef5b13e3_36db_4e0d_98b3_990de580367d']['style']);
        $this->assertTrue($dataArray['layers']['quartiers_ef5b13e3_36db_4e0d_98b3_990de580367d']['expanded']);
        $this->assertCount(0, $dataArray['checkedGroupNode']);
        $this->assertCount(1, $dataArray['expandedGroupNode']);
    }

    public function testCheckedLegendNodes(): void
    {
        $xmlStr = '
    <visibility-preset has-checked-group-info="1" name="Fiche Parcelle" has-expanded-info="1">
      <layer id="_plu_supI2_energie_hydraulique_vue__9ed5e751_cbf3_4301_b0d2_7d85c4341586" visible="1" style="défaut" expanded="1"/>
      <expanded-legend-nodes id="_plu_supI2_energie_hydraulique_vue__9ed5e751_cbf3_4301_b0d2_7d85c4341586"/>
      <layer id="limite_de_zone_753cbb86_9669_4e79_920c_32c1bfcb9e8d" visible="1" style="défaut" expanded="0"/>
      <expanded-legend-nodes id="limite_de_zone_753cbb86_9669_4e79_920c_32c1bfcb9e8d"/>
      <layer id="plu___prescription_surf_83e94ba7_7da1_4d42_ad62_c87e4bb25898" visible="1" style="défaut" expanded="0"/>
      <expanded-legend-nodes id="plu___prescription_surf_83e94ba7_7da1_4d42_ad62_c87e4bb25898"/>
      <layer id="plu_supPM1_26d0b837_4de2_4e96_8796_9cf4adfc4271" visible="1" style="défaut" expanded="0"/>
      <expanded-legend-nodes id="plu_supPM1_26d0b837_4de2_4e96_8796_9cf4adfc4271"/>
      <layer id="plu___information_surf_c08be7a7_f337_4f2c_ab14_44a2310d9283" visible="1" style="défaut" expanded="1"/>
      <expanded-legend-nodes id="plu___information_surf_c08be7a7_f337_4f2c_ab14_44a2310d9283"/>
      <layer id="fg_36993b66_242e_47a5_a840_c2974ae0ac44" visible="1" style="défaut" expanded="1"/>
      <expanded-legend-nodes id="fg_36993b66_242e_47a5_a840_c2974ae0ac44"/>
      <layer id="plu_supPM2_generateur_a9dd6147_5dd1_4527_8aed_6241e19414ef" visible="1" style="défaut" expanded="1"/>
      <expanded-legend-nodes id="plu_supPM2_generateur_a9dd6147_5dd1_4527_8aed_6241e19414ef"/>
      <layer id="plu_supAC4_generateur_d66f3463_0fc2_477a_a53a_2ee61f5f3a31" visible="1" style="défaut" expanded="0"/>
      <expanded-legend-nodes id="plu_supAC4_generateur_d66f3463_0fc2_477a_a53a_2ee61f5f3a31"/>
      <layer id="plu___prescription_surf_58190aa5_1d78_45fe_8702_23d596d772d4" visible="1" style="défaut" expanded="0"/>
      <expanded-legend-nodes id="plu___prescription_surf_58190aa5_1d78_45fe_8702_23d596d772d4"/>
      <layer id="_plu_supEL3_halage_marchepied_vue__b0591894_8eb7_48b0_bbf9_2c03171622da" visible="1" style="défaut" expanded="0"/>
      <expanded-legend-nodes id="_plu_supEL3_halage_marchepied_vue__b0591894_8eb7_48b0_bbf9_2c03171622da"/>
      <layer id="plu___prescription_lin_0a44bcb9_807e_4d1c_b2c1_e07265f16371" visible="1" style="défaut" expanded="1"/>
      <expanded-legend-nodes id="plu___prescription_lin_0a44bcb9_807e_4d1c_b2c1_e07265f16371"/>
      <layer id="cadastre2018120181201820201812018112010164688817740" visible="1" style="défaut" expanded="0"/>
      <expanded-legend-nodes id="cadastre2018120181201820201812018112010164688817740"/>
      <layer id="plu___prescription_lin_e49bc701_5d8a_413d_adb3_fd82dd1d7b34" visible="1" style="défaut" expanded="0"/>
      <expanded-legend-nodes id="plu___prescription_lin_e49bc701_5d8a_413d_adb3_fd82dd1d7b34"/>
      <layer id="__5fdc6da5_331e_4adc_aceb_c953c52943b5" visible="1" style="défaut" expanded="1"/>
      <expanded-legend-nodes id="__5fdc6da5_331e_4adc_aceb_c953c52943b5"/>
      <layer id="plu___prescription_surf_e27bc7a3_394a_4536_be8d_81c37d2b697c" visible="1" style="défaut" expanded="1"/>
      <expanded-legend-nodes id="plu___prescription_surf_e27bc7a3_394a_4536_be8d_81c37d2b697c"/>
      <layer id="plu_supPM2_assiette_5356665e_e794_426b_8242_693f2c1111df" visible="1" style="défaut" expanded="1"/>
      <expanded-legend-nodes id="plu_supPM2_assiette_5356665e_e794_426b_8242_693f2c1111df"/>
      <layer id="plu___prescription_lin_67b16d24_fd35_4d22_b0bd_0e6d59b15d28" visible="1" style="défaut" expanded="0"/>
      <expanded-legend-nodes id="plu___prescription_lin_67b16d24_fd35_4d22_b0bd_0e6d59b15d28"/>
      <layer id="_plu_supI1_hydrocarbures_liquides_vue__f7b7036c_1ca8_4250_834a_45aeca9dd21a" visible="1" style="défaut" expanded="0"/>
      <expanded-legend-nodes id="_plu_supI1_hydrocarbures_liquides_vue__f7b7036c_1ca8_4250_834a_45aeca9dd21a"/>
      <layer id="_plu_supI4_ligne_electrique_generateur_vue__1ddc556e_8d64_4d81_860d_eeba047fe630" visible="1" style="défaut" expanded="1"/>
      <expanded-legend-nodes id="_plu_supI4_ligne_electrique_generateur_vue__1ddc556e_8d64_4d81_860d_eeba047fe630"/>
      <layer id="plu___prescription_surf_76564312_efbd_43f6_9da1_006687b9411a" visible="1" style="défaut" expanded="1"/>
      <checked-legend-nodes id="plu___prescription_surf_76564312_efbd_43f6_9da1_006687b9411a"/>
      <expanded-legend-nodes id="plu___prescription_surf_76564312_efbd_43f6_9da1_006687b9411a"/>
      <layer id="plu_supAS1_assiette_c4e13d9f_cabc_4b0a_a3f2_ced040a9a57c" visible="1" style="défaut" expanded="0"/>
      <expanded-legend-nodes id="plu_supAS1_assiette_c4e13d9f_cabc_4b0a_a3f2_ced040a9a57c"/>
      <layer id="plu_supPT2_assiette_ad7b3e35_03f3_46be_bde3_ad9d2b66479a" visible="1" style="défaut" expanded="0"/>
      <expanded-legend-nodes id="plu_supPT2_assiette_ad7b3e35_03f3_46be_bde3_ad9d2b66479a"/>
      <layer id="plu_supT1_generateur_cf8a448d_41de_4919_9aee_a09772ed9e85" visible="1" style="défaut" expanded="0"/>
      <expanded-legend-nodes id="plu_supT1_generateur_cf8a448d_41de_4919_9aee_a09772ed9e85"/>
      <layer id="plu___prescription_surf_e609999a_70cf_4cc3_bcc4_7d8f7bb1c759" visible="1" style="défaut" expanded="0"/>
      <expanded-legend-nodes id="plu___prescription_surf_e609999a_70cf_4cc3_bcc4_7d8f7bb1c759"/>
      <layer id="_plu_supI3_canalisation_gaz_vue__0a9e5f24_4356_4af8_9254_4ca68438d33c" visible="1" style="défaut" expanded="1"/>
      <expanded-legend-nodes id="_plu_supI3_canalisation_gaz_vue__0a9e5f24_4356_4af8_9254_4ca68438d33c"/>
      <layer id="plu___prescription_surf_7b34c84c_2c08_4362_85d9_0b27c779020b" visible="1" style="défaut" expanded="0"/>
      <expanded-legend-nodes id="plu___prescription_surf_7b34c84c_2c08_4362_85d9_0b27c779020b"/>
      <layer id="__f0b3e0c2_840e_4de0_b1cb_44851b06a29d" visible="1" style="défaut" expanded="1"/>
      <expanded-legend-nodes id="__f0b3e0c2_840e_4de0_b1cb_44851b06a29d"/>
      <layer id="_plu_supInt1_cimetieres_generateur_vue__288bf635_b350_4b51_b5ed_44f1ee8710df" visible="1" style="défaut" expanded="0"/>
      <expanded-legend-nodes id="_plu_supInt1_cimetieres_generateur_vue__288bf635_b350_4b51_b5ed_44f1ee8710df"/>
      <layer id="plu_supAC2_assiette_568a7be7_60a3_4eaf_8dde_948e369c16b9" visible="1" style="défaut" expanded="0"/>
      <expanded-legend-nodes id="plu_supAC2_assiette_568a7be7_60a3_4eaf_8dde_948e369c16b9"/>
      <layer id="ok_441f22d9_6e3c_49aa_8a76_2ccd78ab80c2" visible="1" style="défaut" expanded="1"/>
      <expanded-legend-nodes id="ok_441f22d9_6e3c_49aa_8a76_2ccd78ab80c2"/>
      <layer id="plu_supPT1_assiette_f72f8b36_a960_4e1a_89b3_75f5cdc48fdb" visible="1" style="défaut" expanded="0"/>
      <expanded-legend-nodes id="plu_supPT1_assiette_f72f8b36_a960_4e1a_89b3_75f5cdc48fdb"/>
      <layer id="_plu_supInt1_cimetieres_assiette_vue__694ac71a_267a_4dd8_a405_10bb2142f793" visible="1" style="défaut" expanded="0"/>
      <expanded-legend-nodes id="_plu_supInt1_cimetieres_assiette_vue__694ac71a_267a_4dd8_a405_10bb2142f793"/>
      <layer id="zone_urba20150415150309132" visible="1" style="défaut" expanded="0"/>
      <expanded-legend-nodes id="zone_urba20150415150309132"/>
      <layer id="_plu_supI3_canalisation_gaz_generateur_vue__7a339848_2c98_4a58_908d_d1745cc4ff1c" visible="1" style="défaut" expanded="1"/>
      <expanded-legend-nodes id="_plu_supI3_canalisation_gaz_generateur_vue__7a339848_2c98_4a58_908d_d1745cc4ff1c"/>
      <layer id="plu_supPM3_assiette_b52611f0_9752_4028_998b_095b9eb93bb7" visible="1" style="défaut" expanded="0"/>
      <expanded-legend-nodes id="plu_supPM3_assiette_b52611f0_9752_4028_998b_095b9eb93bb7"/>
      <layer id="dgfip_commune_avignon201602019082115213608522337" visible="1" style="défaut" expanded="0"/>
      <expanded-legend-nodes id="dgfip_commune_avignon201602019082115213608522337"/>
      <layer id="_plu_supI4_ligne_electrique_vue__d4db38f8_3ddb_4d35_90e1_b12de3d473b1" visible="1" style="défaut" expanded="1"/>
      <expanded-legend-nodes id="_plu_supI4_ligne_electrique_vue__d4db38f8_3ddb_4d35_90e1_b12de3d473b1"/>
      <layer id="plu_supAC1_generateur_e5857305_debe_428c_aef0_fc166a8ccdac" visible="1" style="défaut" expanded="1"/>
      <expanded-legend-nodes id="plu_supAC1_generateur_e5857305_debe_428c_aef0_fc166a8ccdac"/>
      <checked-group-nodes>
        <checked-group-node id="popup"/>
        <checked-group-node id="PSMV/psmv : prescriptions"/>
        <checked-group-node id="Servitudes (SUP)/PM2 - servitude relative aux installations classées et sites constituant une menacepour la sécurité et la salubrité publiques"/>
        <checked-group-node id="Fond de carte"/>
        <checked-group-node id="Servitudes (SUP)/I3 - servitudes relatives à l\'établissement des  canalisations de transport de gaz, d\'hydrocarbures et de produits chimiques"/>
        <checked-group-node id="PLU"/>
        <checked-group-node id="Servitudes (SUP)"/>
        <checked-group-node id="Servitudes (SUP)/I4 - servitudes relatives à l\'établissement des canalisations électriques"/>
        <checked-group-node id="Servitudes (SUP)/Int1 - servitude instituée au voisinage des cimetières"/>
        <checked-group-node id="PSMV"/>
        <checked-group-node id="PLU/canaux et filioles"/>
        <checked-group-node id="listes de valeurs"/>
        <checked-group-node id="Servitudes (SUP)/AC1 - mesures de classement et d\'inscription et protections des abords des monuments historiques"/>
        <checked-group-node id="PLU/patrimoine naturel et bâti"/>
      </checked-group-nodes>
      <expanded-group-nodes>
        <expanded-group-node id="popup"/>
        <expanded-group-node id="Fond de carte"/>
        <expanded-group-node id="PLU"/>
        <expanded-group-node id="Servitudes (SUP)"/>
        <expanded-group-node id="PSMV"/>
        <expanded-group-node id="listes de valeurs"/>
      </expanded-group-nodes>
    </visibility-preset>
        ';
        $oXml = App\XmlTools::xmlReaderFromString($xmlStr);
        $visibilityPreset = Qgis\ProjectVisibilityPreset::fromXmlReader($oXml);

        $this->assertEquals('Fiche Parcelle', $visibilityPreset->name);
        $this->assertCount(38, $visibilityPreset->layers);
        $this->assertCount(0, $visibilityPreset->checkedLegendNodes);
        $this->assertCount(14, $visibilityPreset->checkedGroupNodes);
        $this->assertCount(6, $visibilityPreset->expandedGroupNodes);

        $xmlStr = '
    <visibility-preset has-checked-group-info="1" name="Fiche parcelle overview" has-expanded-info="1">
      <layer id="plu___prescription_surf_e609999a_70cf_4cc3_bcc4_7d8f7bb1c759" visible="0" style="défaut" expanded="0"/>
      <expanded-legend-nodes id="plu___prescription_surf_e609999a_70cf_4cc3_bcc4_7d8f7bb1c759"/>
      <layer id="limite_de_zone_753cbb86_9669_4e79_920c_32c1bfcb9e8d" visible="0" style="défaut" expanded="0"/>
      <expanded-legend-nodes id="limite_de_zone_753cbb86_9669_4e79_920c_32c1bfcb9e8d"/>
      <layer id="plu_supPT2_assiette_ad7b3e35_03f3_46be_bde3_ad9d2b66479a" visible="0" style="défaut" expanded="0"/>
      <expanded-legend-nodes id="plu_supPT2_assiette_ad7b3e35_03f3_46be_bde3_ad9d2b66479a"/>
      <layer id="plu_supPM2_generateur_a9dd6147_5dd1_4527_8aed_6241e19414ef" visible="0" style="défaut" expanded="1"/>
      <expanded-legend-nodes id="plu_supPM2_generateur_a9dd6147_5dd1_4527_8aed_6241e19414ef"/>
      <layer id="_plu_supI3_canalisation_gaz_generateur_vue__7a339848_2c98_4a58_908d_d1745cc4ff1c" visible="0" style="défaut" expanded="1"/>
      <expanded-legend-nodes id="_plu_supI3_canalisation_gaz_generateur_vue__7a339848_2c98_4a58_908d_d1745cc4ff1c"/>
      <layer id="__f0b3e0c2_840e_4de0_b1cb_44851b06a29d" visible="0" style="défaut" expanded="1"/>
      <expanded-legend-nodes id="__f0b3e0c2_840e_4de0_b1cb_44851b06a29d"/>
      <layer id="plu_supPT1_assiette_f72f8b36_a960_4e1a_89b3_75f5cdc48fdb" visible="0" style="défaut" expanded="0"/>
      <expanded-legend-nodes id="plu_supPT1_assiette_f72f8b36_a960_4e1a_89b3_75f5cdc48fdb"/>
      <layer id="plu___prescription_lin_67b16d24_fd35_4d22_b0bd_0e6d59b15d28" visible="0" style="défaut" expanded="0"/>
      <expanded-legend-nodes id="plu___prescription_lin_67b16d24_fd35_4d22_b0bd_0e6d59b15d28"/>
      <layer id="fg_36993b66_242e_47a5_a840_c2974ae0ac44" visible="0" style="défaut" expanded="1"/>
      <expanded-legend-nodes id="fg_36993b66_242e_47a5_a840_c2974ae0ac44"/>
      <layer id="plu_supT1_generateur_cf8a448d_41de_4919_9aee_a09772ed9e85" visible="0" style="défaut" expanded="0"/>
      <expanded-legend-nodes id="plu_supT1_generateur_cf8a448d_41de_4919_9aee_a09772ed9e85"/>
      <layer id="_plu_supI4_ligne_electrique_generateur_vue__1ddc556e_8d64_4d81_860d_eeba047fe630" visible="0" style="défaut" expanded="1"/>
      <expanded-legend-nodes id="_plu_supI4_ligne_electrique_generateur_vue__1ddc556e_8d64_4d81_860d_eeba047fe630"/>
      <layer id="dgfip_commune_avignon201602019082115213608522337" visible="1" style="défaut" expanded="0"/>
      <expanded-legend-nodes id="dgfip_commune_avignon201602019082115213608522337"/>
      <layer id="_plu_supI3_canalisation_gaz_vue__0a9e5f24_4356_4af8_9254_4ca68438d33c" visible="0" style="défaut" expanded="1"/>
      <expanded-legend-nodes id="_plu_supI3_canalisation_gaz_vue__0a9e5f24_4356_4af8_9254_4ca68438d33c"/>
      <layer id="_plu_supI4_ligne_electrique_vue__d4db38f8_3ddb_4d35_90e1_b12de3d473b1" visible="0" style="défaut" expanded="1"/>
      <expanded-legend-nodes id="_plu_supI4_ligne_electrique_vue__d4db38f8_3ddb_4d35_90e1_b12de3d473b1"/>
      <layer id="ok_441f22d9_6e3c_49aa_8a76_2ccd78ab80c2" visible="0" style="défaut" expanded="1"/>
      <expanded-legend-nodes id="ok_441f22d9_6e3c_49aa_8a76_2ccd78ab80c2"/>
      <layer id="plu_supAC2_assiette_568a7be7_60a3_4eaf_8dde_948e369c16b9" visible="0" style="défaut" expanded="0"/>
      <expanded-legend-nodes id="plu_supAC2_assiette_568a7be7_60a3_4eaf_8dde_948e369c16b9"/>
      <layer id="plu___prescription_surf_7b34c84c_2c08_4362_85d9_0b27c779020b" visible="0" style="défaut" expanded="0"/>
      <expanded-legend-nodes id="plu___prescription_surf_7b34c84c_2c08_4362_85d9_0b27c779020b"/>
      <layer id="plu___prescription_surf_76564312_efbd_43f6_9da1_006687b9411a" visible="0" style="défaut" expanded="1"/>
      <checked-legend-nodes id="plu___prescription_surf_76564312_efbd_43f6_9da1_006687b9411a"/>
      <expanded-legend-nodes id="plu___prescription_surf_76564312_efbd_43f6_9da1_006687b9411a"/>
      <layer id="plu___prescription_surf_83e94ba7_7da1_4d42_ad62_c87e4bb25898" visible="0" style="défaut" expanded="0"/>
      <expanded-legend-nodes id="plu___prescription_surf_83e94ba7_7da1_4d42_ad62_c87e4bb25898"/>
      <layer id="plu_supAC1_generateur_e5857305_debe_428c_aef0_fc166a8ccdac" visible="0" style="défaut" expanded="1"/>
      <expanded-legend-nodes id="plu_supAC1_generateur_e5857305_debe_428c_aef0_fc166a8ccdac"/>
      <layer id="__5fdc6da5_331e_4adc_aceb_c953c52943b5" visible="0" style="défaut" expanded="1"/>
      <expanded-legend-nodes id="__5fdc6da5_331e_4adc_aceb_c953c52943b5"/>
      <layer id="plu_supPM1_26d0b837_4de2_4e96_8796_9cf4adfc4271" visible="0" style="défaut" expanded="0"/>
      <expanded-legend-nodes id="plu_supPM1_26d0b837_4de2_4e96_8796_9cf4adfc4271"/>
      <layer id="plu___prescription_surf_e27bc7a3_394a_4536_be8d_81c37d2b697c" visible="0" style="défaut" expanded="1"/>
      <expanded-legend-nodes id="plu___prescription_surf_e27bc7a3_394a_4536_be8d_81c37d2b697c"/>
      <layer id="cadastre2018120181201820201812018112010164688817740" visible="1" style="défaut" expanded="0"/>
      <expanded-legend-nodes id="cadastre2018120181201820201812018112010164688817740"/>
      <layer id="plu___prescription_lin_0a44bcb9_807e_4d1c_b2c1_e07265f16371" visible="0" style="défaut" expanded="1"/>
      <expanded-legend-nodes id="plu___prescription_lin_0a44bcb9_807e_4d1c_b2c1_e07265f16371"/>
      <layer id="plu___information_surf_c08be7a7_f337_4f2c_ab14_44a2310d9283" visible="0" style="défaut" expanded="1"/>
      <expanded-legend-nodes id="plu___information_surf_c08be7a7_f337_4f2c_ab14_44a2310d9283"/>
      <layer id="plu_supPM3_assiette_b52611f0_9752_4028_998b_095b9eb93bb7" visible="0" style="défaut" expanded="0"/>
      <expanded-legend-nodes id="plu_supPM3_assiette_b52611f0_9752_4028_998b_095b9eb93bb7"/>
      <layer id="_plu_supInt1_cimetieres_generateur_vue__288bf635_b350_4b51_b5ed_44f1ee8710df" visible="0" style="défaut" expanded="0"/>
      <expanded-legend-nodes id="_plu_supInt1_cimetieres_generateur_vue__288bf635_b350_4b51_b5ed_44f1ee8710df"/>
      <layer id="plu_supAS1_assiette_c4e13d9f_cabc_4b0a_a3f2_ced040a9a57c" visible="0" style="défaut" expanded="0"/>
      <expanded-legend-nodes id="plu_supAS1_assiette_c4e13d9f_cabc_4b0a_a3f2_ced040a9a57c"/>
      <layer id="plu___prescription_lin_e49bc701_5d8a_413d_adb3_fd82dd1d7b34" visible="0" style="défaut" expanded="0"/>
      <expanded-legend-nodes id="plu___prescription_lin_e49bc701_5d8a_413d_adb3_fd82dd1d7b34"/>
      <layer id="zone_urba20150415150309132" visible="0" style="défaut" expanded="0"/>
      <expanded-legend-nodes id="zone_urba20150415150309132"/>
      <layer id="plu___prescription_surf_58190aa5_1d78_45fe_8702_23d596d772d4" visible="0" style="défaut" expanded="0"/>
      <expanded-legend-nodes id="plu___prescription_surf_58190aa5_1d78_45fe_8702_23d596d772d4"/>
      <layer id="_plu_supI1_hydrocarbures_liquides_vue__f7b7036c_1ca8_4250_834a_45aeca9dd21a" visible="0" style="défaut" expanded="0"/>
      <expanded-legend-nodes id="_plu_supI1_hydrocarbures_liquides_vue__f7b7036c_1ca8_4250_834a_45aeca9dd21a"/>
      <layer id="_plu_supI2_energie_hydraulique_vue__9ed5e751_cbf3_4301_b0d2_7d85c4341586" visible="0" style="défaut" expanded="1"/>
      <expanded-legend-nodes id="_plu_supI2_energie_hydraulique_vue__9ed5e751_cbf3_4301_b0d2_7d85c4341586"/>
      <layer id="_plu_supEL3_halage_marchepied_vue__b0591894_8eb7_48b0_bbf9_2c03171622da" visible="0" style="défaut" expanded="0"/>
      <expanded-legend-nodes id="_plu_supEL3_halage_marchepied_vue__b0591894_8eb7_48b0_bbf9_2c03171622da"/>
      <layer id="_plu_supInt1_cimetieres_assiette_vue__694ac71a_267a_4dd8_a405_10bb2142f793" visible="0" style="défaut" expanded="0"/>
      <expanded-legend-nodes id="_plu_supInt1_cimetieres_assiette_vue__694ac71a_267a_4dd8_a405_10bb2142f793"/>
      <layer id="plu_supPM2_assiette_5356665e_e794_426b_8242_693f2c1111df" visible="0" style="défaut" expanded="1"/>
      <expanded-legend-nodes id="plu_supPM2_assiette_5356665e_e794_426b_8242_693f2c1111df"/>
      <checked-group-nodes>
        <checked-group-node id="PSMV/psmv : prescriptions"/>
        <checked-group-node id="Servitudes (SUP)/PM2 - servitude relative aux installations classées et sites constituant une menacepour la sécurité et la salubrité publiques"/>
        <checked-group-node id="Fond de carte"/>
        <checked-group-node id="Servitudes (SUP)/I3 - servitudes relatives à l\'établissement des  canalisations de transport de gaz, d\'hydrocarbures et de produits chimiques"/>
        <checked-group-node id="Servitudes (SUP)/I4 - servitudes relatives à l\'établissement des canalisations électriques"/>
        <checked-group-node id="Servitudes (SUP)/Int1 - servitude instituée au voisinage des cimetières"/>
        <checked-group-node id="PLU/canaux et filioles"/>
        <checked-group-node id="listes de valeurs"/>
        <checked-group-node id="Servitudes (SUP)/AC1 - mesures de classement et d\'inscription et protections des abords des monuments historiques"/>
        <checked-group-node id="PLU/patrimoine naturel et bâti"/>
      </checked-group-nodes>
      <expanded-group-nodes>
        <expanded-group-node id="popup"/>
        <expanded-group-node id="Fond de carte"/>
        <expanded-group-node id="PLU"/>
        <expanded-group-node id="Servitudes (SUP)"/>
        <expanded-group-node id="PSMV"/>
        <expanded-group-node id="listes de valeurs"/>
      </expanded-group-nodes>
    </visibility-preset>
      ';
        $oXml = App\XmlTools::xmlReaderFromString($xmlStr);
        $visibilityPreset = Qgis\ProjectVisibilityPreset::fromXmlReader($oXml);

        $this->assertEquals('Fiche parcelle overview', $visibilityPreset->name);
        $this->assertCount(37, $visibilityPreset->layers);
        $this->assertCount(0, $visibilityPreset->checkedLegendNodes);
        $this->assertCount(10, $visibilityPreset->checkedGroupNodes);
        $this->assertCount(6, $visibilityPreset->expandedGroupNodes);

        $xmlStr = '
    <visibility-preset has-checked-group-info="1" has-expanded-info="1" name="0-Départ">
      <layer expanded="1" id="LIMITE_COMMUNE_FRANCE_d0f17ef9_be2b_4bcc_bcf5_c01797fcd5e9" visible="1" style="défaut"/>
      <expanded-legend-nodes id="LIMITE_COMMUNE_FRANCE_d0f17ef9_be2b_4bcc_bcf5_c01797fcd5e9"/>
      <layer expanded="1" id="CONTOUR_TDPA_9644c143_6c36_4c74_91bd_c02e61820da2" visible="1" style="défaut"/>
      <expanded-legend-nodes id="CONTOUR_TDPA_9644c143_6c36_4c74_91bd_c02e61820da2"/>
      <layer expanded="1" id="LIMITE_COMMUNE_TDPA_378a823f_7dc9_434c_ac7f_e9a77070ca15" visible="1" style="défaut"/>
      <expanded-legend-nodes id="LIMITE_COMMUNE_TDPA_378a823f_7dc9_434c_ac7f_e9a77070ca15"/>
      <layer expanded="0" id="Parcelles_61bafacb_a3f4_4fe7_ab5d_8c98ae59d92c" visible="1" style="0-défaut"/>
      <expanded-legend-nodes id="Parcelles_61bafacb_a3f4_4fe7_ab5d_8c98ae59d92c"/>
      <layer expanded="1" id="Postes_Sources_Enedis_4cbf6f45_278c_49f6_b56f_966f3ebfd212" visible="0" style="défaut"/>
      <expanded-legend-nodes id="Postes_Sources_Enedis_4cbf6f45_278c_49f6_b56f_966f3ebfd212"/>
      <layer expanded="1" id="Postes_Electriques_Enedis_1f302fc7_1996_4b5c_ac36_d94caec386d1" visible="0" style="défaut"/>
      <expanded-legend-nodes id="Postes_Electriques_Enedis_1f302fc7_1996_4b5c_ac36_d94caec386d1"/>
      <layer expanded="1" id="Lignes_souterraines_BT_ef777866_2fe6_4bbd_adf7_2eaa43959d5b" visible="0" style="défaut"/>
      <expanded-legend-nodes id="Lignes_souterraines_BT_ef777866_2fe6_4bbd_adf7_2eaa43959d5b"/>
      <layer expanded="1" id="Lignes_Aériennes_BT_44a2369e_bd3a_4b96_8242_d493b5aa1f71" visible="0" style="défaut"/>
      <expanded-legend-nodes id="Lignes_Aériennes_BT_44a2369e_bd3a_4b96_8242_d493b5aa1f71"/>
      <layer expanded="1" id="Lignes_souterraines_HTA_07549393_8b66_4c2f_91c6_07358f8a2dee" visible="0" style="défaut"/>
      <expanded-legend-nodes id="Lignes_souterraines_HTA_07549393_8b66_4c2f_91c6_07358f8a2dee"/>
      <layer expanded="1" id="Lignes_aériennes_HTA_a81fba9a_cbbd_4a3f_bb7a_e26e0e1009c8" visible="0" style="défaut"/>
      <expanded-legend-nodes id="Lignes_aériennes_HTA_a81fba9a_cbbd_4a3f_bb7a_e26e0e1009c8"/>
      <layer expanded="1" id="POTEAU_ENEDIS_20240905_cf61a8c6_aa09_4433_9c6f_8facc009a4aa" visible="0" style="défaut"/>
      <expanded-legend-nodes id="POTEAU_ENEDIS_20240905_cf61a8c6_aa09_4433_9c6f_8facc009a4aa"/>
      <layer expanded="1" id="Pylones_Rte_au_06_06_2020_2bd84060_b8c7_46b1_a4e4_9f492e2c2d85" visible="0" style="défaut"/>
      <expanded-legend-nodes id="Pylones_Rte_au_06_06_2020_2bd84060_b8c7_46b1_a4e4_9f492e2c2d85"/>
      <layer expanded="1" id="Postes_Electriques_au_06_06_2020_1ec2e310_8249_4d6c_b9df_fbf4556cf2b2" visible="0" style="défaut"/>
      <expanded-legend-nodes id="Postes_Electriques_au_06_06_2020_1ec2e310_8249_4d6c_b9df_fbf4556cf2b2"/>
      <layer expanded="0" id="Lignes_Souterraines_Rte_au_06_06_2020_e8a7e142_f496_43fa_bd9d_cd558f10d3a3" visible="0" style="défaut"/>
      <expanded-legend-nodes id="Lignes_Souterraines_Rte_au_06_06_2020_e8a7e142_f496_43fa_bd9d_cd558f10d3a3"/>
      <layer expanded="0" id="Lignes_Aériennes_Rte_au_06_06_2020_93b016f1_22ac_4625_9142_a80b6fd6a56e" visible="0" style="défaut"/>
      <expanded-legend-nodes id="Lignes_Aériennes_Rte_au_06_06_2020_93b016f1_22ac_4625_9142_a80b6fd6a56e"/>
      <layer expanded="1" id="Enceintes_de_Postes_au_06_06_2020_dc48a2ea_c5f4_472b_8080_d204a61bcd6c" visible="0" style="défaut"/>
      <expanded-legend-nodes id="Enceintes_de_Postes_au_06_06_2020_dc48a2ea_c5f4_472b_8080_d204a61bcd6c"/>
      <layer expanded="1" id="010_AC4_SPR_488e0ead_8ee9_4630_953a_c82cf06ce90f" visible="0" style="défaut"/>
      <expanded-legend-nodes id="010_AC4_SPR_488e0ead_8ee9_4630_953a_c82cf06ce90f"/>
      <layer expanded="0" id="Pr_scription_Surface_1d94a99a_2852_4df8_b066_39a7bf992279" visible="0" style="défaut"/>
      <expanded-legend-nodes id="Pr_scription_Surface_1d94a99a_2852_4df8_b066_39a7bf992279">
        <expanded-legend-node id="{eb20c54d-78cb-4cef-b13b-341c19bde1fe}"/>
      </expanded-legend-nodes>
      <layer expanded="0" id="Plu_Cabannes_du_26_02_2020_2c479ff4_677d_4015_9a89_34f771c163b3" visible="0" style="0-Couleur"/>
      <expanded-legend-nodes id="Plu_Cabannes_du_26_02_2020_2c479ff4_677d_4015_9a89_34f771c163b3"/>
      <layer expanded="1" id="Zones_de_pr_somption_de_prescription_arch_ologique_833ec138_6f18_4292_83f3_e9947abcb8a3" visible="0" style="défaut"/>
      <expanded-legend-nodes id="Zones_de_pr_somption_de_prescription_arch_ologique_833ec138_6f18_4292_83f3_e9947abcb8a3"/>
      <layer expanded="0" id="DUP_ORI_c2607a80_eff0_4e62_b025_d9887bab89bf" visible="0" style="défaut"/>
      <expanded-legend-nodes id="DUP_ORI_c2607a80_eff0_4e62_b025_d9887bab89bf"/>
      <layer expanded="0" id="R_glement_Local_de_Publicit___30_01_2020__fb40dd92_cdbd_4a72_bd99_346280d6b450" visible="0" style="défaut"/>
      <expanded-legend-nodes id="R_glement_Local_de_Publicit___30_01_2020__fb40dd92_cdbd_4a72_bd99_346280d6b450"/>
      <layer expanded="0" id="Information_surfaciques_4bbfa1b6_a92b_4347_b4b9_5137b5580635" visible="0" style="défaut"/>
      <expanded-legend-nodes id="Information_surfaciques_4bbfa1b6_a92b_4347_b4b9_5137b5580635"/>
      <layer expanded="0" id="Pr_scription_a38f261a_fa2b_4265_a2bd_eb31d1abace2" visible="0" style="défaut"/>
      <expanded-legend-nodes id="Pr_scription_a38f261a_fa2b_4265_a2bd_eb31d1abace2"/>
      <layer expanded="0" id="PLU_20e4242b_a0ba_4619_a4a5_bec5d1a60fe8" visible="0" style="Couleur"/>
      <checked-legend-nodes id="PLU_20e4242b_a0ba_4619_a4a5_bec5d1a60fe8">
        <checked-legend-node id="{fba19a6a-89e0-482b-91ed-2d6f31452853}"/>
        <checked-legend-node id="{2cc5bc58-eec9-46f7-bdd4-a20f4c0dd874}"/>
        <checked-legend-node id="{358a00eb-1763-48ee-ab6d-e5b8d6968948}"/>
        <checked-legend-node id="{c58ba333-792a-4b5b-95ca-cf68ed1ac5f7}"/>
        <checked-legend-node id="{27784b8d-b2ba-413c-97de-3fc24f9479d6}"/>
        <checked-legend-node id="{e44a8ccd-8f33-471b-8296-905d03c998e7}"/>
        <checked-legend-node id="{eff5fa05-b931-4e62-bfd3-5d010545de6c}"/>
        <checked-legend-node id="{35bfaadc-c49a-4cf1-9990-09aef5260d27}"/>
        <checked-legend-node id="{c571a7a9-f4e5-4ee6-9f57-cacd2174807f}"/>
        <checked-legend-node id="{4509ce3e-4fd5-4471-93f0-69395af50852}"/>
        <checked-legend-node id="{b5cdf8c5-e1e8-4110-9a75-7cafabc6cbe4}"/>
        <checked-legend-node id="{dc1f775b-62da-4d47-bf4a-f2bc4293595f}"/>
        <checked-legend-node id="{e5f5ccf7-4d91-490c-a7df-164e99c1dfc8}"/>
        <checked-legend-node id="{258bfb19-d0dc-4897-907b-f5329caf47ad}"/>
        <checked-legend-node id="{1f6ac08f-83b1-47cb-aecd-0b9c79655381}"/>
        <checked-legend-node id="{9319e557-79df-429f-a00d-a44ae14a8872}"/>
        <checked-legend-node id="{5a8eddb1-6b19-438a-988b-5ff9d4a3d813}"/>
      </checked-legend-nodes>
      <expanded-legend-nodes id="PLU_20e4242b_a0ba_4619_a4a5_bec5d1a60fe8">
        <expanded-legend-node id="{358a00eb-1763-48ee-ab6d-e5b8d6968948}"/>
        <expanded-legend-node id="{e44a8ccd-8f33-471b-8296-905d03c998e7}"/>
        <expanded-legend-node id="{c571a7a9-f4e5-4ee6-9f57-cacd2174807f}"/>
      </expanded-legend-nodes>
      <layer expanded="0" id="036_PRESCRIPTION_LIN_20230627_06be8ac6_1120_4f67_ab5f_c005d74e7c00" visible="0" style="défaut"/>
      <expanded-legend-nodes id="036_PRESCRIPTION_LIN_20230627_06be8ac6_1120_4f67_ab5f_c005d74e7c00"/>
      <layer expanded="0" id="036_PRESCRIPTION_SURF_20230627_07c2fffa_62a6_4581_8b78_fdeb0724af8f" visible="0" style="défaut"/>
      <expanded-legend-nodes id="036_PRESCRIPTION_SURF_20230627_07c2fffa_62a6_4581_8b78_fdeb0724af8f"/>
      <layer expanded="0" id="036_INFO_SURF_20230627_8bfa25d0_9002_4728_9729_122c31d488d8" visible="0" style="0-VoieBruyante"/>
      <expanded-legend-nodes id="036_INFO_SURF_20230627_8bfa25d0_9002_4728_9729_122c31d488d8"/>
      <layer expanded="0" id="036_ZONE_URBA_20230627_620bd69e_4031_4e1b_9136_c92aa05e0484" visible="0" style="1-Noir"/>
      <expanded-legend-nodes id="036_ZONE_URBA_20230627_620bd69e_4031_4e1b_9136_c92aa05e0484"/>
      <layer expanded="0" id="Pr_scription_Point_dd5a6829_63d9_48d5_9609_53d734ec88ea" visible="0" style="défaut"/>
      <expanded-legend-nodes id="Pr_scription_Point_dd5a6829_63d9_48d5_9609_53d734ec88ea"/>
      <layer expanded="0" id="Pr_scription_Ligne_735d9ff7_c0b8_4590_bfb2_7c72f1b41f48" visible="0" style="défaut"/>
      <expanded-legend-nodes id="Pr_scription_Ligne_735d9ff7_c0b8_4590_bfb2_7c72f1b41f48"/>
      <layer expanded="0" id="Informations_surfaciques_921eb5a7_2cb5_4259_ac09_bea57b47cea2" visible="0" style="défaut"/>
      <expanded-legend-nodes id="Informations_surfaciques_921eb5a7_2cb5_4259_ac09_bea57b47cea2"/>
      <layer expanded="0" id="Pr_scriptions_surfaciques_d582e7f8_896f_428a_9afe_35a3277445ed" visible="0" style="défaut"/>
      <expanded-legend-nodes id="Pr_scriptions_surfaciques_d582e7f8_896f_428a_9afe_35a3277445ed"/>
      <layer expanded="0" id="PLU_Graveson_du_31_05_2018_35369693_cf96_4ed0_b606_e4e64a52c2b1" visible="0" style="Plu Couleur"/>
      <expanded-legend-nodes id="PLU_Graveson_du_31_05_2018_35369693_cf96_4ed0_b606_e4e64a52c2b1"/>
      <layer expanded="0" id="052_INFO_SURF_DPU_a97ab28d_6c14_4c82_b399_e56af0da0be5" visible="0" style="défaut"/>
      <expanded-legend-nodes id="052_INFO_SURF_DPU_a97ab28d_6c14_4c82_b399_e56af0da0be5">
        <expanded-legend-node id="{49e4ec68-03d2-4f90-900d-2ef49192ad2c}"/>
      </expanded-legend-nodes>
      <layer expanded="0" id="052_INFO_SURF_PPRI_aae0615d_14e8_4e36_9ee0_0a02c05267bd" visible="0" style="défaut"/>
      <expanded-legend-nodes id="052_INFO_SURF_PPRI_aae0615d_14e8_4e36_9ee0_0a02c05267bd">
        <expanded-legend-node id="{49e4ec68-03d2-4f90-900d-2ef49192ad2c}"/>
      </expanded-legend-nodes>
      <layer expanded="0" id="052_PRESCRIPTION_LIN_20221020_5c77a347_6ac6_4a43_aa0f_3a271db18732" visible="0" style="défaut"/>
      <expanded-legend-nodes id="052_PRESCRIPTION_LIN_20221020_5c77a347_6ac6_4a43_aa0f_3a271db18732"/>
      <layer expanded="0" id="052_PRESCRIPTION_PCT_20221020_76cb0e99_e334_4891_a2ac_dca2b335e34d" visible="0" style="défaut"/>
      <expanded-legend-nodes id="052_PRESCRIPTION_PCT_20221020_76cb0e99_e334_4891_a2ac_dca2b335e34d"/>
      <layer expanded="0" id="052_PRESCRIPTION_SURF_20221020_dbc4136d_273a_4354_a0a0_5b4b727cf854" visible="0" style="défaut"/>
      <expanded-legend-nodes id="052_PRESCRIPTION_SURF_20221020_dbc4136d_273a_4354_a0a0_5b4b727cf854"/>
      <layer expanded="1" id="052_PLU_ZONE_URBA_20221020_a7f116b4_ad5e_47e9_aa5e_8a4cd745cdc8" visible="0" style="0-NoirBlanc"/>
      <expanded-legend-nodes id="052_PLU_ZONE_URBA_20221020_a7f116b4_ad5e_47e9_aa5e_8a4cd745cdc8"/>
      <layer expanded="0" id="Pr_scriptions_Lin_aires_d4b35b35_28a0_45b6_8c21_e2ea7101c144" visible="0" style="défaut"/>
      <expanded-legend-nodes id="Pr_scriptions_Lin_aires_d4b35b35_28a0_45b6_8c21_e2ea7101c144"/>
      <layer expanded="0" id="Informations_Surfaciques_31bf3350_4bd8_4198_8536_a1a34366bc31" visible="0" style="défaut"/>
      <expanded-legend-nodes id="Informations_Surfaciques_31bf3350_4bd8_4198_8536_a1a34366bc31"/>
      <layer expanded="0" id="Pr_scriptions_Surfaciques_4fa108c3_583b_46dd_a9a4_d7da21be9835" visible="0" style="défaut"/>
      <expanded-legend-nodes id="Pr_scriptions_Surfaciques_4fa108c3_583b_46dd_a9a4_d7da21be9835"/>
      <layer expanded="0" id="PLU_Noves_3_7_2024_23cfc6e4_504f_4d0e_9051_553de8bce51c" visible="0" style="0-couleur"/>
      <expanded-legend-nodes id="PLU_Noves_3_7_2024_23cfc6e4_504f_4d0e_9051_553de8bce51c"/>
      <layer expanded="0" id="Pr_scription_Ligne_PLU_eb3272a7_7468_452b_b44b_78d6a137fd9a" visible="0" style="défaut"/>
      <expanded-legend-nodes id="Pr_scription_Ligne_PLU_eb3272a7_7468_452b_b44b_78d6a137fd9a"/>
      <layer expanded="0" id="076_INFO_SURF_20211129_4554bac5_b055_464b_b918_fa1d43bb8cd2" visible="0" style="défaut"/>
      <expanded-legend-nodes id="076_INFO_SURF_20211129_4554bac5_b055_464b_b918_fa1d43bb8cd2"/>
      <layer expanded="0" id="Pr_scription_surface_PLU_54de6c0a_95cc_4879_b615_2e6362b95c8b" visible="0" style="défaut"/>
      <expanded-legend-nodes id="Pr_scription_surface_PLU_54de6c0a_95cc_4879_b615_2e6362b95c8b"/>
      <layer expanded="0" id="PLU_Plan_d_orgon_29_11_2021_5d1dd8c4_64ef_4685_a67e_2d5cdf1f0496" visible="0" style="0-Couleur"/>
      <expanded-legend-nodes id="PLU_Plan_d_orgon_29_11_2021_5d1dd8c4_64ef_4685_a67e_2d5cdf1f0496"/>
      <layer expanded="1" id="083_INFO_SURF_20230906_0adddf76_bd49_45cf_9aa9_81f138312ef5" visible="0" style="défaut"/>
      <expanded-legend-nodes id="083_INFO_SURF_20230906_0adddf76_bd49_45cf_9aa9_81f138312ef5"/>
      <layer expanded="0" id="Pr_scrition_Surfacique_b5f6fc30_fdc1_4659_a933_d2de103fa3a3" visible="0" style="défaut"/>
      <expanded-legend-nodes id="Pr_scrition_Surfacique_b5f6fc30_fdc1_4659_a933_d2de103fa3a3"/>
      <layer expanded="1" id="Pr_scription_point_b72f295b_795c_49ce_a318_b8dd6bd607e8" visible="0" style="défaut"/>
      <expanded-legend-nodes id="Pr_scription_point_b72f295b_795c_49ce_a318_b8dd6bd607e8"/>
      <layer expanded="0" id="Pr_scription_Lin_aire_66906e42_3fce_49d5_ad50_d57d7fb34b3e" visible="0" style="défaut"/>
      <expanded-legend-nodes id="Pr_scription_Lin_aire_66906e42_3fce_49d5_ad50_d57d7fb34b3e"/>
      <layer expanded="0" id="PLU_Rognonas_06_09_2023_fe900cf2_785b_4e23_9613_45d7c55e88d2" visible="0" style="Couleur"/>
      <expanded-legend-nodes id="PLU_Rognonas_06_09_2023_fe900cf2_785b_4e23_9613_45d7c55e88d2">
        <expanded-legend-node id="{358a00eb-1763-48ee-ab6d-e5b8d6968948}"/>
        <expanded-legend-node id="{e44a8ccd-8f33-471b-8296-905d03c998e7}"/>
        <expanded-legend-node id="{c571a7a9-f4e5-4ee6-9f57-cacd2174807f}"/>
      </expanded-legend-nodes>
      <layer expanded="0" id="089_PRESCRIPTION_PCT_20170209_15d9f599_4c40_4b66_8cc5_66adb92fb1f6" visible="0" style="défaut"/>
      <expanded-legend-nodes id="089_PRESCRIPTION_PCT_20170209_15d9f599_4c40_4b66_8cc5_66adb92fb1f6"/>
      <layer expanded="0" id="089_PRESCRIPTION_SURF_20170209_ba124aae_0928_4f4b_8c82_47b42302e6e5" visible="0" style="défaut"/>
      <expanded-legend-nodes id="089_PRESCRIPTION_SURF_20170209_ba124aae_0928_4f4b_8c82_47b42302e6e5"/>
      <layer expanded="0" id="089_PRESCRIPTION_LIN_20170209_d34b53d9_7972_4ef4_bac9_f86f4b098fd2" visible="0" style="défaut"/>
      <expanded-legend-nodes id="089_PRESCRIPTION_LIN_20170209_d34b53d9_7972_4ef4_bac9_f86f4b098fd2"/>
      <layer expanded="0" id="PLU_Saint_Andiol_09_02_2017_c73024d4_8a91_40f4_ae0c_15c97d9d6d05" visible="0" style="0-Couleur"/>
      <checked-legend-nodes id="PLU_Saint_Andiol_09_02_2017_c73024d4_8a91_40f4_ae0c_15c97d9d6d05">
        <checked-legend-node id="3"/>
        <checked-legend-node id="5"/>
        <checked-legend-node id="1"/>
        <checked-legend-node id="4"/>
        <checked-legend-node id="0"/>
        <checked-legend-node id="6"/>
        <checked-legend-node id="2"/>
      </checked-legend-nodes>
      <expanded-legend-nodes id="PLU_Saint_Andiol_09_02_2017_c73024d4_8a91_40f4_ae0c_15c97d9d6d05"/>
      <layer expanded="0" id="116_INFO_SURF_20240301_7c9973ea_10ce_4a81_a518_8329c98b3e23" visible="0" style="défaut"/>
      <expanded-legend-nodes id="116_INFO_SURF_20240301_7c9973ea_10ce_4a81_a518_8329c98b3e23"/>
      <layer expanded="0" id="116_PRESCRIPTION_PCT_20230627_b08a45a2_ba1a_4e18_8b22_868b694698c8" visible="0" style="défaut"/>
      <expanded-legend-nodes id="116_PRESCRIPTION_PCT_20230627_b08a45a2_ba1a_4e18_8b22_868b694698c8"/>
      <layer expanded="0" id="116_PRESCRIPTION_SURF_20230627_f30fcbe1_567a_49d8_aab1_49dbbc887b48" visible="0" style="défaut"/>
      <expanded-legend-nodes id="116_PRESCRIPTION_SURF_20230627_f30fcbe1_567a_49d8_aab1_49dbbc887b48"/>
      <layer expanded="0" id="116_ZONE_URBA_20230627_d17f0f77_cccc_440b_8fc6_46654b966f87" visible="0" style="1-Noir"/>
      <expanded-legend-nodes id="116_ZONE_URBA_20230627_d17f0f77_cccc_440b_8fc6_46654b966f87"/>
      <layer expanded="0" id="ZAE_ZONE_ACTIVITE_2a747cea_d779_47c2_8d72_267ab7251f9d" visible="1" style="défaut"/>
      <expanded-legend-nodes id="ZAE_ZONE_ACTIVITE_2a747cea_d779_47c2_8d72_267ab7251f9d"/>
      <layer expanded="0" id="voie_afef52c3_bb3b_4b6f_8ae0_d8257927ac48" visible="0" style="défaut"/>
      <checked-legend-nodes id="voie_afef52c3_bb3b_4b6f_8ae0_d8257927ac48">
        <checked-legend-node id="{f6ab93a8-27d8-45e5-9762-5c2db7d6d298}"/>
        <checked-legend-node id="{5e8b084a-2bb4-4cbe-bb54-49ee3cff8a3f}"/>
        <checked-legend-node id="{c5fc884f-ddfe-43fc-8123-3acf4a83e900}"/>
        <checked-legend-node id="{8586318d-740e-4a5b-bf8f-b1bf989fb326}"/>
        <checked-legend-node id="{d927cad1-e85a-43cf-a633-7a71746fa063}"/>
        <checked-legend-node id="{ff69612c-8431-4e81-a62c-590e50b305ba}"/>
        <checked-legend-node id="{30b077d5-86c0-4c3d-b01a-2ade3010257d}"/>
        <checked-legend-node id="{cb526c6d-9979-4845-aa6d-c18dab770d00}"/>
        <checked-legend-node id="{49be8974-5696-4a01-8784-0d2be904207b}"/>
        <checked-legend-node id="{c3e91618-6dec-4b0b-8c2b-7f821c5fa491}"/>
        <checked-legend-node id="{5512e744-fc83-4360-8ae3-58eb01a5e2c4}"/>
        <checked-legend-node id="{75ca2b43-5c5e-4ff7-867d-0b16e1f67ebf}"/>
        <checked-legend-node id="{637c5187-3338-4de6-bacf-e79a2fbf5076}"/>
        <checked-legend-node id="{16e06396-54ff-4acd-ae99-dbdeaf49bbb5}"/>
        <checked-legend-node id="{523a87c4-6130-45d6-804c-f2ec48771079}"/>
        <checked-legend-node id="{f150e092-9776-4fa2-ada0-921e06e1e3d1}"/>
        <checked-legend-node id="{4d4e8e31-57cd-439b-baef-878b99c1b4a2}"/>
        <checked-legend-node id="{728051c7-f248-41d0-8b41-0ef8bab7c2e5}"/>
        <checked-legend-node id="{638e2c50-1b91-4f67-b0b6-60a7e0b774ad}"/>
        <checked-legend-node id="{96415fde-1b0c-4e0d-9dea-a5df669058f7}"/>
        <checked-legend-node id="{2812d442-7136-4365-b57e-3db7f400c09e}"/>
        <checked-legend-node id="{e0fb5783-8768-4a5b-80b6-12476b1fb216}"/>
        <checked-legend-node id="{d949bb31-c17f-49fa-80b3-3116d16a8243}"/>
        <checked-legend-node id="{3f8e97a1-ec38-446d-a2b8-4385467d1ef8}"/>
      </checked-legend-nodes>
      <expanded-legend-nodes id="voie_afef52c3_bb3b_4b6f_8ae0_d8257927ac48"/>
      <layer expanded="1" id="Parcelles_ccec544b_598c_48ec_99b4_daf469cf0127" visible="1" style="défaut"/>
      <expanded-legend-nodes id="Parcelles_ccec544b_598c_48ec_99b4_daf469cf0127"/>
      <layer expanded="0" id="Communes_b117633d_43bc_42e9_a4e9_940dd02a2cec" visible="1" style="défaut"/>
      <expanded-legend-nodes id="Communes_b117633d_43bc_42e9_a4e9_940dd02a2cec"/>
      <layer expanded="0" id="Bâti_0f134d74_21a1_4f87_9604_7450cc4d920e" visible="1" style="défaut"/>
      <expanded-legend-nodes id="Bâti_0f134d74_21a1_4f87_9604_7450cc4d920e"/>
      <layer expanded="0" id="Parcelles_877182fb_cb74_4f94_aebc_d32512503e18" visible="1" style="0-défaut"/>
      <expanded-legend-nodes id="Parcelles_877182fb_cb74_4f94_aebc_d32512503e18"/>
      <layer expanded="0" id="Cours_d_eau_ba81a829_f2f6_469e_98c9_bf10aeb2384d" visible="1" style="défaut"/>
      <expanded-legend-nodes id="Cours_d_eau_ba81a829_f2f6_469e_98c9_bf10aeb2384d"/>
      <layer expanded="0" id="Surfaces_585ce3ee_1f9f_43bd_84c6_0d340d2b67a5" visible="1" style="défaut"/>
      <expanded-legend-nodes id="Surfaces_585ce3ee_1f9f_43bd_84c6_0d340d2b67a5"/>
      <layer expanded="0" id="Subdivisions_fiscales_7600d013_24cb_4b5c_8c32_1ccca787b3cc" visible="1" style="défaut"/>
      <expanded-legend-nodes id="Subdivisions_fiscales_7600d013_24cb_4b5c_8c32_1ccca787b3cc"/>
      <layer expanded="0" id="Numéros_de_voie_97412aec_636b_4241_ac89_b5f167de79dc" visible="1" style="défaut"/>
      <expanded-legend-nodes id="Numéros_de_voie_97412aec_636b_4241_ac89_b5f167de79dc"/>
      <layer expanded="0" id="Cours_d_eau__étiquettes__66bcba62_8754_4cc0_957e_b344df84ad46" visible="1" style="défaut"/>
      <expanded-legend-nodes id="Cours_d_eau__étiquettes__66bcba62_8754_4cc0_957e_b344df84ad46"/>
      <layer expanded="0" id="Parcelles__étiquettes__3b8adeeb_c113_4cf1_a84b_969e8feabfc2" visible="1" style="défaut"/>
      <expanded-legend-nodes id="Parcelles__étiquettes__3b8adeeb_c113_4cf1_a84b_969e8feabfc2"/>
      <layer expanded="0" id="Subdivisions_fiscales__étiquette__2230efe1_8ed1_45b7_a294_a9823e467802" visible="1" style="défaut"/>
      <expanded-legend-nodes id="Subdivisions_fiscales__étiquette__2230efe1_8ed1_45b7_a294_a9823e467802"/>
      <layer expanded="0" id="Noms_de_voies_d62898e0_b0a6_4c4e_877b_9feea6c434f5" visible="1" style="défaut"/>
      <expanded-legend-nodes id="Noms_de_voies_d62898e0_b0a6_4c4e_877b_9feea6c434f5"/>
      <layer expanded="0" id="Murs__fossés__clotûres_8f9deef4_7f3d_4b52_a135_29db05006329" visible="1" style="défaut"/>
      <expanded-legend-nodes id="Murs__fossés__clotûres_8f9deef4_7f3d_4b52_a135_29db05006329"/>
      <layer expanded="1" id="OpenStreetMap_eb2548f8_68ba_49e5_b11e_bd1d482622f0" visible="0" style="défaut"/>
      <expanded-legend-nodes id="OpenStreetMap_eb2548f8_68ba_49e5_b11e_bd1d482622f0"/>
      <layer expanded="1" id="parcelle_info_plu_5ec940e0_a405_4130_a0a3_e544b4a14107" visible="0" style="défaut"/>
      <expanded-legend-nodes id="parcelle_info_plu_5ec940e0_a405_4130_a0a3_e544b4a14107"/>
      <layer expanded="1" id="CONFIG_CHAM_90be8aab_c376_4305_99fc_9912511d7725" visible="0" style="défaut"/>
      <expanded-legend-nodes id="CONFIG_CHAM_90be8aab_c376_4305_99fc_9912511d7725"/>
      <layer expanded="1" id="HIST_VOIE_ADR_949e35e1_4cb8_4a39_904b_4315ad6d7beb" visible="0" style="défaut"/>
      <expanded-legend-nodes id="HIST_VOIE_ADR_949e35e1_4cb8_4a39_904b_4315ad6d7beb"/>
      <layer expanded="1" id="Communes_32a91df6_a5a9_44f2_aa1a_a8b0fa555177" visible="1" style="défaut"/>
      <expanded-legend-nodes id="Communes_32a91df6_a5a9_44f2_aa1a_a8b0fa555177"/>
      <checked-group-nodes>
        <checked-group-node id="Cadastre"/>
        <checked-group-node id="Cadastre/FondCadastre"/>
        <checked-group-node id="Cadastre/FondCadastre/Données cadastre"/>
        <checked-group-node id="Overview"/>
        <checked-group-node id="Réglement d\'Urbanisme"/>
        <checked-group-node id="Cadastre/FondCadastre/Étiquettes cadastre"/>
      </checked-group-nodes>
      <expanded-group-nodes>
        <expanded-group-node id="Réseau humide/Pluvial"/>
        <expanded-group-node id="Réseau sec/Enedis au 05/09/2024"/>
        <expanded-group-node id="Cadastre/FondCadastre/Données cadastre"/>
        <expanded-group-node id="baselayers/project-background-color"/>
        <expanded-group-node id="Réseau sec/Rte au 10/06/2024"/>
        <expanded-group-node id="Cadastre/FondCadastre/Étiquettes cadastre"/>
        <expanded-group-node id="Réseau humide/Adduction Eau Potable"/>
      </expanded-group-nodes>
    </visibility-preset>
      ';
        $oXml = App\XmlTools::xmlReaderFromString($xmlStr);
        $visibilityPreset = Qgis\ProjectVisibilityPreset::fromXmlReader($oXml);

        $this->assertEquals('0-Départ', $visibilityPreset->name);
        $this->assertCount(81, $visibilityPreset->layers);
        $this->assertCount(3, $visibilityPreset->checkedLegendNodes);
        $this->assertCount(6, $visibilityPreset->checkedGroupNodes);
        $this->assertCount(7, $visibilityPreset->expandedGroupNodes);

        $this->assertCount(17, $visibilityPreset->checkedLegendNodes['PLU_20e4242b_a0ba_4619_a4a5_bec5d1a60fe8']);
        $this->assertCount(7, $visibilityPreset->checkedLegendNodes['PLU_Saint_Andiol_09_02_2017_c73024d4_8a91_40f4_ae0c_15c97d9d6d05']);
        $this->assertCount(24, $visibilityPreset->checkedLegendNodes['voie_afef52c3_bb3b_4b6f_8ae0_d8257927ac48']);
    }
}
