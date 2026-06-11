"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FranchiseEcosystem } from "@/lib/types";

type NodeType = "brand" | "application" | "outlet";

type GraphNode = {
  id: string;
  label: string;
  type: NodeType;
  detail: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
};

type GraphEdge = { from: string; to: string };

type Props = {
  ecosystem?: FranchiseEcosystem;
  brandName?: string | null;
};

function nodeDetail(type: NodeType, meta?: Record<string, unknown>): string {
  if (type === "application" && meta?.status) {
    return `Durum: ${String(meta.status)}`;
  }
  if (type === "outlet" && meta?.city) {
    return `${String(meta.city)} · ${String(meta.status ?? "aktif")}`;
  }
  if (type === "brand") {
    return "Merkez marka";
  }
  return "";
}

export function EcosystemGraph({ ecosystem, brandName }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nodesRef = useRef<GraphNode[]>([]);
  const edgesRef = useRef<GraphEdge[]>([]);
  const dragRef = useRef<{ id: string; ox: number; oy: number } | null>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; title: string; detail: string } | null>(null);

  const graphData = useMemo(() => {
    const nodes: GraphNode[] = [];
    const edges: GraphEdge[] = [];

    if (ecosystem?.nodes?.length) {
      const apiNodes = ecosystem.nodes.slice(0, 20);
      const idSet = new Set(apiNodes.map((n) => n.id));
      apiNodes.forEach((n, i) => {
        const type = (n.type === "brand" || n.type === "application" || n.type === "outlet"
          ? n.type
          : "application") as NodeType;
        const angle = (i / Math.max(apiNodes.length, 1)) * Math.PI * 2;
        const radius = type === "brand" ? 0 : 70 + (i % 3) * 25;
        nodes.push({
          id: n.id,
          label: n.label.length > 14 ? `${n.label.slice(0, 12)}…` : n.label,
          type,
          detail: nodeDetail(type, n.meta),
          x: type === "brand" ? 0 : Math.cos(angle) * radius,
          y: type === "brand" ? 0 : Math.sin(angle) * radius * 0.75,
          vx: 0,
          vy: 0,
          r: type === "brand" ? 28 : 16,
        });
      });
      for (const e of ecosystem.edges ?? []) {
        if (idSet.has(e.source) && idSet.has(e.target)) {
          edges.push({ from: e.source, to: e.target });
        }
      }
      if (nodes.length > 0) {
        return { nodes, edges };
      }
    }

    const label = brandName ?? ecosystem?.brand?.name ?? "Markanız";
    const center: GraphNode = {
      id: "brand",
      label: label.length > 14 ? `${label.slice(0, 12)}…` : label,
      type: "brand",
      detail: `${ecosystem?.applications_total ?? 0} toplam başvuru`,
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      r: 28,
    };
    nodes.push(center);
    return { nodes, edges };
  }, [ecosystem, brandName]);

  useEffect(() => {
    nodesRef.current = graphData.nodes.map((n) => ({ ...n }));
    edgesRef.current = graphData.edges;
  }, [graphData]);

  const tick = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    const cx = w / 2;
    const cy = h / 2;
    const nodes = nodesRef.current;
    const edges = edgesRef.current;
    const drag = dragRef.current;

    for (const node of nodes) {
      if (drag?.id === node.id) continue;
      node.vx *= 0.92;
      node.vy *= 0.92;
      node.vx -= node.x * 0.002;
      node.vy -= node.y * 0.002;
    }

    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i];
        const b = nodes[j];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const minDist = a.r + b.r + 24;
        if (dist < minDist) {
          const force = (minDist - dist) * 0.04;
          const fx = (dx / dist) * force;
          const fy = (dy / dist) * force;
          if (drag?.id !== a.id) {
            a.vx -= fx;
            a.vy -= fy;
          }
          if (drag?.id !== b.id) {
            b.vx += fx;
            b.vy += fy;
          }
        }
      }
    }

    for (const edge of edges) {
      const a = nodes.find((n) => n.id === edge.from);
      const b = nodes.find((n) => n.id === edge.to);
      if (!a || !b) continue;
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      const target = 100;
      const force = (dist - target) * 0.004;
      if (drag?.id !== a.id) {
        a.vx += (dx / dist) * force;
        a.vy += (dy / dist) * force;
      }
      if (drag?.id !== b.id) {
        b.vx -= (dx / dist) * force;
        b.vy -= (dy / dist) * force;
      }
    }

    for (const node of nodes) {
      if (drag?.id === node.id) continue;
      node.x += node.vx;
      node.y += node.vy;
    }

    ctx.clearRect(0, 0, w, h);

    for (const edge of edges) {
      const a = nodes.find((n) => n.id === edge.from);
      const b = nodes.find((n) => n.id === edge.to);
      if (!a || !b) continue;
      ctx.beginPath();
      ctx.moveTo(cx + a.x, cy + a.y);
      ctx.lineTo(cx + b.x, cy + b.y);
      ctx.strokeStyle = "rgba(255,107,74,0.18)";
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    for (const node of nodes) {
      const x = cx + node.x;
      const y = cy + node.y;
      const color =
        node.type === "brand" ? "#ff6b4a" : node.type === "application" ? "#6366f1" : "#22c55e";
      ctx.beginPath();
      ctx.arc(x, y, node.r, 0, Math.PI * 2);
      ctx.fillStyle = `${color}22`;
      ctx.fill();
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = "#1c1917";
      ctx.font = "600 10px system-ui";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(node.label, x, y);
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const rect = canvas.parentElement?.getBoundingClientRect();
      if (!rect) return;
      canvas.width = rect.width * devicePixelRatio;
      canvas.height = rect.height * devicePixelRatio;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
    };
    resize();
    window.addEventListener("resize", resize);

    let frame = 0;
    const loop = () => {
      tick();
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
    };
  }, [tick]);

  const pickNode = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left - rect.width / 2;
    const y = clientY - rect.top - rect.height / 2;
    return nodesRef.current.find((n) => {
      const dx = x - n.x;
      const dy = y - n.y;
      return dx * dx + dy * dy <= (n.r + 6) ** 2;
    });
  };

  const moveAt = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const node = pickNode(clientX, clientY);
    if (node) {
      setTooltip({
        x: clientX - rect.left,
        y: clientY - rect.top,
        title: node.label,
        detail: node.detail,
      });
    } else if (!dragRef.current) {
      setTooltip(null);
    }
    if (dragRef.current) {
      const n = nodesRef.current.find((nd) => nd.id === dragRef.current!.id);
      if (n) {
        n.x = clientX - rect.left - rect.width / 2;
        n.y = clientY - rect.top - rect.height / 2;
        n.vx = 0;
        n.vy = 0;
      }
    }
  };

  return (
    <div className="ecosystem-graph">
      <canvas
        ref={canvasRef}
        className="ecosystem-graph-canvas"
        onPointerMove={(e) => moveAt(e.clientX, e.clientY)}
        onPointerLeave={() => {
          dragRef.current = null;
          setTooltip(null);
        }}
        onPointerDown={(e) => {
          const node = pickNode(e.clientX, e.clientY);
          if (node) {
            dragRef.current = { id: node.id, ox: node.x, oy: node.y };
            e.currentTarget.setPointerCapture(e.pointerId);
          }
        }}
        onPointerUp={(e) => {
          dragRef.current = null;
          e.currentTarget.releasePointerCapture(e.pointerId);
        }}
        onPointerCancel={() => {
          dragRef.current = null;
        }}
      />
      {tooltip ? (
        <div className="ecosystem-tooltip" style={{ left: tooltip.x, top: tooltip.y }}>
          <p className="ecosystem-tooltip-title">{tooltip.title}</p>
          <p className="ecosystem-tooltip-detail">{tooltip.detail}</p>
        </div>
      ) : null}
      <p className="ecosystem-graph-hint">Noktaları sürükleyerek keşfedin · mobilde parmağınızla kaydırın</p>
    </div>
  );
}
