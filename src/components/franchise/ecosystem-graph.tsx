"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Application, FranchiseDashboardSummary } from "@/lib/types";

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
  summary: FranchiseDashboardSummary | undefined;
  applications: Application[];
};

export function EcosystemGraph({ summary, applications }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nodesRef = useRef<GraphNode[]>([]);
  const edgesRef = useRef<GraphEdge[]>([]);
  const dragRef = useRef<{ id: string; ox: number; oy: number } | null>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; title: string; detail: string } | null>(null);

  const graphData = useMemo(() => {
    const nodes: GraphNode[] = [];
    const edges: GraphEdge[] = [];
    const brandName = summary?.brand_name ?? "Markanız";
    const center: GraphNode = {
      id: "brand",
      label: brandName.length > 14 ? `${brandName.slice(0, 12)}…` : brandName,
      type: "brand",
      detail: `${summary?.total_applications ?? 0} toplam başvuru`,
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      r: 28,
    };
    nodes.push(center);

    applications.slice(0, 6).forEach((app, i) => {
      const angle = (i / Math.max(applications.length, 1)) * Math.PI * 2;
      const id = `app-${app.id}`;
      nodes.push({
        id,
        label: `#${app.id}`,
        type: "application",
        detail: `Durum: ${app.status}`,
        x: Math.cos(angle) * 90,
        y: Math.sin(angle) * 70,
        vx: 0,
        vy: 0,
        r: 16,
      });
      edges.push({ from: "brand", to: id });
    });

    const outletCount = Math.min(4, Math.max(1, Math.floor((summary?.approved_applications ?? 0) / 2) + 1));
    for (let i = 0; i < outletCount; i++) {
      const id = `outlet-${i}`;
      nodes.push({
        id,
        label: `Şube ${i + 1}`,
        type: "outlet",
        detail: "Aktif bayi noktası",
        x: (Math.random() - 0.5) * 160,
        y: (Math.random() - 0.5) * 120,
        vx: 0,
        vy: 0,
        r: 14,
      });
      edges.push({ from: "brand", to: id });
    }

    return { nodes, edges };
  }, [summary, applications]);

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

  return (
    <div className="ecosystem-graph">
      <canvas
        ref={canvasRef}
        className="ecosystem-graph-canvas"
        onMouseMove={(e) => {
          const node = pickNode(e.clientX, e.clientY);
          if (node) {
            const rect = canvasRef.current!.getBoundingClientRect();
            setTooltip({
              x: e.clientX - rect.left,
              y: e.clientY - rect.top,
              title: node.label,
              detail: node.detail,
            });
          } else if (!dragRef.current) {
            setTooltip(null);
          }
          if (dragRef.current) {
            const rect = canvasRef.current!.getBoundingClientRect();
            const n = nodesRef.current.find((nd) => nd.id === dragRef.current!.id);
            if (n) {
              n.x = e.clientX - rect.left - rect.width / 2;
              n.y = e.clientY - rect.top - rect.height / 2;
              n.vx = 0;
              n.vy = 0;
            }
          }
        }}
        onMouseLeave={() => {
          dragRef.current = null;
          setTooltip(null);
        }}
        onMouseDown={(e) => {
          const node = pickNode(e.clientX, e.clientY);
          if (node) dragRef.current = { id: node.id, ox: node.x, oy: node.y };
        }}
        onMouseUp={() => {
          dragRef.current = null;
        }}
      />
      {tooltip ? (
        <div className="ecosystem-tooltip" style={{ left: tooltip.x, top: tooltip.y }}>
          <p className="ecosystem-tooltip-title">{tooltip.title}</p>
          <p className="ecosystem-tooltip-detail">{tooltip.detail}</p>
        </div>
      ) : null}
      <p className="ecosystem-graph-hint">Noktaları sürükleyerek keşfedin</p>
    </div>
  );
}
