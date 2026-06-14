import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { documentService } from "../services/documentService";

function DocumentsPage() {
  const { user, usage, usageCountdown } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [question, setQuestion] = useState("");
  const [asking, setAsking] = useState(false);
  const [answer, setAnswer] = useState(null);
  const [showAskPanel, setShowAskPanel] = useState(false);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const response = await documentService.getDocuments();
      setDocuments(response.data);
    } catch (error) {
      console.error("Failed to fetch documents:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== "application/pdf") {
        alert("Only PDF files are allowed");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert("File size exceeds 5MB limit");
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (file.type !== "application/pdf") {
        alert("Only PDF files are allowed");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert("File size exceeds 5MB limit");
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      setUploading(true);
      await documentService.uploadDocument(selectedFile);
      setSelectedFile(null);
      fetchDocuments();
    } catch (error) {
      console.error("Failed to upload document:", error);
      alert(error.response?.data?.message || "Failed to upload document");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this document?")) return;
    try {
      await documentService.deleteDocument(id);
      fetchDocuments();
    } catch (error) {
      console.error("Failed to delete document:", error);
      alert("Failed to delete document");
    }
  };

  const handleAsk = async () => {
    if (!question.trim() || !selectedDocument) return;

    try {
      setAsking(true);
      const response = await documentService.askDocument(selectedDocument._id, question);
      setAnswer(response.data);
    } catch (error) {
      console.error("Failed to ask document:", error);
      alert(error.response?.data?.message || "Failed to get answer");
    } finally {
      setAsking(false);
    }
  };

  const openAskPanel = (document) => {
    setSelectedDocument(document);
    setQuestion("");
    setAnswer(null);
    setShowAskPanel(true);
  };

  const closeAskPanel = () => {
    setSelectedDocument(null);
    setQuestion("");
    setAnswer(null);
    setShowAskPanel(false);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-white">Documents</h1>
          <p className="mt-2 text-sm text-slate-400">
            Upload PDFs and ask questions from them
          </p>
        </div>
        {usage && (
          <div className="flex gap-3">
            <div className="rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-slate-300">
              PDF uploads today: {usage.pdfUploadsToday}/{usage.maxPdfUploadsPerDay}
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-slate-300">
              Document questions: {usage.documentCredits}/{usage.maxDocumentCredits}
            </div>
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Upload PDF</h2>
        <div
          className={`border-2 border-dashed rounded-xl p-8 text-center transition ${
            dragActive
              ? "border-sky-400 bg-sky-400/5"
              : "border-white/20 hover:border-white/30"
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileSelect}
            className="hidden"
            id="file-input"
          />
          <label
            htmlFor="file-input"
            className="cursor-pointer"
          >
            <p className="text-sm text-slate-300">
              {selectedFile ? selectedFile.name : "Drag & drop PDF here or click to select"}
            </p>
            <p className="mt-2 text-xs text-slate-500">
              Max file size: 5MB • PDF only
            </p>
          </label>
        </div>
        {selectedFile && (
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-300">{selectedFile.name}</span>
              <span className="text-xs text-slate-500">
                {formatFileSize(selectedFile.size)}
              </span>
            </div>
            <button
              type="button"
              onClick={handleUpload}
              disabled={uploading}
              className="rounded-xl bg-sky-400 px-4 py-2 text-sm font-medium text-slate-950 hover:bg-sky-400/90 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {uploading ? "Uploading..." : "Upload"}
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-slate-400">Loading documents...</p>
        </div>
      ) : documents.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-slate-900/70 py-12">
          <p className="text-lg font-medium text-white">No documents uploaded yet</p>
          <p className="mt-2 text-sm text-slate-400">
            Upload a PDF to ask questions from it
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {documents.map((doc) => (
            <article
              key={doc._id}
              className="rounded-2xl border border-white/10 bg-slate-900/70 p-6 hover:border-white/20 transition"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white">
                    {doc.originalName}
                  </h3>
                  <div className="mt-2 flex items-center gap-4 text-sm text-slate-400">
                    <span>{formatFileSize(doc.fileSize)}</span>
                    <span>{doc.chunksCount} chunks</span>
                    <span>{new Date(doc.uploadedAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => openAskPanel(doc)}
                    disabled={usage?.documentCredits === 0}
                    className="rounded-xl border border-sky-400/30 bg-sky-400/10 px-4 py-2 text-sm font-medium text-sky-300 hover:border-sky-400/50 hover:bg-sky-400/20 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    Ask
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(doc._id)}
                    className="rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-2 text-sm font-medium text-red-300 hover:border-red-400/50 hover:bg-red-400/20 transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {showAskPanel && selectedDocument && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur">
          <div className="w-full max-w-2xl rounded-2xl border border-white/10 bg-slate-900 p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">
                Ask: {selectedDocument.originalName}
              </h2>
              <button
                type="button"
                onClick={closeAskPanel}
                className="text-slate-400 hover:text-white transition"
              >
                ✕
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Your question
                </label>
                <textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  rows={3}
                  className="w-full rounded-xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-sky-400/50 focus:outline-none resize-none"
                  placeholder="What do you want to know about this document?"
                />
              </div>
              {usage?.documentCredits === 0 && (
                <p className="text-sm text-red-400">
                  Document credits finished. Credits will renew soon.
                </p>
              )}
              <button
                type="button"
                onClick={handleAsk}
                disabled={!question.trim() || asking || usage?.documentCredits === 0}
                className="w-full rounded-xl bg-sky-400 px-4 py-3 text-sm font-medium text-slate-950 hover:bg-sky-400/90 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {asking ? "Getting answer..." : "Ask"}
              </button>
              {answer && (
                <div className="rounded-xl border border-white/10 bg-slate-950/50 p-4">
                  <h3 className="text-sm font-semibold text-white mb-2">Answer</h3>
                  <p className="text-sm text-slate-300 whitespace-pre-wrap">
                    {answer.answer}
                  </p>
                  {answer.sources && answer.sources.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-xs font-semibold text-slate-400 mb-2">
                        Sources
                      </h4>
                      <div className="space-y-2">
                        {answer.sources.map((source, index) => (
                          <div
                            key={index}
                            className="rounded-lg border border-white/5 bg-slate-900/50 p-3"
                          >
                            <p className="text-xs text-slate-400">
                              {source.text}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {answer.usage && (
                    <div className="mt-4 text-xs text-slate-500">
                      Document credits remaining: {answer.usage.documentCredits}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DocumentsPage;
