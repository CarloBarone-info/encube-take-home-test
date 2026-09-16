import { useEffect, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import type { ThreeEvent } from "@react-three/fiber";
import { Html, MapControls } from "@react-three/drei";
import type { OrthographicCamera } from "three";

import "./App.css";

type Tool = "select" | "comment";
type Filter = "all" | "open" | "resolved";

type Reply = {
  id: string;
  author: string;
  text: string;
  createdAt: string;
};

type CommentThread = {
  id: string;
  position: [number, number, number];
  author: string;
  text: string;
  createdAt: string;
  resolved: boolean;
  replies: Reply[];
};

type DesignElement = {
  id: string;
  position: [number, number, number];
  width: number;
  height: number;
  color: string;
};

const INITIAL_ZOOM = 70;

const INITIAL_ELEMENTS: DesignElement[] = [
  {
    id: "card-1",
    position: [-4, 2, 0],
    width: 5,
    height: 3,
    color: "#ffffff",
  },
  {
    id: "card-2",
    position: [3, 2, 0],
    width: 4,
    height: 4,
    color: "#dbeafe",
  },
  {
    id: "card-3",
    position: [-2, -3, 0],
    width: 4,
    height: 2.5,
    color: "#ede9fe",
  },
  {
    id: "card-4",
    position: [4, -3, 0],
    width: 5,
    height: 2.5,
    color: "#dcfce7",
  },
];

function ZoomTracker({
  onZoomChange,
}: {
  onZoomChange: (zoom: number) => void;
}) {
  const camera = useThree((state) => state.camera) as OrthographicCamera;

  const previousZoom = useRef(camera.zoom);

  useFrame(() => {
    if (Math.abs(camera.zoom - previousZoom.current) < 0.01) {
      return;
    }

    previousZoom.current = camera.zoom;

    const percentage = Math.round((camera.zoom / INITIAL_ZOOM) * 100);

    onZoomChange(percentage);
  });

  return null;
}

function Card({
  element,
  tool,
  onAddComment,
  onMove,
  onDragStart,
  onDragEnd,
}: {
  element: DesignElement;
  tool: Tool;
  onAddComment: (position: [number, number, number]) => void;
  onMove: (id: string, position: [number, number, number]) => void;
  onDragStart: () => void;
  onDragEnd: () => void;
}) {
  const [dragging, setDragging] = useState(false);

  function handlePointerDown(event: ThreeEvent<PointerEvent>) {
    if (tool === "comment") return;

    event.stopPropagation();

    setDragging(true);
    onDragStart();
  }

  function handlePointerMove(event: ThreeEvent<PointerEvent>) {
    if (!dragging || tool === "comment") return;

    event.stopPropagation();

    onMove(element.id, [event.point.x, event.point.y, 0]);
  }

  function stopDragging(event: ThreeEvent<PointerEvent>) {
    if (!dragging) return;

    event.stopPropagation();

    setDragging(false);
    onDragEnd();
  }

  function handleClick(event: ThreeEvent<MouseEvent>) {
    if (tool !== "comment") return;

    event.stopPropagation();

    onAddComment([event.point.x, event.point.y, 0.35]);
  }

  return (
    <mesh
      position={element.position}
      onClick={handleClick}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={stopDragging}
      onPointerCancel={stopDragging}
    >
      <boxGeometry args={[element.width, element.height, 0.15]} />

      <meshStandardMaterial color={element.color} />
    </mesh>
  );
}

function CommentPin({
  comment,
  number,
  selected,
  onSelect,
}: {
  comment: CommentThread;
  number: number;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <Html
      position={comment.position}
      center
      style={{
        pointerEvents: "auto",
      }}
    >
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onSelect();
        }}
        className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold text-white shadow-lg transition ${
          comment.resolved
            ? "bg-neutral-400"
            : selected
              ? "bg-violet-800 ring-4 ring-violet-200"
              : "bg-violet-600 hover:bg-violet-700"
        }`}
      >
        {number}
      </button>
    </Html>
  );
}

function PlacementPlane({
  tool,
  onAddComment,
}: {
  tool: Tool;
  onAddComment: (position: [number, number, number]) => void;
}) {
  function handleClick(event: ThreeEvent<MouseEvent>) {
    if (tool !== "comment") return;

    event.stopPropagation();

    onAddComment([event.point.x, event.point.y, 0.35]);
  }

  return (
    <mesh position={[0, 0, -0.5]} onClick={handleClick}>
      <planeGeometry args={[1000, 1000]} />

      <meshBasicMaterial transparent opacity={0} />
    </mesh>
  );
}

function Scene({
  tool,
  comments,
  selectedId,
  designElements,
  onAddComment,
  onSelectComment,
  onZoomChange,
  onMoveElement,
}: {
  tool: Tool;
  comments: CommentThread[];
  selectedId: string | null;
  designElements: DesignElement[];
  onAddComment: (position: [number, number, number]) => void;
  onSelectComment: (id: string) => void;
  onZoomChange: (zoom: number) => void;
  onMoveElement: (id: string, position: [number, number, number]) => void;
}) {
  const [draggingElement, setDraggingElement] = useState(false);

  return (
    <>
      <ZoomTracker onZoomChange={onZoomChange} />

      <ambientLight intensity={2} />

      <PlacementPlane tool={tool} onAddComment={onAddComment} />

      {designElements.map((element) => (
        <Card
          key={element.id}
          element={element}
          tool={tool}
          onAddComment={onAddComment}
          onMove={onMoveElement}
          onDragStart={() => setDraggingElement(true)}
          onDragEnd={() => setDraggingElement(false)}
        />
      ))}

      {comments.map((comment, index) => (
        <CommentPin
          key={comment.id}
          comment={comment}
          number={index + 1}
          selected={selectedId === comment.id}
          onSelect={() => onSelectComment(comment.id)}
        />
      ))}

      <MapControls
        enabled={!draggingElement}
        enableRotate={false}
        screenSpacePanning
        minZoom={30}
        maxZoom={250}
      />
    </>
  );
}

function formatTime(date: string) {
  return new Date(date).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function App() {
  const [tool, setTool] = useState<Tool>("select");

  const [filter, setFilter] = useState<Filter>("all");

  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [replyDraft, setReplyDraft] = useState("");

  const [zoomLevel, setZoomLevel] = useState(100);

  const [comments, setComments] = useState<CommentThread[]>(() => {
    const saved = localStorage.getItem("encube-comments");

    if (!saved) return [];

    try {
      return JSON.parse(saved);
    } catch {
      return [];
    }
  });

  const [designElements, setDesignElements] = useState<DesignElement[]>(() => {
    const saved = localStorage.getItem("encube-elements");

    if (!saved) return INITIAL_ELEMENTS;

    try {
      return JSON.parse(saved);
    } catch {
      return INITIAL_ELEMENTS;
    }
  });

  useEffect(() => {
    localStorage.setItem("encube-comments", JSON.stringify(comments));
  }, [comments]);

  useEffect(() => {
    localStorage.setItem("encube-elements", JSON.stringify(designElements));
  }, [designElements]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement;

      const isTyping =
        target.tagName === "INPUT" || target.tagName === "TEXTAREA";

      if (isTyping) return;

      if (event.key.toLowerCase() === "c") {
        setTool("comment");
      }

      if (event.key === "Escape") {
        setTool("select");
        setSelectedId(null);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  function addComment(position: [number, number, number]) {
    const id = crypto.randomUUID();

    const newComment: CommentThread = {
      id,
      position,
      author: "You",
      text: "",
      createdAt: new Date().toISOString(),
      resolved: false,
      replies: [],
    };

    setComments((current) => [...current, newComment]);

    setSelectedId(id);
    setTool("select");
    setReplyDraft("");
  }

  function updateCommentText(id: string, text: string) {
    setComments((current) =>
      current.map((comment) =>
        comment.id === id
          ? {
              ...comment,
              text,
            }
          : comment,
      ),
    );
  }

  function toggleResolved(id: string) {
    setComments((current) =>
      current.map((comment) =>
        comment.id === id
          ? {
              ...comment,
              resolved: !comment.resolved,
            }
          : comment,
      ),
    );
  }

  function addReply(id: string) {
    const text = replyDraft.trim();

    if (!text) return;

    const reply: Reply = {
      id: crypto.randomUUID(),
      author: "You",
      text,
      createdAt: new Date().toISOString(),
    };

    setComments((current) =>
      current.map((comment) =>
        comment.id === id
          ? {
              ...comment,
              replies: [...comment.replies, reply],
            }
          : comment,
      ),
    );

    setReplyDraft("");
  }

  function moveElement(id: string, position: [number, number, number]) {
    setDesignElements((current) =>
      current.map((element) =>
        element.id === id
          ? {
              ...element,
              position,
            }
          : element,
      ),
    );
  }

  function clearComments() {
    setComments([]);
    setSelectedId(null);

    localStorage.removeItem("encube-comments");
  }

  function resetElements() {
    setDesignElements(INITIAL_ELEMENTS);

    localStorage.removeItem("encube-elements");
  }

  const visibleComments = comments.filter((comment) => {
    if (filter === "open") {
      return !comment.resolved;
    }

    if (filter === "resolved") {
      return comment.resolved;
    }

    return true;
  });

  const openCount = comments.filter((comment) => !comment.resolved).length;

  const resolvedCount = comments.filter((comment) => comment.resolved).length;

  return (
    <div className="flex h-screen flex-col bg-neutral-100 text-neutral-900">
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-neutral-200 bg-white px-4">
        <div className="flex items-center gap-3">
          <span className="font-semibold">Encube Review</span>

          <div className="h-5 w-px bg-neutral-200" />

          <button
            type="button"
            onClick={() => setTool("select")}
            className={`rounded-md px-3 py-1.5 text-sm ${
              tool === "select"
                ? "bg-neutral-900 text-white"
                : "text-neutral-600 hover:bg-neutral-100"
            }`}
          >
            Select
          </button>

          <button
            type="button"
            onClick={() => setTool("comment")}
            className={`rounded-md px-3 py-1.5 text-sm ${
              tool === "comment"
                ? "bg-violet-600 text-white"
                : "text-neutral-600 hover:bg-neutral-100"
            }`}
          >
            Comment
          </button>
        </div>

        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={resetElements}
            className="text-xs text-neutral-400 hover:text-neutral-700"
          >
            Reset cards
          </button>

          <button
            type="button"
            onClick={clearComments}
            className="text-xs text-neutral-400 hover:text-neutral-700"
          >
            Clear comments
          </button>

          <span className="text-sm tabular-nums text-neutral-500">
            {zoomLevel}%
          </span>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        <main
          className={`relative min-w-0 flex-1 bg-neutral-200 ${
            tool === "comment" ? "cursor-crosshair" : ""
          }`}
        >
          <Canvas
            orthographic
            camera={{
              position: [0, 0, 100],
              zoom: INITIAL_ZOOM,
              near: 0.1,
              far: 1000,
            }}
          >
            <Scene
              tool={tool}
              comments={comments}
              selectedId={selectedId}
              designElements={designElements}
              onAddComment={addComment}
              onSelectComment={setSelectedId}
              onZoomChange={setZoomLevel}
              onMoveElement={moveElement}
            />
          </Canvas>

          <div className="pointer-events-none absolute bottom-4 left-4 rounded-md border border-neutral-200 bg-white px-3 py-2 text-xs text-neutral-500 shadow-sm">
            {tool === "comment"
              ? "Click anywhere to add a comment · Esc to cancel"
              : "Drag canvas to pan · Drag cards to move · Scroll to zoom · C to comment"}
          </div>
        </main>

        <aside className="flex w-96 shrink-0 flex-col border-l border-neutral-200 bg-white">
          <div className="border-b border-neutral-200 p-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Comments</h2>

              <span className="text-xs text-neutral-400">
                {comments.length} total
              </span>
            </div>

            <div className="mt-4 flex gap-1 rounded-lg bg-neutral-100 p-1">
              <button
                type="button"
                onClick={() => setFilter("all")}
                className={`flex-1 rounded-md px-2 py-1.5 text-xs ${
                  filter === "all"
                    ? "bg-white font-medium shadow-sm"
                    : "text-neutral-500"
                }`}
              >
                All {comments.length}
              </button>

              <button
                type="button"
                onClick={() => setFilter("open")}
                className={`flex-1 rounded-md px-2 py-1.5 text-xs ${
                  filter === "open"
                    ? "bg-white font-medium shadow-sm"
                    : "text-neutral-500"
                }`}
              >
                Open {openCount}
              </button>

              <button
                type="button"
                onClick={() => setFilter("resolved")}
                className={`flex-1 rounded-md px-2 py-1.5 text-xs ${
                  filter === "resolved"
                    ? "bg-white font-medium shadow-sm"
                    : "text-neutral-500"
                }`}
              >
                Resolved {resolvedCount}
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {visibleComments.length === 0 ? (
              <div className="p-4">
                <div className="rounded-lg border border-dashed border-neutral-300 p-6 text-center text-sm text-neutral-400">
                  No comments here yet.
                </div>
              </div>
            ) : (
              <div className="divide-y divide-neutral-100">
                {visibleComments.map((comment) => {
                  const number =
                    comments.findIndex((item) => item.id === comment.id) + 1;

                  const selected = selectedId === comment.id;

                  return (
                    <div
                      key={comment.id}
                      className={`p-4 ${selected ? "bg-violet-50" : ""}`}
                    >
                      <button
                        type="button"
                        onClick={() => setSelectedId(comment.id)}
                        className="w-full text-left"
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold text-white ${
                              comment.resolved
                                ? "bg-neutral-400"
                                : "bg-violet-600"
                            }`}
                          >
                            {number}
                          </span>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">
                                {comment.author}
                              </span>

                              <span className="text-xs text-neutral-400">
                                {formatTime(comment.createdAt)}
                              </span>
                            </div>

                            {!selected && comment.text && (
                              <p className="mt-1 truncate text-sm text-neutral-500">
                                {comment.text}
                              </p>
                            )}
                          </div>

                          {comment.resolved && (
                            <span className="text-xs text-neutral-400">
                              Resolved
                            </span>
                          )}
                        </div>
                      </button>

                      {selected && (
                        <div className="mt-4">
                          <textarea
                            autoFocus={!comment.text}
                            value={comment.text}
                            onChange={(event) =>
                              updateCommentText(comment.id, event.target.value)
                            }
                            placeholder="Write your comment…"
                            className="min-h-20 w-full resize-none rounded-lg border border-neutral-200 bg-white p-3 text-sm outline-none focus:border-violet-400"
                          />

                          {comment.replies.length > 0 && (
                            <div className="mt-4 space-y-3 border-l-2 border-neutral-200 pl-3">
                              {comment.replies.map((reply) => (
                                <div key={reply.id}>
                                  <div className="flex gap-2 text-xs">
                                    <span className="font-medium">
                                      {reply.author}
                                    </span>

                                    <span className="text-neutral-400">
                                      {formatTime(reply.createdAt)}
                                    </span>
                                  </div>

                                  <p className="mt-1 text-sm text-neutral-700">
                                    {reply.text}
                                  </p>
                                </div>
                              ))}
                            </div>
                          )}

                          <div className="mt-4">
                            <textarea
                              value={replyDraft}
                              onChange={(event) =>
                                setReplyDraft(event.target.value)
                              }
                              placeholder="Write a reply…"
                              className="min-h-16 w-full resize-none rounded-lg border border-neutral-200 bg-white p-3 text-sm outline-none focus:border-violet-400"
                            />

                            <div className="mt-2 flex items-center justify-between">
                              <button
                                type="button"
                                onClick={() => toggleResolved(comment.id)}
                                className="text-xs font-medium text-neutral-500 hover:text-neutral-900"
                              >
                                {comment.resolved ? "Reopen" : "Resolve thread"}
                              </button>

                              <button
                                type="button"
                                onClick={() => addReply(comment.id)}
                                disabled={!replyDraft.trim()}
                                className="rounded-md bg-neutral-900 px-3 py-1.5 text-xs font-medium text-white disabled:cursor-not-allowed disabled:opacity-40"
                              >
                                Reply
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
