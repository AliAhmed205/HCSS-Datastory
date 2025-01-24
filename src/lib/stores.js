import { writable } from "svelte/store";

export const selectedGroup = writable(""); // Opslag voor de geselecteerde groep
export const selectedCountry = writable('');
export const selectedYear = writable('')
export const selectedConflict = writable('RUS')
export const countryComment = writable([]);
