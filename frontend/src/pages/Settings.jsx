// frontend/src/pages/Settings.jsx (or wherever you have settings)
import SoundSettings from "../components/SoundSettings";

const Settings = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      {/* Other settings... */}

      <SoundSettings />
    </div>
  );
};

export default Settings;
