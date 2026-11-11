let el = null;
let onToggle = null;

export function initGroups(container, toggleCallback) {
  el = container;
  onToggle = toggleCallback;
}

// groups: [{ id, name, members, locked? }]
// activeIds: string[]
export function renderGroupChips(groups, activeIds) {
  el.innerHTML = '';
  groups.forEach((g) => {
    const allActive = g.members.every((id) => activeIds.includes(id));
    const chip = document.createElement('div');
    chip.className =
      'chip group' +
      (allActive ? ' active' : '') +
      (g.locked ? ' locked' : '');
    chip.textContent = g.name;
    chip.dataset.id = g.id;
    if (!g.locked) {
      chip.addEventListener('click', () => onToggle(g.id));
    }
    el.appendChild(chip);
  });
}