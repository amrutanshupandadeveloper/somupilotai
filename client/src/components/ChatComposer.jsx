import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowUp, Check, ChevronDown, ChevronRight, Plus } from "lucide-react";
import { documentService } from "../services/documentService";
import {
  buildModelPresetOptions,
  buildProviderModelOptions,
  formatProviderName,
  normalizeModelPreset,
  prettifyModelName,
} from "../utils/modelPresets";

const getPresetMenuLabel = (presetKey) => {
  switch (normalizeModelPreset(presetKey)) {
    case "low":
      return "Instant";
    case "medium":
      return "Medium";
    case "high":
      return "High";
    default:
      return "Auto";
  }
};

const ProviderOptionIcon = ({ provider }) => {
  const normalizedProvider = String(provider || "").trim().toLowerCase();

  if (normalizedProvider === "gemini") {
    return (
      <span className="inline-flex h-5 w-5 items-center justify-center">
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="url(#gemini-gradient)">
          <defs>
            <linearGradient id="gemini-gradient" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="50%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#ec4899" />
            </linearGradient>
          </defs>
          <path d="M20.616 10.835a14.147 14.147 0 01-4.45-3.001 14.111 14.111 0 01-3.678-6.452.503.503 0 00-.975 0 14.134 14.134 0 01-3.679 6.452 14.155 14.155 0 01-4.45 3.001c-.65.28-1.318.505-2.002.678a.502.502 0 000 .975c.684.172 1.35.397 2.002.677a14.147 14.147 0 014.45 3.001 14.112 14.112 0 013.679 6.453.502.502 0 00.975 0c.172-.685.397-1.351.677-2.003a14.145 14.145 0 013.001-4.45 14.113 14.113 0 016.453-3.678.503.503 0 000-.975 13.245 13.245 0 01-2.003-.678z"></path>
        </svg>
      </span>
    );
  }

  if (normalizedProvider === "groq") {
    return (
      <span className="inline-flex h-5 w-5 items-center justify-center text-[#f55036]">
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
          <path d="M12.036 2c-3.853-.035-7 3-7.036 6.781-.035 3.782 3.055 6.872 6.908 6.907h2.42v-2.566h-2.292c-2.407.028-4.38-1.866-4.408-4.23-.029-2.362 1.901-4.298 4.308-4.326h.1c2.407 0 4.358 1.915 4.365 4.278v6.305c0 2.342-1.944 4.25-4.323 4.279a4.375 4.375 0 01-3.033-1.252l-1.851 1.818A7 7 0 0012.029 22h.092c3.803-.056 6.858-3.083 6.879-6.816v-6.5C18.907 4.963 15.817 2 12.036 2z" />
        </svg>
      </span>
    );
  }

  if (normalizedProvider === "openrouter") {
    return (
      <span className="inline-flex h-5 w-5 items-center justify-center">
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="url(#openrouter-gradient)">
          <defs>
            <linearGradient id="openrouter-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#a855f7" />
              <stop offset="100%" stopColor="#3b82f6" />
            </linearGradient>
          </defs>
          <path d="M16.804 1.957l7.22 4.105v.087L16.73 10.21l.017-2.117-.821-.03c-1.059-.028-1.611.002-2.268.11-1.064.175-2.038.577-3.147 1.352L8.345 11.03c-.284.195-.495.336-.68.455l-.515.322-.397.234.385.23.53.338c.476.314 1.17.796 2.701 1.866 1.11.775 2.083 1.177 3.147 1.352l.3.045c.694.091 1.375.094 2.825.033l.022-2.159 7.22 4.105v.087L16.589 22l.014-1.862-.635.022c-1.386.042-2.137.002-3.138-.162-1.694-.28-3.26-.926-4.881-2.059l-2.158-1.5a21.997 21.997 0 00-.755-.498l-.467-.28a55.927 55.927 0 00-.76-.43C2.908 14.73.563 14.116 0 14.116V9.888l.14.004c.564-.007 2.91-.622 3.809-1.124l1.016-.58.438-.274c.428-.28 1.072-.726 2.686-1.853 1.621-1.133 3.186-1.78 4.881-2.059 1.152-.19 1.974-.213 3.814-.138l.02-1.907z" />
        </svg>
      </span>
    );
  }

  if (normalizedProvider === "huggingface") {
    return (
      <span className="inline-flex h-5 w-5 items-center justify-center text-[#ffb900]">
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
          <path d="M16.781 3.277c2.997 1.704 4.844 4.851 4.844 8.258 0 .995-.155 1.955-.443 2.857a1.332 1.332 0 011.125.4 1.41 1.41 0 01.2 1.723c.204.165.352.385.428.632l.017.062c.06.222.12.69-.2 1.166.244.37.279.836.093 1.236-.255.57-.893 1.018-2.128 1.5l-.202.078-.131.048c-.478.173-.89.295-1.061.345l-.086.024c-.89.243-1.808.375-2.732.394-1.32 0-2.3-.36-2.923-1.067a9.852 9.852 0 01-3.18.018C9.778 21.647 8.802 22 7.494 22a11.249 11.249 0 01-2.541-.343l-.221-.06-.273-.08a16.574 16.574 0 01-1.175-.405c-1.237-.483-1.875-.93-2.13-1.501-.186-.4-.151-.867.093-1.236a1.42 1.42 0 01-.2-1.166c.069-.273.226-.516.447-.694a1.41 1.41 0 01.2-1.722c.233-.248.557-.391.917-.407l.078-.001a9.385 9.385 0 01-.44-2.85c0-3.407 1.847-6.554 4.844-8.258a9.822 9.822 0 019.687 0zM4.188 14.758c.125.687 2.357 2.35 2.14 2.707-.19.315-.796-.239-.948-.386l-.041-.04-.168-.147c-.561-.479-2.304-1.9-2.74-1.432-.43.46.119.859 1.055 1.42l.784.467.136.083c1.045.643 1.12.84.95 1.113-.188.295-3.07-2.1-3.34-1.083-.27 1.011 2.942 1.304 2.744 2.006-.2.7-2.265-1.324-2.685-.537-.425.79 2.913 1.718 2.94 1.725l.16.04.175.042c1.227.284 3.565.65 4.435-.604.673-.973.64-1.709-.248-2.61l-.057-.057c-.945-.928-1.495-2.288-1.495-2.288l-.017-.058-.025-.072c-.082-.22-.284-.639-.63-.584-.46.073-.798 1.21.12 1.933l.05.038c.977.721-.195 1.21-.573.534l-.058-.104-.143-.25c-.463-.799-1.282-2.111-1.739-2.397-.532-.332-.907-.148-.782.541zm14.842-.541c-.533.335-1.563 2.074-1.94 2.751a.613.613 0 01-.687.302.436.436 0 01-.176-.098.303.303 0 01-.049-.06l-.014-.028-.008-.02-.007-.019-.003-.013-.003-.017a.289.289 0 01-.004-.048c0-.12.071-.266.25-.427.026-.024.054-.047.084-.07l.047-.036c.022-.016.043-.032.063-.049.883-.71.573-1.81.131-1.917l-.031-.006-.056-.004a.368.368 0 00-.062.006l-.028.005-.042.014-.039.017-.028.015-.028.019-.036.027-.023.02c-.173.158-.273.428-.31.542l-.016.054s-.53 1.309-1.439 2.234l-.054.054c-.365.358-.596.69-.702 1.018-.143.437-.066.868.21 1.353.055.097.117.195.187.296.882 1.275 3.282.876 4.494.59l.286-.07.25-.074c.276-.084.736-.233 1.2-.42l.188-.077.065-.028.064-.028.124-.056.081-.038c.529-.252.964-.543.994-.827l.001-.036a.299.299 0 00-.037-.139c-.094-.176-.271-.212-.491-.168l-.045.01c-.044.01-.09.024-.136.04l-.097.035-.054.022c-.559.23-1.238.705-1.607.745h.006a.452.452 0 01-.05.003h-.024l-.024-.003-.023-.005c-.068-.016-.116-.06-.14-.142a.22.22 0 01-.005-.1c.062-.345.958-.595 1.713-.91l.066-.028c.528-.224.97-.483.985-.832v-.04a.47.47 0 00-.016-.098c-.048-.18-.175-.251-.36-.251-.785 0-2.55 1.36-2.92 1.36-.025 0-.048-.007-.058-.024a.6.6 0 01-.046-.088c-.1-.238.068-.462 1.06-1.066l.209-.126c.538-.32 1.01-.588 1.341-.831.29-.212.475-.406.503-.6l.003-.028c.008-.113-.038-.227-.147-.344a.266.266 0 00-.07-.054l-.034-.015-.013-.005a.403.403 0 00-.13-.02c-.162 0-.369.07-.595.18-.637.313-1.431.952-1.826 1.285l-.249.215-.033.033c-.08.078-.288.27-.493.386l-.071.037-.041.019a.535.535 0 01-.122.036h.005a.346.346 0 01-.031.003l.01-.001-.013.001c-.079.005-.145-.021-.19-.095a.113.113 0 01-.014-.065c.027-.465 2.034-1.991 2.152-2.642l.009-.048c.1-.65-.271-.817-.791-.493zM11.938 2.984c-4.798 0-8.688 3.829-8.688 8.55 0 .692.083 1.364.24 2.008l.008-.009c.252-.298.612-.46 1.017-.46.355.008.699.117.993.312.22.14.465.384.715.694.261-.372.69-.598 1.15-.605.852 0 1.367.728 1.562 1.383l.047.105.06.127c.192.396.595 1.139 1.143 1.68 1.06 1.04 1.324 2.115.8 3.266a8.865 8.865 0 002.024-.014c-.505-1.12-.26-2.17.74-3.186l.066-.066c.695-.684 1.157-1.69 1.252-1.912.195-.655.708-1.383 1.56-1.383.46.007.889.233 1.15.605.25-.31.495-.553.718-.694a1.87 1.87 0 01.99-.312c.357 0 .682.126.925.36.14-.61.215-1.245.215-1.898 0-4.722-3.89-8.55-8.687-8.55zm1.857 8.926l.439-.212c.553-.264.89-.383.89.152 0 1.093-.771 3.208-3.155 3.262h-.184c-2.325-.052-3.116-2.06-3.156-3.175l-.001-.087c0-1.107 1.452.586 3.25.586.716 0 1.379-.272 1.917-.526zm4.017-3.143c.45 0 .813.358.813.8 0 .441-.364.8-.813.8a.806.806 0 01-.812-.8c0-.442.364-.8.812-.8zm-11.624 0c.448 0 .812.358.812.8 0 .441-.364.8-.812.8a.806.806 0 01-.813-.8c0-.442.364-.8.813-.8zm7.79-.841c.32-.384.846-.54 1.33-.394.483.146.83.564.878 1.06.048.495-.212.97-.659 1.203-.322.168-.447-.477-.767-.585l.002-.003c-.287-.098-.772.362-.925.079a1.215 1.215 0 01.14-1.36zm-4.323 0c.322.384.377.92.14 1.36-.152.283-.64-.177-.925-.079l.003.003c-.108.036-.194.134-.273.24l-.118.165c-.11.15-.22.262-.377.18a1.226 1.226 0 01-.658-1.204c.048-.495.395-.913.878-1.059a1.262 1.262 0 011.33.394z" />
        </svg>
      </span>
    );
  }

  if (normalizedProvider === "mistral") {
    return (
      <span className="inline-flex h-5 w-5 items-center justify-center text-[#fd5e3a]">
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
          <path clipRule="evenodd" fillRule="evenodd" d="M3.428 3.4h3.429v3.428h3.429v3.429h-.002 3.431V6.828h3.427V3.4h3.43v13.714H24v3.429H13.714v-3.428h-3.428v-3.429h-3.43v3.428h3.43v3.429H0v-3.429h3.428V3.4zm10.286 13.715h3.428v-3.429h-3.427v3.429z" />
        </svg>
      </span>
    );
  }

  if (normalizedProvider === "ollama") {
    return (
      <span className="inline-flex h-5 w-5 items-center justify-center text-slate-100">
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
          <path d="M7.905 1.09c.216.085.411.225.588.41.295.306.544.744.734 1.263.191.522.315 1.1.362 1.68a5.054 5.054 0 012.049-.636l.051-.004c.87-.07 1.73.087 2.48.474.101.053.2.11.297.17.05-.569.172-1.134.36-1.644.19-.52.439-.957.733-1.264a1.67 1.67 0 01.589-.41c.257-.1.53-.118.796-.042.401.114.745.368 1.016.737.248.337.434.769.561 1.287.23.934.27 2.163.115 3.645l.053.04.026.019c.757.576 1.284 1.397 1.563 2.35.435 1.487.216 3.155-.534 4.088l-.018.021.002.003c.417.762.67 1.567.724 2.4l.002.03c.064 1.065-.2 2.137-.814 3.19l-.007.01.01.024c.472 1.157.62 2.322.438 3.486l-.006.039a.651.651 0 01-.747.536.648.648 0 01-.54-.742c.167-1.033.01-2.069-.48-3.123a.643.643 0 01.04-.617l.004-.006c.604-.924.854-1.83.8-2.72-.046-.779-.325-1.544-.8-2.273a.644.644 0 01.18-.886l.009-.006c.243-.159.467-.565.58-1.12a4.229 4.229 0 00-.095-1.974c-.205-.7-.58-1.284-1.105-1.683-.595-.454-1.383-.673-2.38-.61a.653.653 0 01-.632-.371c-.314-.665-.772-1.141-1.343-1.436a3.288 3.288 0 00-1.772-.332c-1.245.099-2.343.801-2.67 1.686a.652.652 0 01-.61.425c-1.067.002-1.893.252-2.497.703-.522.39-.878.935-1.066 1.588a4.07 4.07 0 00-.068 1.886c.112.558.331 1.02.582 1.269l.008.007c.212.207.257.53.109.785-.36.622-.629 1.549-.673 2.44-.05 1.018.186 1.902.719 2.536l.016.019a.643.643 0 01.095.69c-.576 1.236-.753 2.252-.562 3.052a.652.652 0 01-1.269.298c-.243-1.018-.078-2.184.473-3.498l.014-.035-.008-.012a4.339 4.339 0 01-.598-1.309l-.005-.019a5.764 5.764 0 01-.177-1.785c.044-.91.278-1.842.622-2.59l.012-.026-.002-.002c-.293-.418-.51-.953-.63-1.545l-.005-.024a5.352 5.352 0 01.093-2.49c.262-.915.777-1.701 1.536-2.269.06-.045.123-.09.186-.132-.159-1.493-.119-2.73.112-3.67.127-.518.314-.95.562-1.287.27-.368.614-.622 1.015-.737.266-.076.54-.059.797.042zm4.116 9.09c.936 0 1.8.313 2.446.855.63.527 1.005 1.235 1.005 1.94 0 .888-.406 1.58-1.133 2.022-.62.375-1.451.557-2.403.557-1.009 0-1.871-.259-2.493-.734-.617-.47-.963-1.13-.963-1.845 0-.707.398-1.417 1.056-1.946.668-.537 1.55-.849 2.485-.849zm0 .896a3.07 3.07 0 00-1.916.65c-.461.37-.722.835-.722 1.25 0 .428.21.829.61 1.134.455.347 1.124.548 1.943.548.799 0 1.473-.147 1.932-.426.463-.28.7-.686.7-1.257 0-.423-.246-.89-.683-1.256-.484-.405-1.14-.643-1.864-.643zm.662 1.21l.004.004c.12.151.095.37-.056.49l-.292.23v.446a.375.375 0 01-.376.373.375.375 0 01-.376-.373v-.46l-.271-.218a.347.347 0 01-.052-.49.353.353 0 01.494-.051l.215.172.22-.174a.353.353 0 01.49.051zm-5.04-1.919c.478 0 .867.39.867.871a.87.87 0 01-.868.871.87.87 0 01-.867-.87.87.87 0 01.867-.872zm8.706 0c.48 0 .868.39.868.871a.87.87 0 01-.868.871.87.87 0 01-.867-.87.87.87 0 01.867-.872zM7.44 2.3l-.003.002a.659.659 0 00-.285.238l-.005.006c-.138.189-.258.467-.348.832-.17.692-.216 1.631-.124 2.782.43-.128.899-.208 1.404-.237l.01-.001.019-.034c.046-.082.095-.161.148-.239.123-.771.022-1.692-.253-2.444-.134-.364-.297-.65-.453-.813a.628.628 0 00-.107-.09L7.44 2.3zm9.174.04l-.002.001a.628.628 0 00-.107.09c-.156.163-.32.45-.453.814-.29.794-.387 1.776-.23 2.572l.058.097.008.014h.03a5.184 5.184 0 011.466.212c.086-1.124.038-2.043-.128-2.722-.09-.365-.21-.643-.349-.832l-.004-.006a.659.659 0 00-.285-.239h-.004z" />
        </svg>
      </span>
    );
  }

  return (
    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/10 text-[10px] font-semibold text-[var(--menu-text-muted)]">
      AI
    </span>
  );
};

function ChatComposer({
  value,
  onChange,
  onSubmit,
  onProviderChange,
  selectedModelSelection,
  isSending,
  disabled,
  onUsageUpdate,
  providerStatus,
  attachedFile,
  setAttachedFile,
  attachmentStatus,
  setAttachmentStatus,
  isUploading,
  setIsUploading,
  onStop,
}) {
  const textareaRef = useRef(null);
  const composerRef = useRef(null);
  const fileInputRef = useRef(null);
  const [isAttachMenuOpen, setIsAttachMenuOpen] = useState(false);
  const [isModelMenuOpen, setIsModelMenuOpen] = useState(false);
  const [isProviderMenuOpen, setIsProviderMenuOpen] = useState(false);
  const [isAttachHovered, setIsAttachHovered] = useState(false);

  const modelOptions = useMemo(() => buildModelPresetOptions(providerStatus), [providerStatus]);
  const providerOptions = useMemo(() => buildProviderModelOptions(providerStatus), [providerStatus]);
  const activePreset =
    modelOptions.find((option) => option.key === normalizeModelPreset(selectedModelSelection?.preset)) ||
    modelOptions[0];
  const activeProvider =
    providerOptions.find((option) => option.provider === selectedModelSelection?.provider) || null;
  const activeDisplayProvider =
    selectedModelSelection?.mode === "custom"
      ? activeProvider
      : providerOptions.find((option) => option.provider === activePreset?.provider) || null;
  const visiblePresetOptions = modelOptions.filter((option) => option.key !== "auto");
  const selectorLabel = getPresetMenuLabel(activePreset?.key);
  const activeModelLabel =
    activeDisplayProvider?.modelName ||
    prettifyModelName(activeDisplayProvider?.model) ||
    activeDisplayProvider?.label ||
    formatProviderName(activePreset?.provider || "auto");

  useEffect(() => {
    if (!textareaRef.current) {
      return;
    }

    textareaRef.current.style.height = "0px";
    const nextHeight = Math.min(textareaRef.current.scrollHeight, 152);
    textareaRef.current.style.height = `${Math.max(nextHeight, 38)}px`;
  }, [value]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (!composerRef.current?.contains(event.target)) {
        setIsAttachMenuOpen(false);
        setIsModelMenuOpen(false);
        setIsProviderMenuOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setIsAttachMenuOpen(false);
        setIsModelMenuOpen(false);
        setIsProviderMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const canSend = useMemo(
    () => !disabled && !isSending && !isUploading && Boolean(value.trim()),
    [disabled, isSending, isUploading, value]
  );

  const getCooldownSeconds = (cooldown) => {
    const cooldownUntil = cooldown?.cooldownUntil;
    if (!cooldownUntil) {
      return 0;
    }

    return Math.max(0, Math.ceil((cooldownUntil - Date.now()) / 1000));
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      onSubmit();
    }
  };

  const clearAttachment = () => {
    setAttachedFile(null);
    setAttachmentStatus("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handlePdfSelection = async (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setAttachedFile({ name: file.name, type: "PDF" });
    setAttachmentStatus("Uploading PDF...");
    setIsUploading(true);
    setIsAttachMenuOpen(false);

    try {
      const response = await documentService.uploadDocument(file);
      setAttachmentStatus("PDF uploaded");
      if (response.data?.usage && onUsageUpdate) {
        onUsageUpdate(response.data.usage);
      }
      setAttachedFile({
        id: response.data._id,
        name: file.name,
        type: "PDF",
      });
      setAttachmentStatus("Attached to message");
    } catch (error) {
      setAttachmentStatus(error.response?.data?.message || "PDF upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  const handlePresetSelect = (presetOption) => {
    if (!presetOption) {
      return;
    }

    onProviderChange?.({
      mode: "preset",
      preset: presetOption.key,
    });
    setIsModelMenuOpen(false);
    setIsProviderMenuOpen(false);
  };

  const handleProviderSelect = (providerOption) => {
    if (!providerOption) {
      return;
    }

    onProviderChange?.({
      mode: "custom",
      preset: activePreset?.key || "medium",
      provider: providerOption.provider,
      model: providerOption.model || "",
    });
    setIsModelMenuOpen(false);
    setIsProviderMenuOpen(false);
  };

  return (
    <div className="relative z-20 overflow-visible px-4 pb-3 pt-2 xl:px-6">
      <div className="mx-auto max-w-[900px] overflow-visible" ref={composerRef}>
        <div
          className="rounded-[999px] border border-[var(--border)] px-3.5 py-2 shadow-[0_14px_50px_rgba(0,0,0,0.28)] transition focus-within:border-[var(--border)]"
          style={{ backgroundColor: "var(--surface-elevated)" }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,application/pdf"
            className="hidden"
            onChange={handlePdfSelection}
          />

          {attachedFile ? (
            <div className="mb-2.5 flex items-center gap-2 rounded-2xl border border-[var(--border)] px-3 py-2 text-xs text-[var(--text-soft)]">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/5">
                {attachedFile.type === "PDF" ? "PDF" : "FILE"}
              </span>
              <span className="max-w-[220px] truncate sm:max-w-[320px]">{attachedFile.name}</span>
              <span className="text-[var(--text-muted)]">{attachmentStatus}</span>
              <button
                type="button"
                onClick={clearAttachment}
                className="ml-auto rounded-full px-2 py-1 text-[var(--text-muted)] transition hover:bg-white/5 hover:text-[var(--text)]"
                aria-label="Remove attachment"
              >
                x
              </button>
            </div>
          ) : null}

          <div className="flex flex-col gap-1.5 md:flex-row md:items-center">
            <div className="relative flex items-center gap-2 md:flex-1">
              <div
                className="relative flex-shrink-0"
                onMouseEnter={() => setIsAttachHovered(true)}
                onMouseLeave={() => setIsAttachHovered(false)}
              >
                <button
                  type="button"
                  onClick={() => {
                    setIsAttachMenuOpen((current) => !current);
                    setIsModelMenuOpen(false);
                    setIsProviderMenuOpen(false);
                  }}
                  onFocus={() => setIsAttachHovered(true)}
                  onBlur={() => setIsAttachHovered(false)}
                  className={`inline-flex h-9 w-9 items-center justify-center rounded-full border transition ${
                    isAttachMenuOpen || isAttachHovered
                      ? "border-[var(--border-strong)] text-[var(--text)] shadow-[0_8px_20px_rgba(0,0,0,0.22)]"
                      : "border-transparent text-[var(--text)]"
                  }`}
                  style={{
                    backgroundColor:
                      isAttachMenuOpen || isAttachHovered ? "var(--surface-strong)" : "transparent",
                  }}
                  aria-label="Attach file"
                  title="Attach file"
                >
                  <Plus className="h-4 w-4 stroke-[2.2]" />
                </button>

                {isAttachHovered && !isAttachMenuOpen ? (
                  <div className="pointer-events-none absolute left-1/2 top-[calc(100%+10px)] z-20 -translate-x-1/2">
                    <div
                      className="inline-flex min-w-max items-center whitespace-nowrap rounded-full px-3 py-1.5 text-[12px] font-medium backdrop-blur-xl"
                      style={{
                        backgroundColor: "var(--tooltip-bg)",
                        color: "var(--tooltip-text)",
                        border: "1px solid var(--tooltip-border)",
                        boxShadow: "var(--tooltip-shadow)",
                      }}
                    >
                      <span>Add files and more</span>
                    </div>
                  </div>
                ) : null}
              </div>

              {isAttachMenuOpen ? (
                <div
                  className="absolute bottom-10 left-0 z-30 min-w-[195px] rounded-2xl border border-[var(--border)] p-2 shadow-[0_18px_40px_rgba(0,0,0,0.22)]"
                  style={{ backgroundColor: "var(--surface-elevated)" }}
                >
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex w-full items-center rounded-xl px-3 py-2.5 text-left text-sm text-[var(--text)] transition hover:bg-white/5"
                  >
                    <span className="mr-2.5 text-rose-400">PDF</span>
                    <span>Upload PDF</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAttachmentStatus("Image upload coming soon");
                      setAttachedFile({ name: "Image upload", type: "IMAGE" });
                      setIsAttachMenuOpen(false);
                    }}
                    className="flex w-full items-center rounded-xl px-3 py-2.5 text-left text-sm text-[var(--text)] transition hover:bg-white/5"
                  >
                    <span className="mr-2.5 text-emerald-400">IMG</span>
                    <span>Upload Image</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAttachmentStatus("Document upload coming soon");
                      setAttachedFile({ name: "Document upload", type: "DOC" });
                      setIsAttachMenuOpen(false);
                    }}
                    className="flex w-full items-center rounded-xl px-3 py-2.5 text-left text-sm text-[var(--text)] transition hover:bg-white/5"
                  >
                    <span className="mr-2.5 text-sky-400">DOC</span>
                    <span>Upload Document</span>
                  </button>
                </div>
              ) : null}

              <textarea
                ref={textareaRef}
                value={value}
                onChange={(event) => onChange(event.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
                placeholder="Ask anything..."
                className="min-h-[38px] flex-1 resize-none border-0 bg-transparent px-0.5 py-1.5 text-[15px] leading-6 text-[var(--text)] outline-none ring-0 placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-0"
                disabled={disabled}
                aria-label="Message SomuPilot"
              />
            </div>

            <div className="flex items-center justify-end gap-2">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setIsModelMenuOpen((current) => !current);
                    setIsProviderMenuOpen(false);
                    setIsAttachMenuOpen(false);
                  }}
                  className={`inline-flex h-10 items-center gap-2 rounded-full px-3.5 text-left text-[15px] text-[var(--text)] transition ${
                    isModelMenuOpen
                      ? "border border-[var(--border-strong)] bg-[color:var(--hover)] shadow-[0_10px_24px_rgba(0,0,0,0.22)]"
                      : "border border-transparent bg-transparent hover:border-[var(--border)] hover:bg-[color:var(--hover)]"
                  }`}
                  aria-label="Open model selection"
                >
                  <span className="block truncate text-[15px] font-medium leading-none">
                    {selectorLabel}
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 flex-shrink-0 text-[var(--text-muted)] transition-transform ${isModelMenuOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {isModelMenuOpen ? (
                  <div
                    className="absolute bottom-[calc(100%+18px)] right-0 z-40 w-[216px] rounded-[22px] border border-[var(--border)] p-2.5 shadow-[0_24px_60px_rgba(0,0,0,0.42)] backdrop-blur-xl"
                    style={{ backgroundColor: "var(--menu-surface)" }}
                  >
                    <p className="px-2 pb-2 text-[12px] text-[var(--menu-text-muted)]">Intelligence</p>

                    <div className="space-y-1">
                      {visiblePresetOptions.map((option) => {
                        const isSelected =
                          selectedModelSelection?.mode !== "custom" &&
                          normalizeModelPreset(selectedModelSelection?.preset) === option.key;
                        const cooldownSeconds = getCooldownSeconds(option.cooldown);
                        const disabledOption = !option.configured || cooldownSeconds > 0;

                        return (
                          <button
                            key={option.key}
                            type="button"
                            disabled={disabledOption}
                            onClick={() => handlePresetSelect(option)}
                            className="flex w-full items-center justify-between rounded-2xl px-2 py-1.5 text-left text-[14px] text-[var(--menu-text)] transition disabled:cursor-not-allowed disabled:opacity-45"
                            style={{ ["--menu-hover-bg"]: "var(--menu-hover)" }}
                          >
                            <span>{getPresetMenuLabel(option.key)}</span>
                            {isSelected ? (
                              <Check className="h-4 w-4 text-[var(--menu-text)]" />
                            ) : cooldownSeconds > 0 ? (
                              <span className="text-[11px] text-[var(--menu-text-muted)]">{cooldownSeconds}s</span>
                            ) : null}
                          </button>
                        );
                      })}
                    </div>

                    <div className="my-3 border-t border-white/10" />

                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setIsProviderMenuOpen((current) => !current)}
                        className={`flex w-full items-center justify-between rounded-2xl px-2 py-1.5 text-left text-[14px] transition ${
                          selectedModelSelection?.mode === "custom"
                            ? "text-[var(--menu-text)]"
                            : "text-[var(--menu-text)]"
                        }`}
                        style={{
                          backgroundColor:
                            selectedModelSelection?.mode === "custom" ? "var(--menu-hover)" : "transparent",
                        }}
                      >
                        <span className="min-w-0 truncate">
                          {activeModelLabel}
                        </span>
                        <ChevronRight className="h-4 w-4 text-[var(--menu-text-muted)]" />
                      </button>

                      {isProviderMenuOpen ? (
                        <div
                          className="absolute bottom-0 left-[calc(100%+8px)] z-50 w-[190px] rounded-[22px] border border-[var(--border)] p-2 shadow-[0_24px_60px_rgba(0,0,0,0.42)] backdrop-blur-xl"
                          style={{ backgroundColor: "var(--menu-surface-strong)" }}
                        >
                          <div className="no-scrollbar max-h-[240px] overflow-y-auto">
                            {providerOptions.map((option) => {
                              const isSelected =
                                selectedModelSelection?.mode === "custom" &&
                                activeProvider?.provider === option.provider;
                              const cooldownSeconds = getCooldownSeconds(option.cooldown);
                              const disabledOption = !option.configured || cooldownSeconds > 0;

                              return (
                                <button
                                  key={option.provider}
                                  type="button"
                                  disabled={disabledOption}
                                  onClick={() => handleProviderSelect(option)}
                                  className="flex w-full items-center justify-between rounded-2xl px-2.5 py-2 text-left text-[14px] text-[var(--menu-text)] transition disabled:cursor-not-allowed disabled:opacity-45"
                                >
                                  <span className="flex min-w-0 items-center gap-2 truncate">
                                    <ProviderOptionIcon provider={option.provider} />
                                    <span className="truncate">{option.label}</span>
                                  </span>
                                  {isSelected ? (
                                    <Check className="h-4 w-4 text-[var(--menu-text)]" />
                                  ) : cooldownSeconds > 0 ? (
                                    <span className="text-[11px] text-[var(--menu-text-muted)]">{cooldownSeconds}s</span>
                                  ) : null}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </div>
                ) : null}
              </div>

              <button
                type="button"
                onClick={isSending ? onStop : onSubmit}
                disabled={isSending ? false : !canSend}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border transition hover:brightness-105 disabled:cursor-not-allowed disabled:border-[var(--border)] disabled:bg-[var(--surface-elevated)] disabled:text-[var(--text-muted)] disabled:shadow-none"
                style={{
                  backgroundColor:
                    canSend || isSending ? "var(--send-button-bg)" : "var(--surface-elevated)",
                  color: canSend || isSending ? "var(--send-button-text)" : "var(--text-muted)",
                  borderColor:
                    canSend || isSending ? "var(--send-button-border)" : "var(--border)",
                  boxShadow:
                    canSend || isSending ? "var(--send-button-shadow)" : "none",
                }}
                aria-label={isSending ? "Stop generating" : "Send message"}
              >
                {isSending ? (
                  <span
                    aria-hidden="true"
                    className="inline-block h-3 w-3 rounded-[2px]"
                    style={{ backgroundColor: "var(--send-button-text)" }}
                  />
                ) : (
                  <ArrowUp className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
        </div>

        <p className="px-2 pt-2 text-center text-[10px] text-[var(--text-muted)]">
          SomuPilot can make mistakes. Verify important information.
        </p>
      </div>
    </div>
  );
}

export default ChatComposer;
