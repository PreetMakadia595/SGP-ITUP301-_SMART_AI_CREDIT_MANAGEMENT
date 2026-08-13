/**
 * Credit Log Modal — Form for manually adding and editing credit usage records
 */
import { useEffect, useState } from "react";
import { X, Plus, Save, Sparkles } from "lucide-react";
import {
  CreditUsageLog,
  CreditUsageLogCreate,
  PRESET_PLATFORMS,
  PRESET_TASK_TYPES,
  PRESET_MODELS_BY_PLATFORM,
} from "@/types/credit";

interface CreditLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CreditUsageLogCreate) => Promise<void>;
  initialData?: CreditUsageLog | null;
}

export default function CreditLogModal({
  isOpen,
  onClose,
  onSave,
  initialData,
}: CreditLogModalProps) {
  const isEditing = Boolean(initialData);

  const getTodayString = () => new Date().toISOString().split("T")[0];

  const [platform, setPlatform] = useState("OpenAI");
  const [customPlatform, setCustomPlatform] = useState("");
  const [model, setModel] = useState("gpt-4o");
  const [customModel, setCustomModel] = useState("");
  const [projectName, setProjectName] = useState("");
  const [taskType, setTaskType] = useState("Code Generation");
  const [customTaskType, setCustomTaskType] = useState("");
  const [creditsUsed, setCreditsUsed] = useState<number | "">(1.0);
  const [promptCount, setPromptCount] = useState<number | "">(1);
  const [tokenUsage, setTokenUsage] = useState<number | "">(1500);
  const [usageDate, setUsageDate] = useState(getTodayString());
  const [notes, setNotes] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      const isPresetPlat = PRESET_PLATFORMS.includes(initialData.platform);
      setPlatform(isPresetPlat ? initialData.platform : "Other");
      setCustomPlatform(isPresetPlat ? "" : initialData.platform);

      const modelsForPlat = PRESET_MODELS_BY_PLATFORM[initialData.platform] || [];
      const isPresetMod = modelsForPlat.includes(initialData.model);
      setModel(isPresetMod ? initialData.model : "Custom");
      setCustomModel(isPresetMod ? "" : initialData.model);

      setProjectName(initialData.project_name);

      const isPresetTask = PRESET_TASK_TYPES.includes(initialData.task_type);
      setTaskType(isPresetTask ? initialData.task_type : "Other");
      setCustomTaskType(isPresetTask ? "" : initialData.task_type);

      setCreditsUsed(initialData.credits_used);
      setPromptCount(initialData.prompt_count);
      setTokenUsage(initialData.token_usage);
      setUsageDate(initialData.usage_date);
      setNotes(initialData.notes || "");
    } else {
      // Reset defaults
      setPlatform("OpenAI");
      setCustomPlatform("");
      setModel("gpt-4o");
      setCustomModel("");
      setProjectName("");
      setTaskType("Code Generation");
      setCustomTaskType("");
      setCreditsUsed(1.0);
      setPromptCount(1);
      setTokenUsage(1500);
      setUsageDate(getTodayString());
      setNotes("");
    }
    setError(null);
  }, [initialData, isOpen]);

  // When platform changes, adjust model options
  const handlePlatformChange = (val: string) => {
    setPlatform(val);
    if (val !== "Other" && PRESET_MODELS_BY_PLATFORM[val]) {
      setModel(PRESET_MODELS_BY_PLATFORM[val][0]);
    } else {
      setModel("Custom");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const finalPlatform = platform === "Other" ? customPlatform.trim() : platform;
    if (!finalPlatform) {
      setError("Platform name is required.");
      return;
    }

    const finalModel = (model === "Custom" || platform === "Other") ? customModel.trim() : model;
    if (!finalModel) {
      setError("Model name is required.");
      return;
    }

    const finalProjectName = projectName.trim() || "General Project";
    const finalTaskType = taskType === "Other" ? customTaskType.trim() || "General" : taskType;

    const numCredits = typeof creditsUsed === "number" ? creditsUsed : parseFloat(creditsUsed || "0");
    if (isNaN(numCredits) || numCredits < 0) {
      setError("Credits used must be a non-negative number.");
      return;
    }

    const numPrompts = typeof promptCount === "number" ? promptCount : parseInt(promptCount || "0", 10);
    if (isNaN(numPrompts) || numPrompts < 0) {
      setError("Prompt count must be a non-negative number.");
      return;
    }

    const numTokens = typeof tokenUsage === "number" ? tokenUsage : parseInt(tokenUsage || "0", 10);
    if (isNaN(numTokens) || numTokens < 0) {
      setError("Token usage must be a non-negative number.");
      return;
    }

    if (!usageDate) {
      setError("Date is required.");
      return;
    }

    setSubmitting(true);
    try {
      await onSave({
        platform: finalPlatform,
        model: finalModel,
        project_name: finalProjectName,
        task_type: finalTaskType,
        credits_used: numCredits,
        prompt_count: numPrompts,
        token_usage: numTokens,
        usage_date: usageDate,
        notes: notes.trim() || null,
      });
      onClose();
    } catch (err: unknown) {
      setError("Failed to save record. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const currentModels = PRESET_MODELS_BY_PLATFORM[platform] || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-surface-800 border border-white/10 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-surface-700/40">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-brand flex items-center justify-center text-white shadow-glow">
              <Sparkles size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {isEditing ? "Edit Credit Usage Record" : "Add Credit Usage Record"}
              </h3>
              <p className="text-xs text-slate-400">
                {isEditing ? "Update your AI credit entry details" : "Manually log AI model usage and credit metrics"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs font-medium">
              {error}
            </div>
          )}

          {/* Platform & Model */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Platform <span className="text-brand-400">*</span>
              </label>
              <select
                value={platform}
                onChange={(e) => handlePlatformChange(e.target.value)}
                className="input-field text-sm"
              >
                {PRESET_PLATFORMS.map((p) => (
                  <option key={p} value={p} className="bg-surface-800 text-white">
                    {p}
                  </option>
                ))}
              </select>
              {platform === "Other" && (
                <input
                  type="text"
                  placeholder="Enter custom platform"
                  value={customPlatform}
                  onChange={(e) => setCustomPlatform(e.target.value)}
                  className="input-field text-sm mt-2"
                />
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Model <span className="text-brand-400">*</span>
              </label>
              {platform !== "Other" && currentModels.length > 0 ? (
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="input-field text-sm"
                >
                  {currentModels.map((m) => (
                    <option key={m} value={m} className="bg-surface-800 text-white">
                      {m}
                    </option>
                  ))}
                  <option value="Custom" className="bg-surface-800 text-white">
                    Custom Model...
                  </option>
                </select>
              ) : null}
              {(model === "Custom" || platform === "Other" || currentModels.length === 0) && (
                <input
                  type="text"
                  placeholder="e.g. gpt-4o, claude-3-5-sonnet"
                  value={customModel}
                  onChange={(e) => setCustomModel(e.target.value)}
                  className="input-field text-sm mt-2"
                />
              )}
            </div>
          </div>

          {/* Project Name & Task Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Project Name
              </label>
              <input
                type="text"
                placeholder="e.g. E-Commerce Bot, Mobile App"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="input-field text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Task Type
              </label>
              <select
                value={taskType}
                onChange={(e) => setTaskType(e.target.value)}
                className="input-field text-sm"
              >
                {PRESET_TASK_TYPES.map((t) => (
                  <option key={t} value={t} className="bg-surface-800 text-white">
                    {t}
                  </option>
                ))}
              </select>
              {taskType === "Other" && (
                <input
                  type="text"
                  placeholder="Enter task type"
                  value={customTaskType}
                  onChange={(e) => setCustomTaskType(e.target.value)}
                  className="input-field text-sm mt-2"
                />
              )}
            </div>
          </div>

          {/* Credits Used, Prompt Count, Token Usage */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Credits Used <span className="text-brand-400">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={creditsUsed}
                onChange={(e) => setCreditsUsed(e.target.value === "" ? "" : parseFloat(e.target.value))}
                className="input-field text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Prompt Count
              </label>
              <input
                type="number"
                min="0"
                value={promptCount}
                onChange={(e) => setPromptCount(e.target.value === "" ? "" : parseInt(e.target.value, 10))}
                className="input-field text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Token Usage
              </label>
              <input
                type="number"
                min="0"
                value={tokenUsage}
                onChange={(e) => setTokenUsage(e.target.value === "" ? "" : parseInt(e.target.value, 10))}
                className="input-field text-sm"
              />
            </div>
          </div>

          {/* Usage Date */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Date <span className="text-brand-400">*</span>
            </label>
            <input
              type="date"
              value={usageDate}
              onChange={(e) => setUsageDate(e.target.value)}
              className="input-field text-sm"
              required
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Notes / Context
            </label>
            <textarea
              rows={2}
              placeholder="Add optional description, parameters or task details..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="input-field text-sm resize-none"
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary text-sm px-4 py-2"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary text-sm px-5 py-2 flex items-center gap-2"
              disabled={submitting}
            >
              {submitting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : isEditing ? (
                <>
                  <Save size={16} /> Update Record
                </>
              ) : (
                <>
                  <Plus size={16} /> Add Record
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
