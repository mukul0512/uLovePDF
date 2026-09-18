import { THEME_STORAGE_KEY } from '@/constants/theme';

/**
 * Blocking bootstrap that runs before React hydrates.
 *
 * Without this, a visitor with a saved dark preference would see the light
 * SSR HTML for a frame. The script is a string because it must execute as
 * raw HTML, not as a module, and so cannot import the TypeScript helpers.
 * Keep the class names and storage key in sync with `utils/commonFunctions/theme`.
 */
export const THEME_BOOTSTRAP_SCRIPT = `(function(){try{var stored=localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)});var preference=stored==="light"||stored==="dark"?stored:"system";var dark=preference==="dark"||(preference==="system"&&window.matchMedia("(prefers-color-scheme: dark)").matches);var root=document.documentElement;root.classList.toggle("dark",dark);root.classList.toggle("light",!dark);root.dataset.theme=preference;root.style.colorScheme=dark?"dark":"light";}catch(e){}})();`;
