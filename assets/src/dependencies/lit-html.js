import {html, render} from 'lit-html';
import { keyed } from 'lit-html/directives/keyed.js';

var litHTML = {};

litHTML.html = html;
litHTML.render = render;
litHTML.keyed = keyed;

export default litHTML;
