import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { documentService } from "../services/documentService";
import { getFriendlyAiErrorMessage } from "../utils/aiError";
import { PageHeader } from "../components/ui/PageHeader";
import { SectionCard } from "../components/ui/SectionCard";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { EmptyState } from "../components/ui/EmptyState";
import { ListSkeleton, PageHeaderSkeleton, LoadingSkeleton } from "../components/ui/LoadingSkeleton";
import { ConfirmModal } from "../components/ui/ConfirmModal";
import UserTopBarActions from "../components/UserTopBarActions";

function DocumentsPage() {
  const { setTopBarConfig, resetTopBarConfig } = useOutletContext();
  const { usage, usageCountdown, setUsage } = useAuth();
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
  const [askError, setAskError] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const response = await documentService.getDocuments();
      setDocuments(response.data || []);
    } catch (error) {
      console.error("Failed to fetch documents:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  useEffect(() => {
    setTopBarConfig({
      title: "Documents",
      subtitle: "SomuPilot AI",
      showUsage: false,
      rightSlot: (
        <UserTopBarActions
          usage={usage}
          secondaryContent={
            <div className="hidden items-center gap-2 sm:flex">
              <Badge variant="default">
                PDF {usage?.pdfUploadsToday || 0}/{usage?.maxPdfUploadsPerDay || 0}
              </Badge>
              <Badge variant="info">
                Q&A {usage?.documentCredits || 0}/{usage?.maxDocumentCredits || 0}
              </Badge>
            </div>
          }
        />
      ),
    });

    return () => resetTopBarConfig();
  }, [usage?.pdfUploadsToday, usage?.maxPdfUploadsPerDay, usage?.documentCredits, usage?.maxDocumentCredits]);

  const validateFile = (file) => {
    if (!file) {
      return false;
    }

    if (file.type !== "application/pdf") {
      alert("Only PDF files are allowed");
      return false;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("File size exceeds 5MB limit");
      return false;
    }

    return true;
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      return;
    }

    try {
      setUploading(true);
      const response = await documentService.uploadDocument(selectedFile);
      if (response.data?.usage) {
        setUsage(response.data.usage);
      }
      setSelectedFile(null);
      await fetchDocuments();
    } catch (error) {
      console.error("Failed to upload document:", error);
      alert(error.response?.data?.message || "Failed to upload document");
    } finally {
      setUploading(false);
    }
  };

  const confirmDelete = async () => {
    try {
      await documentService.deleteDocument(deleteConfirm);
      setDeleteConfirm(null);
      await fetchDocuments();
    } catch (error) {
      console.error("Failed to delete document:", error);
      alert("Failed to delete document");
    }
  };

  const handleAsk = async () => {
    if (!question.trim() || !selectedDocument) {
      return;
    }

    try {
      setAsking(true);
      setAskError("");
      const response = await documentService.askDocument(selectedDocument._id, question);
      setAnswer(response.data);
      if (response.data?.usage) {
        setUsage(response.data.usage);
      }
    } catch (error) {
      const usageData = error.response?.data?.usage || error.response?.data?.data?.usage;

      if (usageData?.nextResetAt) {
        setUsage((currentUsage) => ({
          ...(currentUsage || {}),
          ...usageData,
        }));
      }

      setAskError(
        getFriendlyAiErrorMessage(
          error,
          "AI could not respond right now. Please try again."
        )
      );
    } finally {
      setAsking(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) {
      return "0 Bytes";
    }

    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${Math.round((bytes / Math.pow(k, i)) * 100) / 100} ${sizes[i]}`;
  };

  return (
    <div className="space-y-6">
      {loading ? (
        <PageHeaderSkeleton />
      ) : (
        <PageHeader
          title="Documents"
          subtitle="Upload PDFs, keep source material organized, and ask precise questions grounded in your files."
        />
      )}

      <SectionCard title="Upload PDF">
        {loading ? (
          <div className="rounded-[28px] border-2 border-dashed border-[var(--border)] bg-white/5 p-8 text-center">
            <LoadingSkeleton className="mx-auto h-5 w-64 rounded-xl" />
            <LoadingSkeleton className="mx-auto mt-4 h-4 w-72 rounded-xl" />
          </div>
        ) : (
          <div
            className={`rounded-[28px] border-2 border-dashed p-8 text-center transition ${
              dragActive
                ? "border-emerald-400/45 bg-emerald-500/8"
                : "border-[var(--border)] bg-white/5 hover:border-[var(--border-strong)]"
            }`}
            onDragEnter={(event) => {
              event.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={(event) => {
              event.preventDefault();
              setDragActive(false);
            }}
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault();
              setDragActive(false);
              const file = event.dataTransfer.files?.[0];
              if (validateFile(file)) {
                setSelectedFile(file);
              }
            }}
          >
            <input
              type="file"
              accept=".pdf"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (validateFile(file)) {
                  setSelectedFile(file);
                }
              }}
              className="hidden"
              id="pdf-upload-input"
            />
            <label htmlFor="pdf-upload-input" className="cursor-pointer">
              <p className="text-base font-medium text-[var(--text)]">
                {selectedFile ? selectedFile.name : "Drop a PDF here or click to select one"}
              </p>
              <p className="mt-3 text-sm text-[var(--text-muted)]">
                Max 5MB. {usage?.documentCredits || 0} document credits left. Renews in {usageCountdown}.
              </p>
            </label>
          </div>
        )}

        {selectedFile ? (
          <div className="mt-4 flex flex-col gap-3 rounded-[24px] border border-[var(--border)] bg-white/5 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-[var(--text)]">{selectedFile.name}</p>
              <p className="mt-1 text-xs text-[var(--text-muted)]">
                {formatFileSize(selectedFile.size)}
              </p>
            </div>
            <Button onClick={handleUpload} disabled={uploading}>
              {uploading ? "Uploading..." : "Upload PDF"}
            </Button>
          </div>
        ) : null}
      </SectionCard>

      {loading ? (
        <ListSkeleton count={6} />
      ) : documents.length === 0 ? (
        <EmptyState
          icon="D"
          title="No documents uploaded yet"
          description="Upload your first PDF to start asking grounded questions from source material."
        />
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {documents.map((document) => (
            <article key={document._id} className="app-card rounded-[28px] p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h3 className="truncate text-lg font-semibold text-[var(--text)]">
                    {document.originalName}
                  </h3>
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-[var(--text-muted)]">
                    <span>{formatFileSize(document.fileSize)}</span>
                    <Badge variant="success">{document.chunksCount} chunks</Badge>
                    <span>{new Date(document.uploadedAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setSelectedDocument(document);
                      setQuestion("");
                      setAnswer(null);
                      setAskError("");
                      setShowAskPanel(true);
                    }}
                    disabled={usage?.documentCredits === 0}
                  >
                    Ask
                  </Button>
                  <Button size="sm" variant="danger" onClick={() => setDeleteConfirm(document._id)}>
                    Delete
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {showAskPanel && selectedDocument ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/84 p-4 backdrop-blur">
          <div className="app-card w-full max-w-3xl rounded-[32px] p-6 sm:p-7">
            <div className="mb-6 flex items-center justify-between gap-3">
              <div>
                <p className="app-kicker">Document Q&A</p>
                <h2 className="mt-2 text-2xl font-semibold text-[var(--text)]">
                  {selectedDocument.originalName}
                </h2>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedDocument(null);
                  setQuestion("");
                  setAnswer(null);
                  setAskError("");
                  setShowAskPanel(false);
                }}
              >
                Close
              </Button>
            </div>

            <div className="space-y-4">
              <textarea
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                rows={4}
                className="app-input min-h-[120px] resize-none"
                placeholder="Ask a question grounded in this document"
              />

              {usage?.documentCredits === 0 ? (
                <p className="text-sm text-rose-300">
                  Document credits are finished. Please wait until they renew.
                </p>
              ) : null}

              {askError ? (
                <div className="rounded-2xl border border-amber-400/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
                  {askError}
                </div>
              ) : null}

              <div className="flex items-center justify-between gap-3">
                <p className="text-xs text-[var(--text-muted)]">
                  {usage?.documentCredits || 0}/{usage?.maxDocumentCredits || 0} document credits
                </p>
                <Button onClick={handleAsk} disabled={!question.trim() || asking || usage?.documentCredits === 0}>
                  {asking ? "Thinking..." : "Ask document"}
                </Button>
              </div>

              {answer ? (
                <div className="rounded-[28px] border border-[var(--border)] bg-white/5 p-5">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-base font-semibold text-[var(--text)]">Answer</h3>
                    {answer.providerUsed ? (
                      <Badge variant="info">
                        {answer.providerUsed.charAt(0).toUpperCase() + answer.providerUsed.slice(1)}
                      </Badge>
                    ) : null}
                  </div>
                  <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-[var(--text-soft)]">
                    {answer.answer}
                  </p>

                  {answer.sources?.length ? (
                    <div className="mt-5 space-y-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[var(--text-muted)]">
                        Source snippets
                      </p>
                      {answer.sources.map((source, index) => (
                        <div
                          key={`${source.index}-${index}`}
                          className="rounded-[22px] border border-[var(--border)] bg-[color:var(--surface)]/60 p-4 text-xs leading-6 text-[var(--text-muted)]"
                        >
                          {source.text}
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      <ConfirmModal
        isOpen={!!deleteConfirm}
        title="Delete Document"
        message="Are you sure you want to delete this document? This action cannot be undone."
        onConfirm={confirmDelete}
        onCancel={() => setDeleteConfirm(null)}
      />
    </div>
  );
}

export default DocumentsPage;
