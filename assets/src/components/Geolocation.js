import { mainLizmap, mainEventDispatcher } from '../modules/Globals.js';
import { html, render } from 'lit-html';

export default class Geolocation extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        // Listen click event
        document.querySelectorAll('#button-geolocation')[0].addEventListener('click', () => {
            mainLizmap.geolocation.toggleGeolocation();
        });

        // Display
        const myTemplate = () => html`
        <div class="menu-content">
            <div class="button-bar">
            <button id="geolocation-center" class="btn btn-small btn-primary" disabled="disabled"><span class="icon"></span></button>
            <button id="geolocation-bind" class="btn btn-small btn-primary" disabled="disabled"><span class="icon"></span></button>
            <button id="geolocation-stop" class="btn btn-small btn-primary" disabled="disabled"><span class="icon"></span></button>
            </div>
            <div id="geolocation-edition-group" style="display:none; margin-top:5px;">
                <table>
                    <tr>
                        <td style="vertical-align: top;">
                            <span id="geolocation-edition-title" style="font-weight:bold"></span>
                        </td>
                        <td>
                            <label id="geolocation-edition-linked-label" class="checkbox"><input id="geolocation-edition-linked" type="checkbox" value="1" disabled="disabled"></label>
                            <button id="geolocation-edition-add" class="btn btn-small btn-primary" disabled="disabled"><span class="icon"></span></button>
                            <button id="geolocation-edition-submit" class="btn btn-small btn-primary" disabled="disabled"><span class="icon"></span></button>
                        </td>
                    </tr>
                </table>
            </div>
        </div>`;

        render(myTemplate(), this);

        // mainEventDispatcher.addListener(
        //     (event) => {
        //         if (event.isTracking){
        //             document.querySelectorAll('#mini-dock-content .tab-pane').forEach(function (tab) {
        //                 tab.classList.remove('active');
        //             });
        //             document.querySelectorAll('#mini-dock-content #geolocation')[0].classList.add('active');
        //         }else{
        //             document.querySelectorAll('#mini-dock-content #geolocation')[0].classList.remove('active');
        //         }

        //     },
        //     { type: 'geolocation.isTracking'}
        // );

    }

    disconnectedCallback() {

    }

}
