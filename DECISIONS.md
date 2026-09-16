# Product and Technical Decisions

This document outlines the main decisions made while building the Encube take-home project.

The goal was to prioritize a complete and intuitive review workflow within the limited implementation time while keeping the underlying canvas architecture compatible with more advanced 3D use cases.

## 1. React Three Fiber as the Canvas Foundation

I chose React Three Fiber rather than implementing the canvas entirely with DOM elements.

Although the current prototype mostly behaves like a 2D design review tool, React Three Fiber provides a real Three.js scene and gives the project a natural path toward richer 3D functionality.

This felt particularly appropriate for Encube because the same canvas architecture could later support:

- 3D models
- depth and perspective
- annotations attached to 3D objects
- spatial design review
- richer scene interaction

For the current experience, I use an orthographic camera so the interaction still feels familiar to users of tools such as Figma or Miro.

## 2. Comments Use World Coordinates

Comment positions are stored in canvas/world coordinates rather than browser pixel coordinates.

For example, a comment stores a position similar to:

```ts
position: [x, y, z]
```

rather than:

```ts
left: 400
top: 250
```

This is important because viewport coordinates change whenever the user pans or zooms.

By anchoring comments to the Three.js scene, the annotation remains attached to the same logical point on the canvas regardless of camera movement.

This was one of the most important technical requirements of the exercise.

## 3. Explicit Comment Mode

I chose to require users to activate a Comment tool before placing a comment.

Users can do this either through the toolbar or by pressing `C`.

Without an explicit mode, a normal canvas click could be interpreted as either navigation, selection, dragging, or comment creation. That would make accidental comments much more likely.

The tradeoff is that placing a comment requires one additional action.

To reduce that friction:

- `C` immediately activates Comment mode
- the cursor changes to indicate comment placement
- the application returns to Select mode after a comment is placed
- `Esc` cancels Comment mode

## 4. Individual Design Elements Are Draggable

The placeholder design elements can be repositioned independently rather than being purely static content.

Dragging empty canvas space pans the camera, while dragging a design element moves that object.

During an object drag, camera controls are temporarily disabled so the two interactions do not compete with each other.

This makes the canvas feel more like an actual visual collaboration tool while keeping the interaction implementation relatively small.

## 5. Orthographic Camera

I chose an orthographic camera instead of a perspective camera.

The current product experience is primarily a design canvas, and an orthographic projection avoids perspective distortion when navigating between design elements.

It also means that zooming behaves more like traditional 2D design software.

At the same time, because everything is still rendered inside a Three.js scene, perspective or more advanced 3D camera modes could be introduced later if needed.

## 6. Client-Side State and localStorage

The assignment does not require a backend, so all state is managed locally in React.

Comments and design element positions are also persisted to `localStorage`.

This provides two useful properties for the prototype:

- refreshing the browser does not immediately destroy the review session
- the implementation remains entirely client-side

In a production environment, the same data structures could be synchronized with a backend and real-time collaboration layer.

## 7. Simple Thread Model

A comment thread contains:

- the original comment
- author
- creation time
- resolved state
- replies

Replies are represented as a flat list underneath the original message rather than recursively nested discussions.

This keeps the interaction simple and matches the lightweight design-review workflow required for the exercise.

Deep nested discussions could be added later, but I did not consider them necessary for this prototype.

## 8. Minimal State Management

I used standard React state rather than adding Redux, Zustand, or another state-management library.

The application state is relatively small and currently includes:

- active tool
- comments
- selected comment
- filter
- reply draft
- zoom level
- design element positions

Introducing a larger state-management dependency would add complexity without providing much benefit at this scale.

If the application grew to include multiplayer state, users, presence, larger scenes, and asynchronous server synchronization, I would reconsider this decision.

## 9. Scope Prioritization

Given the limited implementation window, I prioritized the core interaction loop:

1. Navigate the canvas
2. Move design elements
3. Place a comment
4. View the thread
5. Reply
6. Resolve or reopen the thread
7. Filter comments

I intentionally did not implement:

- authentication
- multiplayer synchronization
- presence indicators
- backend persistence
- permissions
- notifications
- complex 3D assets
- deep nested replies
- advanced animation
- full mobile optimization

These would be useful production features, but they were not necessary to demonstrate the primary product and technical concepts of the assignment.

## What I Would Build Next

With additional time, I would focus on:

### Real-time collaboration

Introduce shared state through a backend or real-time collaboration service so multiple users could see comments and object movement simultaneously.

### Camera focus for comments

Clicking a comment in the sidebar could smoothly pan the camera to the relevant canvas location.

### Stronger annotation relationships

Comments could optionally attach directly to a specific design or 3D object rather than only to a world-space position.

### Richer design content

The placeholder cards could be replaced by images, components, models, or imported 3D assets.

### Presence

Show active users and collaborator cursors to make the experience feel genuinely collaborative.

### Improved state architecture

As the feature set grows, I would separate the current prototype into dedicated canvas, comment, toolbar, persistence, and state-management modules.

## Summary

The main architectural decision was to build the prototype as a real Three.js scene while intentionally keeping the user experience similar to a familiar 2D collaboration tool.

The most important technical detail is that annotations exist in the same world coordinate system as the canvas content.

This allows comments to stay spatially anchored today while leaving the architecture open to more advanced 3D collaboration features in the future.