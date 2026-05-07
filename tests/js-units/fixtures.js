import { install } from 'undici';

export function mochaGlobalSetup() {
    install();
}
