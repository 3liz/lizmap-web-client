  {ifacl2 'lizmap.admin.home.page.update'}

  <div>
    <h2>{@admin.menu.lizmap.landingPageContent.label@}</h2>

    {form $form, 'admin~landing_page_content:save' , array(),  'htmlbootstrap'}
        {formcontrols}
            <h3>{ctrl_label}</h3>
            <div> {ctrl_control} </div>
        {/formcontrols}
        <div> <br/> {formsubmit} </div>
    {/form}

  </div>
  {/ifacl2}
