"use client";

import { useState } from "react";
import {
  type Document,
  type DocumentArtifact,
  type DocumentType,
} from "@prisma/client";
import { api } from "~/trpc/react";
import { useRouter } from "next/navigation";
import { Button } from "~/components/ui/button";
import { PlusCircle, Pencil, X, Save } from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

interface DocumentEditorProps {
  document: Document & { documentArtifact: DocumentArtifact[] };
}

export function DocumentEditor({ document }: DocumentEditorProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [editingArtifactId, setEditingArtifactId] = useState<number | null>(
    null,
  );
  const [isCreatingArtifact, setIsCreatingArtifact] = useState(false);
  const [formData, setFormData] = useState({
    title: document.title,
    riskScore: document.riskScore,
    shortSummary: document.shortSummary ?? "",
    dateSigned: document.dateSigned.toISOString().split("T")[0],
    signer: document.signer,
    originalDocumentUrl: document.originalDocumentUrl,
    type: document.type,
  });

  const [artifactFormData, setArtifactFormData] = useState({
    title: "",
    content: "",
  });

  const updateDocument = api.document.update.useMutation({
    onSuccess: () => {
      setIsEditing(false);
      router.refresh();
      toast.success("Document updated successfully");
    },
    onError: (error) => {
      if (error.data?.code === "FORBIDDEN") {
        toast.error("You need admin privileges to edit documents");
      } else {
        toast.error("Failed to update document");
      }
      setIsEditing(false);
    },
  });

  const updateArtifact = api.document.updateArtifact.useMutation({
    onSuccess: () => {
      setEditingArtifactId(null);
      router.refresh();
      toast.success("Artifact updated successfully");
    },
    onError: (error) => {
      if (error.data?.code === "FORBIDDEN") {
        toast.error("You need admin privileges to edit artifacts");
      } else {
        toast.error("Failed to update artifact");
      }
      setEditingArtifactId(null);
    },
  });

  const createArtifact = api.document.createArtifact.useMutation({
    onSuccess: () => {
      setIsCreatingArtifact(false);
      setArtifactFormData({ title: "", content: "" });
      router.refresh();
      toast.success("Artifact created successfully");
    },
    onError: (error) => {
      if (error.data?.code === "FORBIDDEN") {
        toast.error("You need admin privileges to create artifacts");
      } else {
        toast.error("Failed to create artifact");
      }
      setIsCreatingArtifact(false);
    },
  });

  const deleteArtifact = api.document.deleteArtifact.useMutation({
    onSuccess: () => {
      router.refresh();
      toast.success("Artifact deleted successfully");
    },
    onError: (error) => {
      if (error.data?.code === "FORBIDDEN") {
        toast.error("You need admin privileges to delete artifacts");
      } else {
        toast.error("Failed to delete artifact");
      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.dateSigned) return;

    updateDocument.mutate({
      id: document.id,
      ...formData,
      riskScore: formData.riskScore ? Number(formData.riskScore) : null,
      dateSigned: new Date(formData.dateSigned),
      shortSummary: formData.shortSummary || null,
      type: formData.type,
    });
  };

  const handleArtifactEdit = (artifact: DocumentArtifact) => {
    setEditingArtifactId(artifact.id);
    setArtifactFormData({
      title: artifact.title,
      content: artifact.content,
    });
  };

  const handleArtifactSave = (artifactId: number) => {
    updateArtifact.mutate({
      id: artifactId,
      ...artifactFormData,
    });
  };

  const handleArtifactCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createArtifact.mutate({
      ...artifactFormData,
      documentId: document.id,
    });
  };

  return (
    <div className="grid gap-8">
      <section className="rounded-lg bg-white/5 p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Document Details</h2>
          <Button
            onClick={() => setIsEditing(!isEditing)}
            variant={isEditing ? "destructive" : "default"}
            size="sm"
          >
            {isEditing ? "Cancel" : "Edit"}
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-400">
              Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="mt-1 w-full rounded-md border-gray-700 bg-white/5 p-2"
              disabled={!isEditing}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400">
              Risk Score
            </label>
            <input
              type="number"
              value={formData.riskScore ?? ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  riskScore: e.target.value ? Number(e.target.value) : null,
                })
              }
              className="mt-1 w-full rounded-md border-gray-700 bg-white/5 p-2"
              disabled={!isEditing}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400">
              Short Summary
            </label>
            <textarea
              value={formData.shortSummary}
              onChange={(e) =>
                setFormData({ ...formData, shortSummary: e.target.value })
              }
              className="mt-1 w-full rounded-md border-gray-700 bg-white/5 p-2"
              disabled={!isEditing}
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400">
              Date Signed
            </label>
            <input
              type="date"
              value={formData.dateSigned}
              onChange={(e) =>
                setFormData({ ...formData, dateSigned: e.target.value })
              }
              className="mt-1 w-full rounded-md border-gray-700 bg-white/5 p-2"
              disabled={!isEditing}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400">
              Signer
            </label>
            <input
              type="text"
              value={formData.signer}
              onChange={(e) =>
                setFormData({ ...formData, signer: e.target.value })
              }
              className="mt-1 w-full rounded-md border-gray-700 bg-white/5 p-2"
              disabled={!isEditing}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400">
              Document Type
            </label>
            <Select
              value={formData.type}
              onValueChange={(value) =>
                setFormData({ ...formData, type: value as DocumentType })
              }
              disabled={!isEditing}
            >
              <SelectTrigger className="mt-1 w-full border-gray-700 bg-white/5">
                <SelectValue placeholder="Select a document type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="EXECUTIVE_ORDER">Executive Order</SelectItem>
                <SelectItem value="FACT_SHEET">Fact Sheet</SelectItem>
                <SelectItem value="REMARKS">Remarks</SelectItem>
                <SelectItem value="LEGISLATION">Legislation</SelectItem>
                <SelectItem value="OTHER">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400">
              Original Document URL
            </label>
            <input
              type="url"
              value={formData.originalDocumentUrl}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  originalDocumentUrl: e.target.value,
                })
              }
              className="mt-1 w-full rounded-md border-gray-700 bg-white/5 p-2"
              disabled={!isEditing}
            />
          </div>

          {isEditing && (
            <div className="mt-4 flex justify-end">
              <Button
                type="submit"
                disabled={updateDocument.isPending}
                className="px-8"
              >
                {updateDocument.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          )}
        </form>
      </section>

      <section className="rounded-lg bg-white/5 p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Document Artifacts</h2>
          <Button
            onClick={() => setIsCreatingArtifact(true)}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <PlusCircle className="h-4 w-4" />
            Add Artifact
          </Button>
        </div>

        <div className="grid gap-4">
          {isCreatingArtifact && (
            <form
              onSubmit={handleArtifactCreate}
              className="rounded-lg border border-gray-700 p-4"
            >
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-400">
                  Title
                </label>
                <input
                  type="text"
                  value={artifactFormData.title}
                  onChange={(e) =>
                    setArtifactFormData({
                      ...artifactFormData,
                      title: e.target.value,
                    })
                  }
                  className="mt-1 w-full rounded-md border-gray-700 bg-white/5 p-2"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-400">
                  Content
                </label>
                <textarea
                  value={artifactFormData.content}
                  onChange={(e) =>
                    setArtifactFormData({
                      ...artifactFormData,
                      content: e.target.value,
                    })
                  }
                  className="mt-1 w-full rounded-md border-gray-700 bg-white/5 p-2"
                  rows={5}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setIsCreatingArtifact(false);
                    setArtifactFormData({ title: "", content: "" });
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={createArtifact.isPending}>
                  {createArtifact.isPending ? "Creating..." : "Create Artifact"}
                </Button>
              </div>
            </form>
          )}

          {document.documentArtifact
            .sort((a, b) => a.title.localeCompare(b.title))
            .map((artifact) => (
              <div
                key={artifact.id}
                className="rounded-lg border border-gray-700 p-4"
              >
                <div className="mb-2 flex items-center justify-between">
                  {editingArtifactId === artifact.id ? (
                    <input
                      type="text"
                      value={artifactFormData.title}
                      onChange={(e) =>
                        setArtifactFormData({
                          ...artifactFormData,
                          title: e.target.value,
                        })
                      }
                      className="rounded-md border-gray-700 bg-white/5 p-1"
                    />
                  ) : (
                    <h3 className="font-medium">{artifact.title}</h3>
                  )}
                  <div className="flex gap-2">
                    {editingArtifactId === artifact.id ? (
                      <>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setEditingArtifactId(null);
                            setArtifactFormData({ title: "", content: "" });
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleArtifactSave(artifact.id)}
                          disabled={updateArtifact.isPending}
                        >
                          <Save className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleArtifactEdit(artifact)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            if (
                              window.confirm(
                                "Are you sure you want to delete this artifact?",
                              )
                            ) {
                              deleteArtifact.mutate({ id: artifact.id });
                            }
                          }}
                          className="text-red-500 hover:text-red-400"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                {editingArtifactId === artifact.id ? (
                  <textarea
                    value={artifactFormData.content}
                    onChange={(e) =>
                      setArtifactFormData({
                        ...artifactFormData,
                        content: e.target.value,
                      })
                    }
                    className="h-[600px] w-full rounded-md border-gray-700 bg-white/5 p-2"
                    rows={5}
                  />
                ) : (
                  <pre className="whitespace-pre-wrap rounded bg-black/30 p-4 text-sm">
                    {artifact.content}
                  </pre>
                )}
              </div>
            ))}
        </div>
      </section>
    </div>
  );
}
