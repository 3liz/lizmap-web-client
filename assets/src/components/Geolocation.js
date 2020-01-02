import { mainLizmap } from '../modules/Globals.js';

import { library, findIconDefinition, icon } from '@fortawesome/fontawesome-svg-core';
import { faDotCircle } from '@fortawesome/free-regular-svg-icons';
library.add(faDotCircle);

export default class Geolocation extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        const geolocationButton = document.createElement('button');
        geolocationButton.style = 'margin-left: -15px;';

        // Set icon
        const iconDef = findIconDefinition({ prefix: 'far', iconName: 'dot-circle' });
        const i = icon(iconDef, {
            transform: {
                size: 25
            }
        });
        
        // Listen click event
        geolocationButton.addEventListener('click', () => {
            mainLizmap.geolocation.toggleGeolocation();
        });

        geolocationButton.appendChild(i.node[0]);

        this.appendChild(geolocationButton);

    }

    disconnectedCallback() {

    }

}
