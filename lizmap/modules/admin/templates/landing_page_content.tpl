  {ifacl2 'lizmap.admin.access'}
  <!--Services-->
  <div>
    <h2>{@admin.menu.lizmap.landingPageContent.label@}</h2>

    {form $form, 'admin~landing_page_content:save'}
        {formcontrols}
            <p> {ctrl_control} </p>
        {/formcontrols}
        <div> {formsubmit} </div>
    {/form}

  </div>
  {/ifacl2}

