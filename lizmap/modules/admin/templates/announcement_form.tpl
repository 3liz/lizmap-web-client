
<h1>{if $id}{@admin~admin.announcement.edit.title@}{else}{@admin~admin.announcement.create.title@}{/if}</h1>

<div class="container">
    <form method="post" action="{jurl 'admin~announcement:save'}">
        <input type="hidden" name="id" value="{$id}" />

        <div class="mb-3">
            <label for="title" class="form-label">{@admin~admin.announcement.form.title@}</label>
            <input type="text" class="form-control" id="title" name="title" value="{$title}" required maxlength="255" />
        </div>

        <div class="mb-3">
            <label for="content" class="form-label">{@admin~admin.announcement.form.content@}</label>
            <textarea class="form-control" id="content" name="content" rows="6" required>{$content}</textarea>
            <div class="form-text">{@admin~admin.announcement.form.content.help@}</div>
        </div>

        <div class="mb-3">
            <label for="target_repository" class="form-label">{@admin~admin.announcement.form.repository@}</label>
            <select class="form-select" id="target_repository" name="target_repository">
                <option value="">{@admin~admin.announcement.form.all@}</option>
                {foreach $repositories as $repo}
                <option value="{$repo}" {if $target_repository == $repo}selected{/if}>{$repo}</option>
                {/foreach}
            </select>
            <div class="form-text">{@admin~admin.announcement.form.repository.help@}</div>
        </div>

        <div class="mb-3">
            <label for="target_project" class="form-label">{@admin~admin.announcement.form.project@}</label>
            <input type="text" class="form-control" id="target_project" name="target_project" value="{$target_project}" />
            <div class="form-text">{@admin~admin.announcement.form.project.help@}</div>
        </div>

        <div class="mb-3">
            <label for="target_groups" class="form-label">{@admin~admin.announcement.form.groups@}</label>
            <select class="form-select" id="target_groups" name="target_groups[]" multiple size="5">
                {foreach $groups as $group}
                {if $group->grouptype != 2}
                <option value="{$group->id_aclgrp}" {if in_array($group->id_aclgrp, $selectedGroupsArray)}selected{/if}>{$group->name}</option>
                {/if}
                {/foreach}
            </select>
            <div class="form-text">{@admin~admin.announcement.form.groups.help@}</div>
        </div>

        <div class="mb-3">
            <label for="max_display_count" class="form-label">{@admin~admin.announcement.form.maxviews@}</label>
            <input type="number" class="form-control" id="max_display_count" name="max_display_count" value="{$max_display_count}" min="0" />
            <div class="form-text">{@admin~admin.announcement.form.maxviews.help@}</div>
        </div>

        <div class="mb-3 form-check">
            <input type="checkbox" class="form-check-input" id="is_active" name="is_active" value="1" {if $is_active}checked{/if} />
            <label class="form-check-label" for="is_active">{@admin~admin.announcement.form.active@}</label>
        </div>

        <div class="form-actions">
            <button type="submit" class="btn btn-primary">{@admin~admin.announcement.btn.save@}</button>
            <a class="btn btn-secondary" href="{jurl 'admin~announcement:index'}">{@admin~admin.configuration.button.back.label@}</a>
        </div>
    </form>
</div>
