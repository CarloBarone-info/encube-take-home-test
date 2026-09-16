# Product and Technical Decisions

## Overview

This project is a lightweight collaborative canvas commenting tool built for the Encube take-home exercise.

Given the limited implementation time, I focused on making the core workflow complete and understandable:

- pan and zoom the canvas
- move design elements
- place comments
- reply to threads
- resolve and reopen comments
- filter between open and resolved discussions

I intentionally kept the scope small and avoided adding infrastructure that was not required by the exercise.

## React Three Fiber

I used React Three Fiber and Three.js for the canvas rather than building the experience entirely with positioned HTML elements.

The current interface behaves mostly like a 2D design canvas, but using a real Three.js scene gives the implementation a natural path toward more advanced 3D use cases.

I used an orthographic camera because it keeps the interaction visually similar to tools such as Figma or Miro while still working inside a 3D scene.

## Comment positioning

Comments are stored using canvas/world coordinates rather than browser pixel coordinates.

This means that a comment stays attached to the same point in the scene while the user pans or zooms.

Comments placed on movable design elements can also be associated with that element so they move together.

For a more complete 3D implementation, I would store those annotations in the object's local coordinate system rather than updating their world position manually. This would make the relationship work correctly with rotation, scale, and more complex 3D transforms.

## Interaction model

I used separate Select and Comment modes.

This avoids making every canvas click create a comment, which would conflict with panning, object movement, and selection.

The `C` shortcut activates Comment mode and `Esc` returns to Select mode.

Design elements can be dragged independently. While an element is being moved, the camera controls are temporarily disabled so the object drag and canvas pan do not compete with each other.

## State and persistence

The application uses standard React state rather than an additional state-management library.

For the current size of the prototype, `useState`, `useEffect`, and `useRef` were enough and kept the implementation straightforward.

Comments and design-element positions are persisted using `localStorage`.

This keeps the application fully client-side, as requested, while allowing the state to survive a page refresh.

In a real collaborative product, this state would instead be synchronized through a backend or real-time collaboration layer.

## Project structure

Most of the implementation currently lives in `App.tsx`.

This was mainly a time-boxing decision.

During the exercise, the interactions were changing quickly, so keeping the logic together made it faster to iterate without spending time creating abstractions before the final shape of the feature was clear.

For a longer-lived project, I would split the code into smaller areas such as:

```text
components/
  canvas/
  comments/
  toolbar/

hooks/
types/
```

I would also separate canvas state, comment state, persistence, and keyboard interactions into dedicated hooks or modules.

## Scope decisions

I deliberately did not implement:

- authentication
- real-time multiplayer synchronization
- backend persistence
- presence cursors
- permissions
- complex 3D models
- deep nested replies
- advanced mobile behavior

These would all be reasonable production features, but I chose to prioritize the core review workflow and canvas interaction.

## Further development

With more time, the main improvements I would make are:

1. Refactor the current single-file implementation into smaller components and hooks.
2. Store object-attached annotations in local object coordinates.
3. Add camera navigation so selecting a comment in the sidebar focuses the relevant area of the canvas.
4. Introduce real-time shared state for comments, object movement, and presence.
5. Replace the placeholder rectangles with richer design or 3D content.
6. Improve mobile and touch interactions.

## Summary

The main technical choice was to keep both canvas content and comments inside a meaningful spatial coordinate system rather than positioning them relative to the viewport.

The main product choice was to keep navigation, object movement, and commenting as clear separate interactions.

The implementation is intentionally simple, but the underlying approach leaves room for the same workflow to expand into a more advanced collaborative 3D environment.