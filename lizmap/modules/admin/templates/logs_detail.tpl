  <div>
    <h2>{@admin~admin.logs.detail.title@}</h2>

     <div class="accordion" id="accordion2">
       <div class="accordion-group">
         <div class="accordion-heading">
           <a class="accordion-toggle" data-toggle="collapse" data-parent="#accordion2" href="#collapse1">{@admin~admin.logs.view.graphic.key@}</a>
         </div>
         <div id="collapse1" class="accordion-body collapse">
           <div class="accordion-inner">
                 <div class="form-actions">
                 <a class="btn" href="/graph/estatis_ldkt.php" target="_blank">{@admin~admin.logs.view.graphic@}</a>
                 <iframe style="width: 100%; height: 60vh; border: 0;" src="/graph/estatis_ldkt.php">
                 </iframe>
                 </div>
           </div>
         </div>
       </div>

       <div class="accordion-group">
         <div class="accordion-heading">
           <a class="accordion-toggle" data-toggle="collapse" data-parent="#accordion2" href="#collapse2">{@admin~admin.logs.view.graphic.user@}</a>
         </div>
         <div id="collapse2" class="accordion-body collapse">
           <div class="accordion-inner">
                 <div class="form-actions">
                 <a class="btn" href="/graph/estatis_ldut.php" target="_blank">{@admin~admin.logs.view.graphic@}</a>
                 <iframe style="width: 100%; height: 60vh; border: 0;" src="/graph/estatis_ldut.php">
                 </iframe>
                 </div>
           </div>
         </div>
       </div>

       <div class="accordion-group">
         <div class="accordion-heading">
           <a class="accordion-toggle" data-toggle="collapse" data-parent="#accordion2" href="#collapse3">{@admin~admin.logs.view.graphic.project@}</a>
         </div>
         <div id="collapse3" class="accordion-body collapse">
           <div class="accordion-inner">
                 <div class="form-actions">
                 <a class="btn" href="/graph/estatis_ldpt.php" target="_blank">{@admin~admin.logs.view.graphic@}</a>
                 <iframe style="width: 100%; height: 60vh; border: 0;" src="/graph/estatis_ldpt.php">
                 </iframe>
                 </div>
           </div>
         </div>
       </div>

       <div class="accordion-group">
         <div class="accordion-heading">
           <a class="accordion-toggle" data-toggle="collapse" data-parent="#accordion2" href="#collapse4">{@admin~admin.logs.view.graphic.repository@}</a>
         </div>
         <div id="collapse4" class="accordion-body collapse">
           <div class="accordion-inner">
                 <div class="form-actions">
                 <a class="btn" href="/graph/estatis_ldrt.php" target="_blank">{@admin~admin.logs.view.graphic@}</a>
                 <iframe style="width: 100%; height: 60vh; border: 0;" src="/graph/estatis_ldrt.php">
                 </iframe>
                 </div>
           </div>
         </div>
       </div>

       <div class="accordion-group">
         <div class="accordion-heading">
           <a class="accordion-toggle" data-toggle="collapse" data-parent="#accordion2" href="#collapse5">{@admin~admin.logs.view.graphic.project.user@}</a>
         </div>
         <div id="collapse5" class="accordion-body collapse">
           <div class="accordion-inner">
                 <div class="form-actions">
                 <a class="btn" href="/graph/estatis_ldkurpt.php" target="_blank">{@admin~admin.logs.view.graphic@}</a>
                 <iframe style="width: 100%; height: 60vh; border: 0;" src="/graph/estatis_ldkurpt.php">
                 </iframe>
                 </div>
           </div>
         </div>
       </div>

     </div>

    <table class="table table-bordered table-striped">
      <thead>
        <tr>
          <th>{@admin~admin.logs.key@}</th>
          <th>{@admin~admin.logs.timestamp@}</th>
          <th>{@admin~admin.logs.user@}</th>
          <th>{@admin~admin.logs.content@}</th>
          <th>{@admin~admin.logs.repository@}</th>
          <th>{@admin~admin.logs.project@}</th>
          <th>{@admin~admin.logs.ip@}</th>
        </tr>
      </thead>
      <tbody>
        {foreach $detail as $item}
        <tr>
          <td>{$item->key}</td>
          <td>{$item->timestamp|jdatetime:'db_datetime','lang_datetime'}</td>
          <td>{$item->user}</td>
          <td>{$item->content}</td>
          <td>{$item->repository}</td>
          <td>{$item->project}</td>
          <td>{$item->ip}</td>
        </tr>
        {/foreach}
      </tbody>
    </table>
    
  </div>
  
  <div class="pagination">
    <ul>
      <li><a href="{jurl 'admin~logs:detail', array('page'=>1)}">{@admin~admin.logs.first_page@}</a></li>
      <li><a href="{jurl 'admin~logs:detail', array('page'=>$page-1)}">{@admin~admin.logs.previous_page@}</a></li>
      <li><a href="{jurl 'admin~logs:detail', array('page'=>$page+1)}">{@admin~admin.logs.next_page@}</a></li>
    </ul>
  </div>  
  
  <div class="form-actions">
    <a class="btn" href="{jurl 'admin~logs:index'}">{@admin~admin.configuration.button.back.label@}</a>
  </div>  

