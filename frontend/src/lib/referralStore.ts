import { writable } from 'svelte/store';
import { get } from 'svelte/store';
import type {Referral} from './types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const referrals = writable<Referral[]>([]);
export const isLoadingReferrals = writable(true);
const hasLoaded = writable(false);

export async function fetchReferrals(id) {
    if (get(hasLoaded)) {
        return;
    }

    isLoadingReferrals.set(true);

    try {
        const response = await fetch(`${API_BASE_URL}/users/${id}/referrals`, {
            headers: { 'ngrok-skip-browser-warning': 'true' }
        });
        if (!response.ok) {
            throw new Error(`Network error: ${response.status}`);
        }
        const data = await response.json();
        referrals.set(data || []);
        hasLoaded.set(true);
    } catch (error) {
        console.error("Failed to fetch referrals:", error);
        referrals.set([]);
    } finally {
        isLoadingReferrals.set(false);
    }
}
