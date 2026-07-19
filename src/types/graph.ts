export interface Vertex {
  id: string;
  label: string;
}

export interface Edge {
  from: string;
  to: string;
  weight?: number;
}

export interface GraphData {
  vertices: Vertex[];
  edges: Edge[];
}
