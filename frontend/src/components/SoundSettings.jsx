// frontend/src/components/SoundSettings.jsx
import { useState } from "react";
import soundManager from "../utils/soundUtils";

const SoundSettings = () => {
  const [enabled, setEnabled] = useState(soundManager.isEnabled());
  const [volume, setVolume] = useState(soundManager.volume);

  const handleToggle = () => {
    const newEnabled = soundManager.toggleEnabled();
    setEnabled(newEnabled);
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    soundManager.setVolume(newVolume);
  };

  const handleTestSound = () => {
    soundManager.play("notification");
  };

  return (
    <div className="p-4 border border-theme rounded-lg bg-theme">
      <h3 className="font-semibold text-theme mb-3">Notification Sound</h3>

      {/* Enable/Disable Toggle */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-theme-secondary">Enable Sounds</span>
        <button
          onClick={handleToggle}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            enabled ? "bg-primary" : "bg-gray-300"
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              enabled ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
      </div>

      {/* Volume Slider */}
      {enabled && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-theme-secondary">Volume</span>
            <span className="text-sm text-theme">
              {Math.round(volume * 100)}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={handleVolumeChange}
            className="w-full"
          />
        </div>
      )}

      {/* Test Button */}
      <button
        onClick={handleTestSound}
        disabled={!enabled}
        className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
      >
        Test Sound
      </button>
    </div>
  );
};

export default SoundSettings;
