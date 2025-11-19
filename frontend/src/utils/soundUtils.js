// frontend/src/utils/soundUtils.js
class SoundManager {
  constructor() {
    this.sounds = {};
    this.enabled = true;
    this.volume = 0.85;

    // Load notification sound
    this.loadSound("notification", "/sounds/notification.mp3");

    // Load settings from localStorage
    const savedEnabled = localStorage.getItem("soundEnabled");
    const savedVolume = localStorage.getItem("soundVolume");

    if (savedEnabled !== null) {
      this.enabled = savedEnabled === "true";
    }

    if (savedVolume !== null) {
      this.volume = parseFloat(savedVolume);
    }
  }

  loadSound(name, path) {
    const audio = new Audio(path);
    audio.volume = this.volume;
    audio.preload = "auto";

    // Handle load error
    audio.addEventListener("error", (e) => {
      console.error(`Failed to load sound: ${name}`, e);
    });

    this.sounds[name] = audio;
  }

  play(soundName) {
    if (!this.enabled) {
      console.log("🔇 Sounds are disabled");
      return;
    }

    const sound = this.sounds[soundName];

    if (!sound) {
      console.error(`Sound not found: ${soundName}`);
      return;
    }

    // Clone the audio to allow multiple simultaneous plays
    const audioClone = sound.cloneNode();
    audioClone.volume = this.volume;

    // Play and handle errors
    audioClone.play().catch((error) => {
      console.warn("Sound play failed:", error);
      // Autoplay might be blocked - user needs to interact first
    });
  }

  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume));
    localStorage.setItem("soundVolume", this.volume.toString());

    // Update volume for all loaded sounds
    Object.values(this.sounds).forEach((sound) => {
      sound.volume = this.volume;
    });
  }

  toggleEnabled() {
    this.enabled = !this.enabled;
    localStorage.setItem("soundEnabled", this.enabled.toString());
    return this.enabled;
  }

  setEnabled(enabled) {
    this.enabled = enabled;
    localStorage.setItem("soundEnabled", enabled.toString());
  }

  isEnabled() {
    return this.enabled;
  }
}

// Export singleton instance
const soundManager = new SoundManager();
export default soundManager;
