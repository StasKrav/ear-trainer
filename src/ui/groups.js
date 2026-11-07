import { INTERVAL_GROUPS } from '../exercises/index.js';

let el = null;
let onToggle = null;

export function initGroups(container, toggleCallback) {
  el = container;
  onToggle = toggleCallback;
}

export function renderGroupChips(allowed) {
  el.innerHTML = '';
  INTERVAL_GROUPS.forEach((g) => {
    const allActive = g.members.every((id) => allowed.includes(id));
    const chip = document.createElement('div');
    chip.className = 'chip group' + (allActive ? ' active' : '');
    chip.textContent = g.name;
    chip.dataset.id = g.id;
    chip.addEventListener('click', () => onToggle(g.id));
    el.appendChild(chip);
  });
}