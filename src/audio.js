import Soundfont from 'soundfont-player';

export const AudioEngine = (() => {
  let ctx = null;
  let piano = null;
  let loading = null;
  let isReady = false;

  function getCtx() {
    if (!ctx) {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      if (ctx.state === 'suspended') ctx.resume().catch(() => {});
    }
    return ctx;
  }

  function load() {
    if (loading) return loading;

    loading = Soundfont.instrument(getCtx(), 'acoustic_grand_piano', {
      soundfont: 'MusyngKite',
      format: 'mp3',
      // файл лежит в public/soundfonts/, Vite отдаст его как /soundfonts/...
      nameToUrl: (name, sf, fmt) =>
  `${import.meta.env.BASE_URL}soundfonts/${name}-${fmt}.js`,
    })
      .then((inst) => {
        piano = inst;
        isReady = true;
        return inst;
      })
      .catch((err) => {
        console.error('[AudioEngine] Не удалось загрузить рояль:', err);
        loading = null;
        throw err;
      });

    return loading;
  }

  function ready() {
    return isReady;
  }

  function midiToFreq(midi) {
    return 440 * Math.pow(2, (midi - 69) / 12);
  }

  function playNote(midi, when, dur, gain = 2.0) {
    if (!piano) return;
    piano.play(midi, when, { duration: dur, gain });
  }

  function playMelodic(midis, noteDur = 0.55) {
    const c = getCtx();
    const t0 = c.currentTime + 0.05;
    midis.forEach((m, i) => playNote(m, t0 + i * (noteDur + 0.05), noteDur));
    return t0 + midis.length * (noteDur + 0.05);
  }

  function playHarmonic(midis, dur = 1.4) {
    const c = getCtx();
    const t0 = c.currentTime + 0.05;
    midis.forEach((m) => playNote(m, t0, dur));
    return t0 + dur;
  }

  function resume() {
    const c = getCtx();
    if (c.state === 'suspended') c.resume();
  }

  return { playMelodic, playHarmonic, resume, load, ready, midiToFreq };
})();