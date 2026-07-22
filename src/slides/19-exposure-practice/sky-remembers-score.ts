export type SkyRemembersIntensity = 1 | 2 | 3 | 4;

export const skyRemembersScoreOptions = [
  {
    id: "flowers-crown-of-embers-glass-seed",
    controlLabel: "6G-E",
    shortcut: "6",
    label: "Crown of Embers: Glass Seed",
    mood: "Glass → foundation → motion → orchestra",
    tempo: 106,
    beatsPerBar: 4,
    meter: "4/4",
    layerLevels: [0.22, 0.31, 0.38, 0.5],
  },
] as const;

export type SkyRemembersScoreId = typeof skyRemembersScoreOptions[number]["id"];

type MelodyEvent = readonly [beat: number, duration: number, note: number];

type ScoreMaterial = {
  bassRoots: readonly number[];
  chords: readonly (readonly number[])[];
  melody: readonly (readonly MelodyEvent[])[];
};

type VoiceOptions = {
  attack: number;
  detune?: number;
  filterFrequency: number;
  filterType?: BiquadFilterType;
  gain: number;
  highpassFrequency?: number;
  pan?: number;
  release: number;
  wave: OscillatorType | PeriodicWave;
};

const scheduleAheadSeconds = 0.35;
const schedulerIntervalMs = 60;
const silence = 0.0001;
const thresholdFadeInDuration = 0.68;
const thresholdFadeOutDuration = 0.48;

const flowersCrownOfEmbersMaterial: ScoreMaterial = {
  chords: [
    [45, 52, 57, 59, 64], [41, 48, 52, 57, 59], [40, 47, 52, 55, 59, 62], [43, 50, 55, 57, 62],
    [38, 45, 48, 52, 57], [41, 48, 52, 55, 60], [43, 50, 52, 55, 59], [40, 47, 52, 56, 62],
  ],
  bassRoots: [33, 29, 28, 31, 26, 29, 31, 28],
  melody: [
    [[0, 1, 76], [1, 1, 79], [2, 2, 81]],
    [[0, 1, 81], [1, 1, 83], [2, 2, 84]],
    [[0, 1, 79], [1, 1, 81], [2, 1, 84], [3, 1, 86]],
    [[0, 1.5, 86], [1.5, 0.5, 84], [2, 2, 81]],
    [[0, 1, 81], [1, 1, 84], [2, 1, 88], [3, 1, 89]],
    [[0, 1, 88], [1, 1, 86], [2, 2, 84]],
    [[0, 1, 83], [1, 1, 86], [2, 1, 91], [3, 1, 93]],
    [[0, 1, 88], [1, 1, 86], [2, 1, 83], [3, 1, 88]],
  ],
};

type FlowersOrchestralScoreId = SkyRemembersScoreId;
type FlowersOrchestralLayer = 0 | 1 | 2 | 3;

type FlowersOrchestralBuild = {
  answers: FlowersOrchestralLayer;
  counterline: FlowersOrchestralLayer;
  ensemble: FlowersOrchestralLayer;
  finale?: boolean;
  foundation?: FlowersOrchestralLayer;
  glass?: FlowersOrchestralLayer;
  harp: FlowersOrchestralLayer;
  leadSeed: FlowersOrchestralLayer;
  motion: FlowersOrchestralLayer;
  percussion: FlowersOrchestralLayer;
  swell: FlowersOrchestralLayer;
};

type FlowersOrchestralArrangement = {
  arpPattern: readonly number[];
  backbeatPattern: readonly number[];
  build?: FlowersOrchestralBuild;
  counterline: readonly (readonly [number, number])[];
  enginePattern: readonly number[];
  harmonicPattern: readonly number[];
  kickPattern: readonly number[];
  material: ScoreMaterial;
};

const defaultFlowersOrchestralBuild: FlowersOrchestralBuild = {
  answers: 2,
  counterline: 2,
  ensemble: 2,
  finale: true,
  foundation: 0,
  glass: 0,
  harp: 1,
  leadSeed: 3,
  motion: 1,
  percussion: 1,
  swell: 2,
};

const crownOfEmbersCore = {
  arpPattern: [0, 1, 2, 3, 4, 2, 1, 3],
  backbeatPattern: [1, 3],
  counterline: [
    [57, 64], [57, 59], [60, 62], [55, 60],
    [52, 57], [55, 60], [59, 62], [56, 60],
  ],
  enginePattern: [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5],
  harmonicPattern: [0, 1, 2, 3],
  kickPattern: [0, 2],
  material: flowersCrownOfEmbersMaterial,
} as const satisfies Omit<FlowersOrchestralArrangement, "build">;

const flowersOrchestralArrangements: Record<
  FlowersOrchestralScoreId,
  FlowersOrchestralArrangement
> = {
  "flowers-crown-of-embers-glass-seed": {
    ...crownOfEmbersCore,
    build: {
      answers: 2,
      counterline: 3,
      ensemble: 3,
      finale: false,
      foundation: 1,
      glass: 0,
      harp: 2,
      leadSeed: 3,
      motion: 2,
      percussion: 3,
      swell: 3,
    },
  },
};

class SkyRemembersScore {
  private readonly context: AudioContext;
  private readonly layerGains: GainNode[];
  private readonly masterGain: GainNode;
  private readonly noiseBuffer: AudioBuffer;
  private readonly fluteWave: PeriodicWave;
  private readonly brassWave: PeriodicWave;
  private readonly choirWave: PeriodicWave;
  private readonly glassWave: PeriodicWave;
  private readonly reedWave: PeriodicWave;
  private readonly stringWave: PeriodicWave;
  private readonly reverb: ConvolverNode;
  private readonly impulseResponse: AudioBuffer;
  private readonly scheduledSources = new Set<AudioScheduledSourceNode>();
  private loopStartTime: number;
  private nextLoopTime: number;
  private nextOrchestralBarIndex = 0;
  private scheduler?: number;
  private switchTimer?: number;
  private generation = 0;
  private hasAppliedIntensity = false;
  private isDisposed = false;
  private intensity: SkyRemembersIntensity = 1;
  private scoreId: SkyRemembersScoreId = "flowers-crown-of-embers-glass-seed";

  constructor() {
    const AudioContextClass = window.AudioContext ?? (
      window as typeof window & { webkitAudioContext?: typeof AudioContext }
    ).webkitAudioContext;

    if (!AudioContextClass) {
      throw new Error("Web Audio is not supported in this browser.");
    }

    this.context = new AudioContextClass({ latencyHint: "interactive" });
    this.masterGain = this.context.createGain();
    this.masterGain.gain.value = 0.5;

    const compressor = this.context.createDynamicsCompressor();
    compressor.threshold.value = -23;
    compressor.knee.value = 16;
    compressor.ratio.value = 5;
    compressor.attack.value = 0.008;
    compressor.release.value = 0.28;

    const dryBus = this.context.createGain();
    dryBus.gain.value = 0.82;
    this.reverb = this.context.createConvolver();
    this.impulseResponse = this.createImpulseResponse(2.8, 2.7);
    this.reverb.buffer = this.impulseResponse;
    const reverbHighpass = this.context.createBiquadFilter();
    reverbHighpass.type = "highpass";
    reverbHighpass.frequency.value = 160;
    reverbHighpass.Q.value = 0.5;
    const wetBus = this.context.createGain();
    wetBus.gain.value = 0.36;

    dryBus.connect(compressor);
    reverbHighpass.connect(this.reverb);
    this.reverb.connect(wetBus);
    wetBus.connect(compressor);
    compressor.connect(this.masterGain);
    this.masterGain.connect(this.context.destination);

    this.layerGains = skyRemembersScoreOptions[0].layerLevels.map(() => {
      const layer = this.context.createGain();
      layer.gain.value = silence;
      layer.connect(dryBus);
      layer.connect(reverbHighpass);
      return layer;
    });

    this.noiseBuffer = this.createNoiseBuffer(2);
    this.fluteWave = this.context.createPeriodicWave(
      new Float32Array([0, 0, 0, 0, 0, 0]),
      new Float32Array([0, 1, 0.26, 0.12, 0.04, 0.02]),
    );
    this.brassWave = this.context.createPeriodicWave(
      new Float32Array([0, 0, 0, 0, 0, 0, 0]),
      new Float32Array([0, 1, 0.72, 0.42, 0.25, 0.13, 0.07]),
    );
    this.choirWave = this.context.createPeriodicWave(
      new Float32Array([0, 0, 0, 0, 0, 0, 0]),
      new Float32Array([0, 1, 0.52, 0.18, 0.3, 0.12, 0.07]),
    );
    this.glassWave = this.context.createPeriodicWave(
      new Float32Array([0, 0, 0, 0, 0, 0, 0, 0]),
      new Float32Array([0, 1, 0, 0.42, 0, 0.22, 0, 0.1]),
    );
    this.reedWave = this.context.createPeriodicWave(
      new Float32Array([0, 0, 0, 0, 0, 0]),
      new Float32Array([0, 1, 0.64, 0.3, 0.14, 0.07]),
    );
    this.stringWave = this.context.createPeriodicWave(
      new Float32Array([0, 0, 0, 0, 0, 0, 0]),
      new Float32Array([0, 1, 0.48, 0.3, 0.18, 0.1, 0.06]),
    );
    this.loopStartTime = this.context.currentTime + 0.08;
    this.nextLoopTime = this.loopStartTime;
    this.scheduleMusic();
    this.scheduler = window.setInterval(() => this.scheduleMusic(), schedulerIntervalMs);
    void this.context.resume();
  }

  selectScore(scoreId: SkyRemembersScoreId) {
    if (this.isDisposed || scoreId === this.scoreId) {
      return;
    }

    const generation = ++this.generation;
    const now = this.context.currentTime;
    void this.context.resume();
    this.masterGain.gain.cancelScheduledValues(now);
    this.masterGain.gain.setTargetAtTime(silence, now, 0.022);

    if (this.switchTimer !== undefined) {
      window.clearTimeout(this.switchTimer);
    }

    this.switchTimer = window.setTimeout(() => {
      if (this.isDisposed || generation !== this.generation) {
        return;
      }

      this.stopScheduledSources();
      this.scoreId = scoreId;
      this.reverb.buffer = null;
      this.reverb.buffer = this.impulseResponse;
      this.loopStartTime = this.context.currentTime + 0.09;
      this.nextLoopTime = this.loopStartTime;
      this.nextOrchestralBarIndex = 0;
      this.applyIntensity(this.context.currentTime, this.intensity, true);
      this.scheduleMusic();
      this.masterGain.gain.cancelScheduledValues(this.context.currentTime);
      this.masterGain.gain.setValueAtTime(silence, this.context.currentTime);
      this.masterGain.gain.setTargetAtTime(0.5, this.context.currentTime, 0.055);
      this.switchTimer = undefined;
    }, 75);
  }

  setIntensity(intensity: SkyRemembersIntensity) {
    if (this.isDisposed) {
      return;
    }

    void this.context.resume();
    const previousIntensity = this.intensity;

    if (intensity === previousIntensity && this.hasAppliedIntensity) {
      return;
    }

    this.intensity = intensity;
    const now = this.context.currentTime;
    this.applyIntensity(now, previousIntensity, !this.hasAppliedIntensity);
    this.hasAppliedIntensity = true;
  }

  dispose() {
    if (this.isDisposed) {
      return;
    }

    this.isDisposed = true;
    if (this.scheduler !== undefined) {
      window.clearInterval(this.scheduler);
    }
    if (this.switchTimer !== undefined) {
      window.clearTimeout(this.switchTimer);
    }

    this.stopScheduledSources();

    const now = this.context.currentTime;
    this.masterGain.gain.cancelScheduledValues(now);
    this.masterGain.gain.setTargetAtTime(silence, now, 0.05);
    window.setTimeout(() => void this.context.close(), 220);
  }

  private get scoreOption() {
    return skyRemembersScoreOptions.find(({ id }) => id === this.scoreId) ?? skyRemembersScoreOptions[0];
  }

  private get beatDuration() {
    return 60 / this.scoreOption.tempo;
  }

  private get barDuration() {
    return this.beatDuration * this.scoreOption.beatsPerBar;
  }

  private applyIntensity(
    now: number,
    previousIntensity: SkyRemembersIntensity = this.intensity,
    forceAll = false,
  ) {
    const levels = this.scoreOption.layerLevels;

    this.layerGains.forEach((layer, index) => {
      const wasActive = index < previousIntensity;
      const isActive = index < this.intensity;

      if (!forceAll && wasActive === isActive) {
        return;
      }

      const target = index < this.intensity ? levels[index] : silence;
      layer.gain.cancelAndHoldAtTime(now);
      layer.gain.linearRampToValueAtTime(
        target,
        now + (isActive ? thresholdFadeInDuration : thresholdFadeOutDuration),
      );
    });
  }

  private scheduleMusic() {
    if (this.isDisposed) {
      return;
    }

    const horizon = this.context.currentTime + scheduleAheadSeconds;

    while (this.nextLoopTime < horizon) {
      this.scheduleFlowersOrchestralBar(
        this.nextLoopTime,
        this.scoreId,
        this.nextOrchestralBarIndex,
      );
      this.nextLoopTime += this.barDuration;
      this.nextOrchestralBarIndex = (this.nextOrchestralBarIndex + 1) % 8;
    }
  }

  private scheduleFlowersOrchestralBar(
    startTime: number,
    scoreId: FlowersOrchestralScoreId,
    barIndex: number,
  ) {
    const beat = this.beatDuration;
    const bar = this.barDuration;
    const arrangement = flowersOrchestralArrangements[scoreId];
    const build = arrangement.build ?? defaultFlowersOrchestralBuild;
    const foundationLayer = build.foundation ?? 0;
    const glassLayer = build.glass ?? 0;
    const hasFinale = build.finale ?? true;
    const { material } = arrangement;
    const isMoonFamily = false;
    const isProcessional = false;
    const isWorldSized = true;
    const leadWave = this.brassWave;

    const chord = material.chords[barIndex];
    const at = startTime;
    const bass = material.bassRoots[barIndex];
    const subMidi = bass >= 35 ? bass - 12 : bass;
    const preserveFinalMix = (
      gain: number,
      layer: FlowersOrchestralLayer,
      referenceLayer: FlowersOrchestralLayer,
    ) => gain * this.scoreOption.layerLevels[referenceLayer] / this.scoreOption.layerLevels[layer];
    const seatPan = (index: number, length: number) => (
      length <= 1 ? 0 : -0.62 + index * 1.24 / (length - 1)
    );

    // The foundation and glass halo can be separated so a build may begin with
    // only the two sparse glass accents before the orchestra arrives.
    this.scheduleVoice(foundationLayer, subMidi, at, bar * 0.84, {
      attack: isMoonFamily ? 0.48 : 0.34,
      filterFrequency: 115,
      gain: preserveFinalMix(isMoonFamily ? 0.075 : 0.09, foundationLayer, 0),
      pan: 0,
      release: isMoonFamily ? 1.05 : 0.82,
      wave: "sine",
    });
    this.scheduleVoice(foundationLayer, subMidi + 12, at + 0.012, bar * 0.8, {
      attack: 0.3,
      filterFrequency: 190,
      gain: preserveFinalMix(isMoonFamily ? 0.018 : 0.022, foundationLayer, 0),
      pan: 0,
      release: 0.72,
      wave: "triangle",
    });
    this.scheduleVoice(foundationLayer, bass, at + 0.008, bar * 0.94, {
      attack: 0.36,
      filterFrequency: 720,
      gain: preserveFinalMix(isWorldSized ? 0.064 : 0.056, foundationLayer, 0),
      pan: -0.08,
      release: 0.9,
      wave: this.stringWave,
    });
    chord.forEach((note, index) => {
      this.scheduleVoice(foundationLayer, note + 12, at + index * 0.009, bar * 0.92, {
        attack: isMoonFamily ? 0.62 : 0.48,
        detune: index % 2 ? 4 : -4,
        filterFrequency: isMoonFamily ? 3_200 : 3_700,
        gain: preserveFinalMix(isMoonFamily ? 0.024 : 0.027, foundationLayer, 0),
        highpassFrequency: 170,
        pan: seatPan(index, chord.length),
        release: isMoonFamily ? 1.25 : 0.95,
        wave: this.choirWave,
      });
    });
    [0, 2].forEach((chordIndex, sectionIndex) => {
      this.scheduleEnsembleVoice(foundationLayer, chord[chordIndex] + 24, at + 0.03 + sectionIndex * bar * 0.48, beat * 0.75, {
        attack: 0.26,
        filterFrequency: 4_200,
        gain: preserveFinalMix(0.034, foundationLayer, 0),
        highpassFrequency: 260,
        release: 1.2,
        wave: this.stringWave,
      }, 0.55, 5, 0.011);
    });
    [1, 4].forEach((chordIndex, seedIndex) => {
      this.scheduleVoice(glassLayer, chord[chordIndex] + 36, at + bar * (seedIndex === 0 ? 0.18 : 0.68), beat * 0.12, {
        attack: 0.008,
        filterFrequency: 10_400,
        gain: preserveFinalMix(0.028, glassLayer, 0),
        highpassFrequency: 900,
        pan: seedIndex === 0 ? -0.6 : 0.6,
        release: isMoonFamily ? 1.65 : 1.25,
        wave: this.glassWave,
      });
    });

    // Middle-threshold families move between layers for each 6G build. Their gain is
    // normalized against the original bus so every variation converges on one final mix.
    arrangement.enginePattern.forEach((offset, index) => {
      const engineNote = bass + [0, 7, 12, 7][index % 4];
      const isStrongBeat = index === 0 || index === Math.floor(arrangement.enginePattern.length / 2);
      this.scheduleVoice(build.motion, engineNote, at + offset * beat, beat * (isMoonFamily ? 0.44 : 0.36), {
        attack: 0.015,
        filterFrequency: isWorldSized ? 1_450 : 1_250,
        gain: preserveFinalMix(isStrongBeat ? 0.075 : 0.052, build.motion, 1),
        pan: engineNote < 48 ? 0 : index % 2 ? 0.2 : -0.2,
        release: isMoonFamily ? 0.34 : 0.24,
        wave: this.stringWave,
      });
      if (isStrongBeat) {
        this.scheduleVoice(build.motion, engineNote + 12, at + offset * beat + 0.012, beat * 0.28, {
          attack: 0.012,
          filterFrequency: 2_100,
          gain: preserveFinalMix(0.032, build.motion, 1),
          highpassFrequency: 150,
          pan: index === 0 ? -0.34 : 0.34,
          release: 0.22,
          wave: this.reedWave,
        });
      }
    });
    arrangement.arpPattern.forEach((chordIndex, step) => {
      this.scheduleVoice(
        build.harp,
        chord[chordIndex] + (step % 4 === 3 ? 36 : 24),
        at + step * bar / arrangement.arpPattern.length,
        beat * 0.2,
        {
          attack: 0.004,
          filterFrequency: 9_200,
          gain: preserveFinalMix(step % 3 === 0 ? 0.046 : 0.032, build.harp, 1),
          highpassFrequency: 520,
          pan: step % 2 ? 0.5 : -0.5,
          release: isMoonFamily ? 0.72 : 0.48,
          wave: step % 3 === 2 ? this.glassWave : "triangle",
        },
      );
    });
    arrangement.kickPattern.forEach((offset, index) => {
      this.scheduleKick(
        at + offset * beat,
        build.percussion,
        preserveFinalMix(index === 0 ? 0.18 : 0.135, build.percussion, 1),
      );
    });
    arrangement.backbeatPattern.forEach((offset, index) => {
      this.scheduleNoise(
        at + offset * beat,
        isMoonFamily ? 0.22 : 0.16,
        isMoonFamily ? 2_100 : 1_650,
        preserveFinalMix(isMoonFamily ? 0.04 : 0.052, build.percussion, 1),
        index % 2 ? -0.24 : 0.24,
        build.percussion,
      );
    });
    this.scheduleTimpani(
      at + beat * (isMoonFamily ? 0 : 3),
      bass,
      build.percussion,
      preserveFinalMix(isWorldSized ? 0.1 : 0.075, build.percussion, 1),
    );

    // The surrounding orchestra stays split into independent build families while
    // leaving the final threshold's lead register open.
    arrangement.harmonicPattern.forEach((offset, pulseIndex) => {
      chord.slice(0, 4).forEach((note, index) => {
        this.scheduleVoice(build.ensemble, note + 12, at + offset * beat + index * 0.008, beat * (isMoonFamily ? 0.68 : 0.58), {
          attack: isMoonFamily ? 0.16 : 0.1,
          detune: index % 2 ? 3 : -3,
          filterFrequency: isWorldSized ? 3_900 : 3_500,
          gain: preserveFinalMix(pulseIndex === 0 ? 0.04 : 0.028, build.ensemble, 2),
          highpassFrequency: 190,
          pan: seatPan(index, 4),
          release: isMoonFamily ? 0.78 : 0.52,
          wave: this.stringWave,
        });
      });
    });
    chord.slice(0, 4).forEach((note, index) => {
      this.scheduleVoice(build.ensemble, note + 12, at + 0.018 * index, bar * 0.88, {
        attack: 0.5,
        filterFrequency: 3_000,
        gain: preserveFinalMix(0.018, build.ensemble, 2),
        highpassFrequency: 220,
        pan: seatPan(index, 4) * 0.92,
        release: 0.9,
        wave: this.choirWave,
      });
    });
    this.scheduleVoice(build.ensemble, bass + 12, at + 0.015, bar * 0.82, {
      attack: 0.22,
      filterFrequency: 650,
      gain: preserveFinalMix(isWorldSized ? 0.034 : 0.028, build.ensemble, 2),
      highpassFrequency: 55,
      pan: 0,
      release: 0.68,
      wave: this.stringWave,
    });
    arrangement.counterline[barIndex].forEach((note, phraseIndex) => {
      this.scheduleVoice(build.counterline, note, at + phraseIndex * bar / 2, bar * 0.42, {
        attack: 0.11,
        filterFrequency: isMoonFamily ? 3_200 : 2_800,
        gain: preserveFinalMix(isWorldSized ? 0.072 : 0.06, build.counterline, 2),
        pan: phraseIndex === 0 ? -0.22 : 0.22,
        release: 0.48,
        wave: this.brassWave,
      });
    });
    [0, 2, 4].forEach((chordIndex, answerIndex) => {
      this.scheduleVoice(build.answers, chord[chordIndex] + 24, at + (answerIndex + 0.65) * bar / 3, beat * 0.3, {
        attack: 0.025,
        filterFrequency: 7_400,
        gain: preserveFinalMix(0.035, build.answers, 2),
        highpassFrequency: 420,
        pan: [-0.5, 0.12, 0.5][answerIndex],
        release: 0.68,
        wave: isMoonFamily ? this.fluteWave : this.reedWave,
      });
    });
    if (barIndex === 0 || barIndex === 4) {
      this.scheduleNoise(
        at,
        isWorldSized ? 1.45 : 1.15,
        4_800,
        preserveFinalMix(0.058, build.swell, 2),
        0,
        build.swell,
      );
    }

    // The lead seed can arrive without the full finale; other builds use the final
    // threshold for one melody voiced by several orchestral desks.
    const barMelody = material.melody[barIndex];
    const peakNote = Math.max(...barMelody.map(([, , note]) => note));
    barMelody.forEach(([offset, duration, note]) => {
      const noteAt = at + offset * beat;
      const noteDuration = duration * beat * 0.92;
      if (hasFinale) {
        this.scheduleVoice(3, note, noteAt, noteDuration, {
          attack: isMoonFamily ? 0.07 : 0.1,
          filterFrequency: isMoonFamily ? 6_400 : 4_400,
          gain: isMoonFamily ? 0.082 : 0.105,
          highpassFrequency: 210,
          pan: 0.04,
          release: isMoonFamily ? 0.5 : 0.62,
          wave: leadWave,
        });
        this.scheduleEnsembleVoice(3, note, noteAt + 0.009, noteDuration * 0.98, {
          attack: isProcessional ? 0.14 : 0.2,
          filterFrequency: isWorldSized ? 4_200 : 3_800,
          gain: isMoonFamily ? 0.06 : 0.072,
          highpassFrequency: 180,
          release: 0.58,
          wave: this.stringWave,
        }, 0.58, 6, 0.012);
      }
      this.scheduleVoice(build.leadSeed, note - 12, noteAt + 0.014, noteDuration, {
        attack: isMoonFamily ? 0.1 : 0.13,
        filterFrequency: 2_900,
        gain: preserveFinalMix(
          isMoonFamily ? 0.048 : 0.062,
          build.leadSeed,
          3,
        ),
        pan: -0.24,
        release: 0.64,
        wave: this.brassWave,
      });
      if (hasFinale && note === peakNote) {
        this.scheduleVoice(3, note + 12, noteAt + 0.02, noteDuration * 0.76, {
          attack: 0.045,
          filterFrequency: 9_200,
          gain: note === peakNote ? 0.034 : 0.022,
          highpassFrequency: 650,
          pan: 0.5,
          release: 0.72,
          wave: this.fluteWave,
        });
      }
    });
    if (hasFinale) {
      chord.forEach((note, index) => {
        this.scheduleVoice(3, note + 12, at + index * 0.011, bar * 0.9, {
          attack: 0.48,
          detune: index % 2 ? 4 : -4,
          filterFrequency: 3_100,
          gain: 0.017,
          highpassFrequency: 200,
          pan: seatPan(index, chord.length),
          release: 0.95,
          wave: this.choirWave,
        });
      });
      arrangement.counterline[barIndex].forEach((note, phraseIndex) => {
        this.scheduleVoice(3, note + 12, at + phraseIndex * bar / 2 + beat * 0.18, bar * 0.34, {
          attack: 0.08,
          filterFrequency: 5_100,
          gain: 0.026,
          highpassFrequency: 280,
          pan: phraseIndex === 0 ? 0.42 : -0.42,
          release: 0.52,
          wave: isMoonFamily ? this.reedWave : this.fluteWave,
        });
      });
    }
  }

  private scheduleEnsembleVoice(
    layerIndex: number,
    midi: number,
    startTime: number,
    duration: number,
    options: VoiceOptions,
    spread = 0.56,
    detune = 6,
    offset = 0.01,
  ) {
    const sectionGain = options.gain * 0.56;
    const centerDetune = options.detune ?? 0;

    this.scheduleVoice(layerIndex, midi, startTime, duration, {
      ...options,
      detune: centerDetune - detune,
      gain: sectionGain,
      pan: -spread,
    });
    this.scheduleVoice(layerIndex, midi, startTime + offset, duration, {
      ...options,
      detune: centerDetune + detune,
      gain: sectionGain,
      pan: spread,
    });
  }

  private scheduleVoice(
    layerIndex: number,
    midi: number,
    startTime: number,
    duration: number,
    options: VoiceOptions,
  ) {
    const oscillator = this.context.createOscillator();
    if (typeof options.wave === "string") {
      oscillator.type = options.wave as OscillatorType;
    } else {
      oscillator.setPeriodicWave(options.wave);
    }
    oscillator.frequency.value = midiToFrequency(midi);
    oscillator.detune.value = options.detune ?? 0;

    const filter = this.context.createBiquadFilter();
    filter.type = options.filterType ?? "lowpass";
    filter.frequency.value = options.filterFrequency;
    filter.Q.value = 0.7;

    const highpass = options.highpassFrequency === undefined
      ? undefined
      : this.context.createBiquadFilter();
    if (highpass) {
      highpass.type = "highpass";
      highpass.frequency.value = options.highpassFrequency ?? 0;
      highpass.Q.value = 0.5;
    }

    const envelope = this.context.createGain();
    const noteEnd = startTime + duration;
    envelope.gain.setValueAtTime(silence, startTime);
    envelope.gain.linearRampToValueAtTime(options.gain, startTime + options.attack);
    envelope.gain.setValueAtTime(options.gain, noteEnd);
    envelope.gain.exponentialRampToValueAtTime(silence, noteEnd + options.release);

    const panner = this.context.createStereoPanner();
    panner.pan.value = options.pan ?? 0;
    if (highpass) {
      oscillator.connect(highpass);
      highpass.connect(filter);
    } else {
      oscillator.connect(filter);
    }
    filter.connect(envelope);
    envelope.connect(panner);
    panner.connect(this.layerGains[layerIndex]);
    this.trackSource(oscillator);
    oscillator.start(startTime);
    oscillator.stop(noteEnd + options.release + 0.03);
  }

  private scheduleKick(startTime: number, layerIndex = 3, gain = 0.18) {
    const oscillator = this.context.createOscillator();
    const envelope = this.context.createGain();
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(96, startTime);
    oscillator.frequency.exponentialRampToValueAtTime(42, startTime + 0.22);
    envelope.gain.setValueAtTime(gain, startTime);
    envelope.gain.exponentialRampToValueAtTime(silence, startTime + 0.32);
    oscillator.connect(envelope);
    envelope.connect(this.layerGains[layerIndex]);
    this.trackSource(oscillator);
    oscillator.start(startTime);
    oscillator.stop(startTime + 0.34);
  }

  private scheduleTimpani(startTime: number, midi: number, layerIndex = 3, gain = 0.16) {
    this.scheduleVoice(layerIndex, midi, startTime, 0.18, {
      attack: 0.004,
      filterFrequency: 500,
      gain,
      pan: 0.06,
      release: 0.65,
      wave: "sine",
    });
  }

  private scheduleNoise(
    startTime: number,
    duration: number,
    frequency: number,
    gain: number,
    pan: number,
    layerIndex = 3,
  ) {
    const source = this.context.createBufferSource();
    source.buffer = this.noiseBuffer;
    const filter = this.context.createBiquadFilter();
    filter.type = "highpass";
    filter.frequency.value = frequency;
    const envelope = this.context.createGain();
    envelope.gain.setValueAtTime(gain, startTime);
    envelope.gain.exponentialRampToValueAtTime(silence, startTime + duration);
    const panner = this.context.createStereoPanner();
    panner.pan.value = pan;
    source.connect(filter);
    filter.connect(envelope);
    envelope.connect(panner);
    panner.connect(this.layerGains[layerIndex]);
    this.trackSource(source);
    source.start(startTime);
    source.stop(startTime + Math.min(duration + 0.04, this.noiseBuffer.duration));
  }

  private trackSource(source: AudioScheduledSourceNode) {
    this.scheduledSources.add(source);
    source.addEventListener("ended", () => this.scheduledSources.delete(source), { once: true });
  }

  private stopScheduledSources() {
    this.scheduledSources.forEach((source) => {
      try {
        source.stop();
      } catch {
        // A source that has already ended needs no further cleanup.
      }
      source.disconnect();
    });
    this.scheduledSources.clear();
  }

  private createNoiseBuffer(duration: number) {
    const frameCount = Math.ceil(this.context.sampleRate * duration);
    const buffer = this.context.createBuffer(1, frameCount, this.context.sampleRate);
    const data = buffer.getChannelData(0);

    for (let index = 0; index < frameCount; index += 1) {
      data[index] = Math.random() * 2 - 1;
    }

    return buffer;
  }

  private createImpulseResponse(duration: number, decay: number) {
    const frameCount = Math.ceil(this.context.sampleRate * duration);
    const impulse = this.context.createBuffer(2, frameCount, this.context.sampleRate);

    for (let channel = 0; channel < impulse.numberOfChannels; channel += 1) {
      const data = impulse.getChannelData(channel);
      for (let index = 0; index < frameCount; index += 1) {
        const envelope = (1 - index / frameCount) ** decay;
        data[index] = (Math.random() * 2 - 1) * envelope;
      }
    }

    return impulse;
  }
}

let sharedScore: SkyRemembersScore | undefined;
let sharedScoreReferences = 0;
let pendingDispose: number | undefined;

export function acquireSkyRemembersScore() {
  if (pendingDispose !== undefined) {
    window.clearTimeout(pendingDispose);
    pendingDispose = undefined;
  }

  sharedScore ??= new SkyRemembersScore();
  sharedScoreReferences += 1;
  return sharedScore;
}

export function releaseSkyRemembersScore() {
  sharedScoreReferences = Math.max(0, sharedScoreReferences - 1);
  if (sharedScoreReferences !== 0 || !sharedScore) {
    return;
  }

  pendingDispose = window.setTimeout(() => {
    if (sharedScoreReferences === 0) {
      sharedScore?.dispose();
      sharedScore = undefined;
    }
    pendingDispose = undefined;
  }, 80);
}

function midiToFrequency(midi: number) {
  return 440 * 2 ** ((midi - 69) / 12);
}
