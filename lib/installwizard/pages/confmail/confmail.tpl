
{if count($errors)}
<ul class="jelix-msg">
  {foreach $errors as $err}<li class="jelix-msg-item-error">{$err|eschtml}</li>{/foreach}
</ul>
{/if}

<script type="text/javascript">
{literal}
function mailerTypeChanged(select) {
    var etype = select.options[select.selectedIndex].value;
    var mail = document.getElementById('mail');
    var sendmail = document.getElementById('sendmail');
    var smtp = document.getElementById('smtp');

    mail.style.display = (etype=='mail'?'block':'none');
    sendmail.style.display = (etype=='sendmail'?'block':'none');
    smtp.style.display = (etype=='smtp'?'block':'none');
}

function toggleAuth(checkbox) {
    if (checkbox.checked) {
        document.getElementById('smtpUsername').removeAttribute("disabled");
        document.getElementById('smtpPassword').removeAttribute("disabled");
    }
    else {
        document.getElementById('smtpUsername').setAttribute("disabled", "disabled");
        document.getElementById('smtpPassword').setAttribute("disabled", "disabled");
    }
}

{/literal}
</script>



<fieldset>
    <legend>{@title.webmaster@}</legend>
    <p>{@description.webmaster@}</p>
    <table>
        <tr>
            <th><label for="webmasterEmail">{@label.webmasterEmail@}</label><span class="required">*</span></th>
            <td><input id="webmasterEmail" name="webmasterEmail" value="{$webmasterEmail|eschtml}"/></td>
        </tr>
        <tr>
            <th><label for="webmasterName">{@label.webmasterName@}</label><span class="required">*</span></th>
            <td><input id="webmasterName" name="webmasterName" value="{$webmasterName|eschtml}"/></td>
        </tr>
    </table>


</fieldset>

<fieldset>
    <legend>{@title.server@}</legend>

    <div>
        <label for="mailerType">{@label.mailerType@}</label>
        <select id="mailerType" name="mailerType" onchange="mailerTypeChanged(this)">
            <option value="mail" {if $mailerType == 'mail'}selected="selected"{/if}>PHP mail()</option>
            <option value="sendmail" {if $mailerType == 'sendmail'}selected="selected"{/if}>Sendmail</option>
            <option value="smtp" {if $mailerType == 'smtp'}selected="selected"{/if}>Smtp server</option>
          </select>
    </div>

    <div id="mail" {if $mailerType != 'mail'} style="display:none"{/if}>

    </div>

    <div id="sendmail" {if $mailerType != 'sendmail'} style="display:none"{/if}>
    <table>
        </tr>
        <tr>
            <th><label for="sendmailPath">{@label.sendmailPath@}</label><span class="required">*</span></th>
            <td><input id="sendmailPath" name="sendmailPath" value="{$sendmailPath|eschtml}"/></td>
        </tr>
    </table>
    </div>


    <div id="smtp" {if $mailerType != 'smtp'} style="display:none"{/if}>
    <table>
        <tr>
            <th><label for="smtpHost">{@label.smtpHost@}</label><span class="required">*</span></th>
            <td><input id="smtpHost" name="smtpHost" value="{$smtpHost|eschtml}"/></td>
        </tr>
        <tr>
            <th><label for="smtpPort">{@label.smtpPort@}</label></th>
            <td><input id="smtpPort" name="smtpPort" value="{$smtpPort|eschtml}"/></td>
        </tr>
        <tr>
            <th>{@label.smtpSecure@}</th>
            <td>
                <input type="radio" id="smtpSecureNone" name="smtpSecure" value="" {if $smtpSecure != 'ssl' && $smtpSecure !='tls'}checked="checked"{/if}/><label for="smtpSecureNone">{@label.smtpSecure.none@}</label>
                <input type="radio" id="smtpSecureSsl" name="smtpSecure" value="ssl" {if $smtpSecure == 'ssl'}checked="checked"{/if}/><label for="smtpSecureSsl">{@label.smtpSecure.ssl@}</label>
                <input type="radio" id="smtpSecureTls" name="smtpSecure" value="tls" {if $smtpSecure =='tls'}checked="checked"{/if}/><label for="smtpSecureTls">{@label.smtpSecure.tls@}</label>
            </td>
        </tr>
        <tr>
            <th><label for="smtpAuth">{@label.smtpAuth@}</label></th>
            <td><input id="smtpAuth" name="smtpAuth" {if $smtpAuth} checked="checked" {/if} type="checkbox" onclick="toggleAuth(this)"/></td>
        </tr>
        <tr>
            <th><label for="smtpUsername">{@label.smtpUsername@}</label></th>
            <td><input id="smtpUsername" name="smtpUsername" value="{$smtpUsername|eschtml}" {if !$smtpAuth} disabled="disabled" {/if}/></td>
        </tr>
        <tr>
            <th><label for="smtpPassword">{@label.smtpPassword@}</label></th>
            <td><input id="smtpPassword" name="smtpPassword" value="{$smtpPassword|eschtml}" {if !$smtpAuth} disabled="disabled" {/if}/></td>
        </tr>
    </table>
    </div>


</fieldset>