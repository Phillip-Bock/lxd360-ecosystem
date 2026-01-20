'use client';

/**
 * Talent Graph Visualization
 * ==========================
 * Interactive network visualization showing organizational talent,
 * skills connections, and mentoring relationships.
 */

import { motion } from 'framer-motion';
import { Link2, Target, User } from 'lucide-react';
import { useRef, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface TalentGraphVisualizationProps {
  department: string;
}

// Types for graph nodes and edges
interface GraphNode {
  id: string;
  name: string;
  avatar: string;
  role: string;
  department: string;
  type: 'mentor' | 'mentee' | 'both';
  skills: string[];
  x: number;
  y: number;
  connections: number;
}

interface GraphEdge {
  source: string;
  target: string;
  type: 'mentoring' | 'skill' | 'collaboration';
  strength: number;
}

// Generate mock graph data
const generateGraphData = (department: string): { nodes: GraphNode[]; edges: GraphEdge[] } => {
  const nodes: GraphNode[] = [
    // Central hub - highly connected mentors
    {
      id: '1',
      name: 'Sarah Chen',
      avatar: 'https://i.pravatar.cc/150?u=sarah',
      role: 'Staff Engineer',
      department: 'Engineering',
      type: 'mentor',
      skills: ['React', 'TypeScript', 'System Design'],
      x: 50,
      y: 45,
      connections: 8,
    },
    {
      id: '2',
      name: 'Marcus Johnson',
      avatar: 'https://i.pravatar.cc/150?u=marcus',
      role: 'Tech Lead',
      department: 'Engineering',
      type: 'both',
      skills: ['Python', 'ML', 'Data'],
      x: 35,
      y: 30,
      connections: 6,
    },
    {
      id: '3',
      name: 'Emily Zhang',
      avatar: 'https://i.pravatar.cc/150?u=emily',
      role: 'Design Lead',
      department: 'Design',
      type: 'mentor',
      skills: ['UX', 'Research', 'Figma'],
      x: 65,
      y: 25,
      connections: 5,
    },
    {
      id: '4',
      name: 'Alex Rivera',
      avatar: 'https://i.pravatar.cc/150?u=alex',
      role: 'Engineering Manager',
      department: 'Engineering',
      type: 'mentor',
      skills: ['Leadership', 'System Design'],
      x: 25,
      y: 55,
      connections: 7,
    },
    {
      id: '5',
      name: 'Priya Sharma',
      avatar: 'https://i.pravatar.cc/150?u=priya',
      role: 'Senior PM',
      department: 'Product',
      type: 'both',
      skills: ['Product Strategy', 'Data'],
      x: 75,
      y: 50,
      connections: 4,
    },
    // Mentees and less connected nodes
    {
      id: '6',
      name: 'James Wilson',
      avatar: 'https://i.pravatar.cc/150?u=james',
      role: 'Junior Engineer',
      department: 'Engineering',
      type: 'mentee',
      skills: ['React', 'JavaScript'],
      x: 40,
      y: 65,
      connections: 2,
    },
    {
      id: '7',
      name: 'Lisa Park',
      avatar: 'https://i.pravatar.cc/150?u=lisa',
      role: 'UX Designer',
      department: 'Design',
      type: 'mentee',
      skills: ['UI Design', 'Prototyping'],
      x: 80,
      y: 35,
      connections: 2,
    },
    {
      id: '8',
      name: 'David Kim',
      avatar: 'https://i.pravatar.cc/150?u=david',
      role: 'Data Analyst',
      department: 'Engineering',
      type: 'mentee',
      skills: ['Python', 'SQL'],
      x: 20,
      y: 38,
      connections: 3,
    },
    {
      id: '9',
      name: 'Anna Martinez',
      avatar: 'https://i.pravatar.cc/150?u=anna',
      role: 'Product Designer',
      department: 'Design',
      type: 'mentee',
      skills: ['UX Research', 'Figma'],
      x: 60,
      y: 70,
      connections: 2,
    },
    {
      id: '10',
      name: 'Mike Thompson',
      avatar: 'https://i.pravatar.cc/150?u=mike',
      role: 'Backend Engineer',
      department: 'Engineering',
      type: 'mentee',
      skills: ['Node.js', 'PostgreSQL'],
      x: 30,
      y: 75,
      connections: 2,
    },
    {
      id: '11',
      name: 'Sophie Lee',
      avatar: 'https://i.pravatar.cc/150?u=sophie',
      role: 'Frontend Engineer',
      department: 'Engineering',
      type: 'mentee',
      skills: ['React', 'TypeScript'],
      x: 55,
      y: 20,
      connections: 2,
    },
    {
      id: '12',
      name: 'Chris Brown',
      avatar: 'https://i.pravatar.cc/150?u=chris',
      role: 'ML Engineer',
      department: 'Engineering',
      type: 'mentee',
      skills: ['Python', 'TensorFlow'],
      x: 15,
      y: 25,
      connections: 2,
    },
  ];

  const edges: GraphEdge[] = [
    // Sarah's connections
    { source: '1', target: '6', type: 'mentoring', strength: 0.9 },
    { source: '1', target: '11', type: 'mentoring', strength: 0.8 },
    { source: '1', target: '2', type: 'collaboration', strength: 0.7 },
    { source: '1', target: '4', type: 'collaboration', strength: 0.6 },
    { source: '1', target: '5', type: 'skill', strength: 0.5 },
    // Marcus's connections
    { source: '2', target: '8', type: 'mentoring', strength: 0.9 },
    { source: '2', target: '12', type: 'mentoring', strength: 0.85 },
    { source: '2', target: '4', type: 'collaboration', strength: 0.6 },
    // Emily's connections
    { source: '3', target: '7', type: 'mentoring', strength: 0.9 },
    { source: '3', target: '9', type: 'mentoring', strength: 0.85 },
    { source: '3', target: '5', type: 'collaboration', strength: 0.5 },
    // Alex's connections
    { source: '4', target: '6', type: 'mentoring', strength: 0.7 },
    { source: '4', target: '10', type: 'mentoring', strength: 0.8 },
    // Priya's connections
    { source: '5', target: '9', type: 'mentoring', strength: 0.6 },
    // Cross-department skill connections
    { source: '2', target: '5', type: 'skill', strength: 0.4 },
    { source: '8', target: '5', type: 'skill', strength: 0.3 },
  ];

  // Filter by department if specified
  if (department !== 'all') {
    const deptMap: Record<string, string> = {
      eng: 'Engineering',
      product: 'Product',
      design: 'Design',
    };
    const deptName = deptMap[department];
    if (deptName) {
      const filteredNodeIds = new Set(
        nodes.filter((n) => n.department === deptName).map((n) => n.id),
      );
      return {
        nodes: nodes.filter((n) => filteredNodeIds.has(n.id)),
        edges: edges.filter((e) => filteredNodeIds.has(e.source) && filteredNodeIds.has(e.target)),
      };
    }
  }

  return { nodes, edges };
};

export function TalentGraphVisualization({
  department,
}: TalentGraphVisualizationProps): React.JSX.Element {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { nodes, edges } = generateGraphData(department);

  const getNodeColor = (type: string): string => {
    switch (type) {
      case 'mentor':
        return 'bg-brand-secondary border-brand-secondary';
      case 'mentee':
        return 'bg-brand-primary border-brand-primary';
      case 'both':
        return 'bg-brand-warning border-amber-600';
      default:
        return 'bg-gray-500 dark:bg-gray-600 border-brand-default';
    }
  };

  const getEdgeColor = (type: string): string => {
    switch (type) {
      case 'mentoring':
        return 'stroke-purple-400';
      case 'skill':
        return 'stroke-green-400';
      case 'collaboration':
        return 'stroke-blue-400';
      default:
        return 'stroke-gray-400 dark:stroke-gray-500';
    }
  };

  const isNodeHighlighted = (nodeId: string): boolean => {
    if (!hoveredNode && !selectedNode) return true;
    const activeNode = selectedNode || hoveredNode;
    if (nodeId === activeNode) return true;
    return edges.some(
      (e) =>
        (e.source === activeNode && e.target === nodeId) ||
        (e.target === activeNode && e.source === nodeId),
    );
  };

  const isEdgeHighlighted = (edge: GraphEdge): boolean => {
    if (!hoveredNode && !selectedNode) return true;
    const activeNode = selectedNode || hoveredNode;
    return edge.source === activeNode || edge.target === activeNode;
  };

  return (
    <div
      className="relative h-[500px] bg-brand-page dark:bg-brand-page/50 rounded-xl overflow-hidden"
      ref={containerRef}
    >
      {/* Legend */}
      <div className="absolute top-4 left-4 z-10 bg-brand-surface dark:bg-brand-surface rounded-lg p-3 shadow-lg border border-brand-default dark:border-brand-default">
        <p className="text-xs font-medium text-brand-muted mb-2">Legend</p>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 rounded-full bg-brand-secondary" />
            <span>Mentor</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 rounded-full bg-brand-primary" />
            <span>Mentee</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 rounded-full bg-brand-warning" />
            <span>Both</span>
          </div>
          <div className="border-t border-brand-default dark:border-brand-default pt-1.5 mt-1.5">
            <div className="flex items-center gap-2 text-xs">
              <div className="w-4 h-0.5 bg-purple-400" />
              <span>Mentoring</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="w-4 h-0.5 bg-green-400" />
              <span>Skill Match</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="w-4 h-0.5 bg-blue-400" />
              <span>Collaboration</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Overlay */}
      <div className="absolute top-4 right-4 z-10 bg-brand-surface dark:bg-brand-surface rounded-lg p-3 shadow-lg border border-brand-default dark:border-brand-default">
        <div className="grid grid-cols-2 gap-3 text-center">
          <div>
            <p className="text-lg font-bold text-purple-600">
              {nodes.filter((n) => n.type === 'mentor' || n.type === 'both').length}
            </p>
            <p className="text-[10px] text-brand-muted">Mentors</p>
          </div>
          <div>
            <p className="text-lg font-bold text-brand-blue">
              {nodes.filter((n) => n.type === 'mentee' || n.type === 'both').length}
            </p>
            <p className="text-[10px] text-brand-muted">Mentees</p>
          </div>
          <div>
            <p className="text-lg font-bold text-green-600">
              {edges.filter((e) => e.type === 'mentoring').length}
            </p>
            <p className="text-[10px] text-brand-muted">Active Pairs</p>
          </div>
          <div>
            <p className="text-lg font-bold text-amber-600">{edges.length}</p>
            <p className="text-[10px] text-brand-muted">Connections</p>
          </div>
        </div>
      </div>

      {/* SVG for edges */}
      <svg aria-hidden="true" className="absolute inset-0 w-full h-full pointer-events-none">
        <defs>
          <marker
            id="arrowhead-purple"
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <polygon points="0 0, 10 3.5, 0 7" className="fill-purple-400" />
          </marker>
          <marker
            id="arrowhead-green"
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <polygon points="0 0, 10 3.5, 0 7" className="fill-green-400" />
          </marker>
          <marker
            id="arrowhead-blue"
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <polygon points="0 0, 10 3.5, 0 7" className="fill-blue-400" />
          </marker>
        </defs>
        {edges.map((edge, i) => {
          const sourceNode = nodes.find((n) => n.id === edge.source);
          const targetNode = nodes.find((n) => n.id === edge.target);
          if (!sourceNode || !targetNode) return null;

          const highlighted = isEdgeHighlighted(edge);
          const markerId =
            edge.type === 'mentoring'
              ? 'arrowhead-purple'
              : edge.type === 'skill'
                ? 'arrowhead-green'
                : 'arrowhead-blue';

          return (
            <motion.line
              key={i}
              x1={`${sourceNode.x}%`}
              y1={`${sourceNode.y}%`}
              x2={`${targetNode.x}%`}
              y2={`${targetNode.y}%`}
              className={cn(
                getEdgeColor(edge.type),
                'transition-opacity duration-200',
                highlighted ? 'opacity-60' : 'opacity-10',
              )}
              strokeWidth={highlighted ? edge.strength * 3 : 1}
              strokeDasharray={edge.type === 'skill' ? '5,5' : undefined}
              markerEnd={edge.type === 'mentoring' ? `url(#${markerId})` : undefined}
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: highlighted ? 0.6 : 0.1 }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
            />
          );
        })}
      </svg>

      {/* Nodes */}
      <TooltipProvider>
        {nodes.map((node, i) => {
          const highlighted = isNodeHighlighted(node.id);
          const isActive = selectedNode === node.id;

          return (
            <Tooltip key={node.id}>
              <TooltipTrigger asChild>
                <motion.div
                  className={cn(
                    'absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-200',
                    highlighted ? 'z-20' : 'z-10 opacity-30',
                  )}
                  style={{ left: `${node.x}%`, top: `${node.y}%` }}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: highlighted ? 1 : 0.3 }}
                  transition={{ delay: i * 0.05, type: 'spring', stiffness: 200 }}
                  onMouseEnter={() => setHoveredNode(node.id)}
                  onMouseLeave={() => setHoveredNode(null)}
                  onClick={() => setSelectedNode(selectedNode === node.id ? null : node.id)}
                >
                  <div
                    className={cn(
                      'relative rounded-full border-2 transition-all',
                      getNodeColor(node.type),
                      isActive && 'ring-4 ring-purple-300 dark:ring-purple-700',
                      node.connections > 5
                        ? 'w-14 h-14'
                        : node.connections > 3
                          ? 'w-12 h-12'
                          : 'w-10 h-10',
                    )}
                  >
                    <Avatar className="w-full h-full">
                      <AvatarImage src={node.avatar} alt={node.name} />
                      <AvatarFallback className="text-xs text-brand-primary bg-transparent">
                        {node.name[0]}
                      </AvatarFallback>
                    </Avatar>
                    {/* Connection count badge */}
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-brand-surface dark:bg-brand-surface border border-brand-default dark:border-brand-default flex items-center justify-center">
                      <span className="text-[10px] font-bold text-brand-secondary dark:text-brand-secondary">
                        {node.connections}
                      </span>
                    </div>
                  </div>
                </motion.div>
              </TooltipTrigger>
              <TooltipContent side="right" className="max-w-xs p-0 overflow-hidden">
                <div className="p-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={node.avatar} alt={node.name} />
                      <AvatarFallback>{node.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-sm">{node.name}</p>
                      <p className="text-xs text-brand-muted">{node.role}</p>
                    </div>
                  </div>
                  <div className="mt-2 pt-2 border-t border-slate-100 dark:border-brand-subtle">
                    <div className="flex items-center gap-1 text-xs text-brand-muted mb-1">
                      <Target className="w-3 h-3" />
                      <span>{node.department}</span>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {node.skills.map((skill) => (
                        <Badge key={skill} variant="secondary" className="text-[10px]">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex items-center gap-2 mt-2 text-xs">
                      <div className="flex items-center gap-1">
                        <Link2 className="w-3 h-3 text-brand-purple" />
                        <span>{node.connections} connections</span>
                      </div>
                      <Badge
                        className={cn(
                          'text-[10px]',
                          node.type === 'mentor' && 'bg-purple-100 text-purple-700',
                          node.type === 'mentee' && 'bg-blue-100 text-blue-700',
                          node.type === 'both' && 'bg-amber-100 text-amber-700',
                        )}
                      >
                        {node.type === 'both' ? 'Mentor & Mentee' : node.type}
                      </Badge>
                    </div>
                  </div>
                </div>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </TooltipProvider>

      {/* Selected Node Detail Panel */}
      {selectedNode && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-4 left-4 right-4 bg-brand-surface dark:bg-brand-surface rounded-lg shadow-lg border border-brand-default dark:border-brand-default p-4"
        >
          {(() => {
            const node = nodes.find((n) => n.id === selectedNode);
            if (!node) return null;

            const nodeEdges = edges.filter(
              (e) => e.source === selectedNode || e.target === selectedNode,
            );
            const connectedNodes = nodeEdges
              .map((e) =>
                nodes.find((n) => n.id === (e.source === selectedNode ? e.target : e.source)),
              )
              .filter(Boolean);

            return (
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={node.avatar} alt={node.name} />
                    <AvatarFallback>{node.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-semibold text-brand-primary dark:text-brand-primary">
                      {node.name}
                    </h4>
                    <p className="text-sm text-brand-muted">
                      {node.role} • {node.department}
                    </p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {node.skills.map((skill) => (
                        <Badge key={skill} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-brand-muted mb-2">Connected to:</p>
                  <div className="flex -space-x-2">
                    {connectedNodes.slice(0, 5).map(
                      (connNode) =>
                        connNode && (
                          <Avatar
                            key={connNode.id}
                            className="h-8 w-8 border-2 border-white dark:border-brand-subtle"
                          >
                            <AvatarImage src={connNode.avatar} alt={connNode.name} />
                            <AvatarFallback>{connNode.name[0]}</AvatarFallback>
                          </Avatar>
                        ),
                    )}
                    {connectedNodes.length > 5 && (
                      <div className="h-8 w-8 rounded-full bg-brand-surface dark:bg-brand-surface-hover border-2 border-white dark:border-brand-subtle flex items-center justify-center">
                        <span className="text-xs text-brand-muted">
                          +{connectedNodes.length - 5}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-4"
                  onClick={() => setSelectedNode(null)}
                >
                  Close
                </Button>
              </div>
            );
          })()}
        </motion.div>
      )}

      {/* Empty state */}
      {nodes.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <User className="w-12 h-12 text-brand-secondary mx-auto mb-3" />
            <p className="text-brand-muted">No talent data for this department</p>
          </div>
        </div>
      )}
    </div>
  );
}
