import { TonConnectUI } from '@tonconnect/ui';
import { browser } from '$app/environment';

let tonConnectUI;

export function getTonConnectUI() {
    if (tonConnectUI) {
        return tonConnectUI;
    }
    if (browser) {
        tonConnectUI = new TonConnectUI({
            manifestUrl: 'https://clicker-roan.vercel.app/tonconnect-manifest.json'
        });
    }
    return tonConnectUI;
}