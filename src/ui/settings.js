export function initSettings({ onModeChange, onDirectionChange, onDifficultyChange }) {
  const modeSwitch = document.getElementById('modeSwitch');
  const directionSwitch = document.getElementById('directionSwitch');
  const diffSwitch = document.getElementById('difficultySwitch');

  modeSwitch.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;
    modeSwitch.querySelectorAll('button').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');

    const dirGroup = directionSwitch.closest('.control-group');
    dirGroup.classList.toggle('disabled', btn.dataset.mode === 'harmonic');

    onModeChange(btn.dataset.mode);
  });

  directionSwitch.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;
    directionSwitch.querySelectorAll('button').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    onDirectionChange(btn.dataset.dir);
  });

  diffSwitch.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;
    diffSwitch.querySelectorAll('button').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    onDifficultyChange(btn.dataset.diff);
  });

  // Сворачивание боковой панели
  const sidebarHandle = document.getElementById('sidebarHandle');
  sidebarHandle.addEventListener('click', () => {
    const closed = document.body.classList.toggle('sidebar-closed');
    sidebarHandle.setAttribute('aria-expanded', String(!closed));
    sidebarHandle.setAttribute(
      'aria-label',
      closed ? 'Показать настройки' : 'Скрыть настройки'
    );
  });

  // Пианино по чекбоксу
  const showPiano = document.getElementById('showPiano');
  const piano = document.getElementById('piano');
  showPiano.addEventListener('change', () => {
    piano.hidden = !showPiano.checked;
  });
}