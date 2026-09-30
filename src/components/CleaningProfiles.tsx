import React, { useRef, useState } from 'react';
import {
  Bookmark,
  Plus,
  Trash2,
  Download,
  Upload,
  Check,
  X,
} from 'lucide-react';
import { CleaningProfile, ColumnRuleMap } from '../types/dataCleaner';

interface CleaningProfilesProps {
  isOpen: boolean;
  onClose: () => void;
  profiles: CleaningProfile[];
  onSaveProfiles: (profiles: CleaningProfile[]) => void;
  currentRules: ColumnRuleMap;
  onApplyProfile: (profile: CleaningProfile) => void;
}

export const CleaningProfiles: React.FC<CleaningProfilesProps> = ({
  isOpen,
  onClose,
  profiles,
  onSaveProfiles,
  currentRules,
  onApplyProfile,
}) => {
  const [profileName, setProfileName] = useState('');
  const [profileDesc, setProfileDesc] = useState('');
  const [selectedProfileId, setSelectedProfileId] = useState<string>(
    profiles[0]?.id || ''
  );
  const importFileRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleSaveCurrentAsProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileName.trim()) return;

    const newProfile: CleaningProfile = {
      id: `profile_${Date.now()}`,
      name: profileName.trim(),
      description: profileDesc.trim() || 'Custom user cleaning rules profile',
      rules: { ...currentRules },
    };

    const updated = [...profiles, newProfile];
    onSaveProfiles(updated);
    setSelectedProfileId(newProfile.id);
    setProfileName('');
    setProfileDesc('');
    alert(`Profile "${newProfile.name}" saved!`);
  };

  const handleDeleteProfile = (id: string) => {
    const updated = profiles.filter((p) => p.id !== id);
    onSaveProfiles(updated);
    if (selectedProfileId === id) {
      setSelectedProfileId(updated[0]?.id || '');
    }
  };

  const handleExportProfile = (profile: CleaningProfile) => {
    const blob = new Blob([JSON.stringify(profile, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${profile.name.toLowerCase().replace(/\s+/g, '_')}_profile.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportProfile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.name && parsed.rules) {
          const imported: CleaningProfile = {
            id: `profile_${Date.now()}`,
            name: parsed.name,
            description: parsed.description || 'Imported profile',
            rules: parsed.rules,
          };
          onSaveProfiles([...profiles, imported]);
          setSelectedProfileId(imported.id);
          alert(`Profile "${imported.name}" imported successfully!`);
        } else {
          alert('Invalid profile JSON structure.');
        }
      } catch (err) {
        alert('Failed to parse JSON file.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const currentSelectedProfile = profiles.find((p) => p.id === selectedProfileId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="w-full max-w-2xl max-h-[85vh] rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xl flex flex-col text-slate-900 dark:text-slate-100 overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-500/10 border border-amber-300 dark:border-amber-500/20 flex items-center justify-center">
              <Bookmark className="w-4 h-4 text-amber-700 dark:text-amber-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Cleaning Profiles</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Save, load, import, and export reusable column rule configurations.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
          {/* Save Current Rules as Profile */}
          <div className="bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-3">
            <h4 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
              Save Current Rules as New Profile
            </h4>
            <form onSubmit={handleSaveCurrentAsProfile} className="space-y-2.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <input
                  type="text"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  placeholder="Profile Name (e.g. Subsidy Scheme 2026)"
                  className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-1.5 text-slate-900 dark:text-slate-200 placeholder:text-slate-400 text-xs focus:border-cyan-500"
                />
                <input
                  type="text"
                  value={profileDesc}
                  onChange={(e) => setProfileDesc(e.target.value)}
                  placeholder="Description (optional)"
                  className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-1.5 text-slate-900 dark:text-slate-200 placeholder:text-slate-400 text-xs focus:border-cyan-500"
                />
              </div>
              <button
                type="submit"
                disabled={!profileName.trim()}
                className="px-3.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                Save Profile
              </button>
            </form>
          </div>

          {/* Existing Profiles List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Saved Profiles ({profiles.length})
              </h4>
              <button
                onClick={() => importFileRef.current?.click()}
                className="flex items-center gap-1 text-xs text-cyan-700 dark:text-cyan-400 font-bold hover:underline"
              >
                <Upload className="w-3 h-3" />
                <span>Import Profile JSON</span>
              </button>
              <input
                type="file"
                ref={importFileRef}
                onChange={handleImportProfile}
                accept=".json"
                className="hidden"
              />
            </div>

            <div className="space-y-2">
              {profiles.map((p) => {
                const isSelected = p.id === selectedProfileId;
                const ruleCount = Object.keys(p.rules).length;

                return (
                  <div
                    key={p.id}
                    onClick={() => setSelectedProfileId(p.id)}
                    className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-cyan-50 dark:bg-cyan-950/40 border-cyan-400 dark:border-cyan-500 text-slate-900 dark:text-slate-100 shadow-xs'
                        : 'bg-slate-50/70 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 dark:text-white text-sm">{p.name}</span>
                        {p.isDefault && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800/60 font-bold">
                            Built-in
                          </span>
                        )}
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                          ({ruleCount} columns configured)
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleExportProfile(p)}
                          className="p-1 rounded text-slate-500 hover:text-cyan-600 dark:hover:text-cyan-400"
                          title="Export Profile JSON"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                        {!p.isDefault && (
                          <button
                            onClick={() => handleDeleteProfile(p.id)}
                            className="p-1 rounded text-slate-500 hover:text-rose-600 dark:hover:text-rose-400"
                            title="Delete Profile"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1">{p.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-300 font-bold transition"
          >
            Cancel
          </button>

          {currentSelectedProfile && (
            <button
              onClick={() => {
                onApplyProfile(currentSelectedProfile);
                onClose();
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white font-bold transition shadow-md shadow-cyan-600/20"
            >
              <Check className="w-4 h-4" />
              <span>Apply "{currentSelectedProfile.name}"</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
