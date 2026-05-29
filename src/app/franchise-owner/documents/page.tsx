"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { getFranchiseDocuments, uploadFranchiseDocument } from "@/lib/api";

export default function FranchiseDocumentsPage() {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const docsQuery = useQuery({
    queryKey: ["franchise-documents"],
    queryFn: () => getFranchiseDocuments(),
    retry: false,
  });

  const uploadMutation = useMutation({
    mutationFn: () => {
      const fd = new FormData();
      fd.append("title", title.trim());
      if (file) fd.append("file", file);
      return uploadFranchiseDocument(fd);
    },
    onSuccess: () => {
      setTitle("");
      setFile(null);
      setFeedback("Doküman yüklendi.");
      queryClient.invalidateQueries({ queryKey: ["franchise-documents"] });
    },
    onError: () => setFeedback("Yükleme başarısız."),
  });

  const docs = docsQuery.data ?? [];

  return (
    <div>
      <h2 className="page-title">Doküman kütüphanesi</h2>
      <p className="page-desc">
        Eğitim, SOP ve franchise materyalleri (FranConnect Resource Library tarzı).
      </p>

      <div className="mt-6 card-muted p-4">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Doküman başlığı"
          className="w-full max-w-md rounded-xl border border-[var(--border-strong)] bg-[var(--card)] px-3 py-2 text-sm text-[var(--foreground)]"
        />
        <input
          type="file"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="mt-3 block text-sm text-[var(--muted-foreground)]"
        />
        <button
          type="button"
          disabled={uploadMutation.isPending || !title.trim()}
          onClick={() => uploadMutation.mutate()}
          className="mt-3 rounded-xl bg-gradient-to-r from-violet-500 to-cyan-400 px-4 py-2 text-xs font-semibold text-slate-950 disabled:opacity-50"
        >
          Yükle
        </button>
      </div>

      {docsQuery.isError ? (
        <p className="mt-4 text-[var(--danger)]">Dokümanlar yüklenemedi.</p>
      ) : null}

      <ul className="mt-6 space-y-2">
        {docs.map((d) => (
          <li key={d.id} className="rounded-lg bg-[var(--border)] border bg-[var(--bg-subtle)] px-3 py-2">
            <p className="text-sm font-medium text-[var(--foreground)]">{d.title}</p>
            {d.description ? <p className="text-xs text-[var(--muted)]">{d.description}</p> : null}
            {d.file_url ? (
              <a href={d.file_url} target="_blank" rel="noreferrer" className="text-xs text-[var(--primary-hover)] underline">
                İndir / Görüntüle
              </a>
            ) : null}
          </li>
        ))}
      </ul>

      {!docsQuery.isLoading && docs.length === 0 ? (
        <p className="mt-6 text-sm text-[var(--muted-foreground)]">Doküman yok.</p>
      ) : null}
      {feedback ? <p className="mt-4 text-sm text-[var(--muted-foreground)]">{feedback}</p> : null}
    </div>
  );
}
