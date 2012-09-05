<?xml version="1.0" encoding="UTF-8"?>
<dao xmlns="http://jelix.org/ns/dao/1.0">
    <datasources>
        <primarytable name="%%table%%" realname="%%table%%" primarykey="%%primarykeys%%" />
    </datasources>
    <record>%%properties%%
        <!--<property name="" fieldname="" datatype="string/int/float/date"
        required="yes" maxlength="" minlength="" regexp="" sequence=""
        updatepattern="" insertpattern="" selectpattern=""/>-->
    </record>
    <factory>
        <!--<method name="findByStage" type="select/selectfirst/delete/update/php">
            <parameter name="" />
            <values>
                <value property="" value="" />
            </values>
            <conditions logic="and/or">
                <eq property="" value="" />
            </conditions>
            <order>
                <orderitem property="" way="asc/desc" />
            </order>
            <limit offset="" count=""/>
            <body><![CDATA[
            ]]></body>
        </method>-->
    </factory>
</dao>
