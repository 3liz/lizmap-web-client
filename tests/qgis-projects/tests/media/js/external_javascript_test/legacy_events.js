/**
 * Listen to the legacy lizMap events from an external JavaScript script.
 *
 * Each received event is added as a span in the #external-js-legacy-events panel,
 * so that the end-to-end tests can check that the legacy events are still triggered
 * and that listening to them does not break the Lizmap application initialization.
 */

const legacyEventsPanel = document.createElement('div');
legacyEventsPanel.id = 'external-js-legacy-events';
legacyEventsPanel.style.display = 'none';
document.body.append(legacyEventsPanel);

/**
 * Add the received event name to the panel.
 * @param {string} eventName - The legacy event name
 */
function addLegacyEventToPanel(eventName) {
    const span = document.createElement('span');
    span.dataset.event = eventName;
    span.innerText = eventName;
    legacyEventsPanel.append(span);
}

// Listen to the legacy events triggered during the Lizmap application startup
lizMap.events.on({
    configsloaded: () => addLegacyEventToPanel('configsloaded'),
    mapcreated: () => addLegacyEventToPanel('mapcreated'),
    layersadded: () => addLegacyEventToPanel('layersadded'),
    toolbarcreated: () => addLegacyEventToPanel('toolbarcreated'),
    uicreated: () => addLegacyEventToPanel('uicreated'),
});
