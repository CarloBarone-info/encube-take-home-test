# Product and Technical Decisions

## Overview

This project is a simplified collaborative canvas commenting tool built as part of the Encube take-home exercise.

The objective was not to recreate the full feature set of a mature collaboration product such as Figma or Miro. Instead, I focused on implementing a small but coherent interaction loop:

1. Navigate an infinite-style canvas
2. Move design elements independently
3. Place comments spatially
4. Open and interact with comment threads
5. Reply to comments
6. Resolve and reopen discussions
7. Filter between open and resolved conversations

The implementation was completed within a deliberately limited time window, so I prioritized the parts of the exercise that demonstrate the underlying product and technical concepts rather than breadth of functionality.

The main areas I wanted to demonstrate were:

- spatial coordinate handling
- canvas interaction design
- separation between navigation and object manipulation
- annotation placement
- basic review workflow
- use of a 3D-capable rendering architecture
- deliberate scope management

---

# 1. Technology Choice

The project uses:

- React
- TypeScript
- Vite
- React Three Fiber
- Three.js
- Drei
- Tailwind CSS

## Why React

React was required by the assignment and is also a natural fit for the interface surrounding the canvas.

The toolbar, comment list, filters, thread UI, text inputs, and state transitions all map well to React's component and state model.

## Why TypeScript

TypeScript was required by the assignment.

It is particularly useful in this project because there are several related state structures:

- canvas tools
- design elements
- comment threads
- replies
- filters
- positions

For example, positions are consistently represented as:

```ts
[number, number, number]
```

rather than loosely structured objects.

This reduces ambiguity when values are passed between the Three.js scene and the React interface.

---

# 2. Why React Three Fiber

I chose React Three Fiber rather than building the entire canvas from absolutely positioned HTML elements or using a purely 2D canvas abstraction.

React Three Fiber provides a React interface to Three.js.

This means that even though the current prototype behaves largely like a 2D design canvas, the underlying content exists inside an actual 3D scene.

That decision was influenced by the context of the assignment: Encube is building a visual collaboration platform with advanced 3D capabilities.

The current prototype therefore has a more natural architectural path toward features such as:

- 3D models
- object depth
- perspective cameras
- annotations attached to 3D geometry
- model review
- spatial comments
- object selection
- transformations
- scene navigation

A DOM-only implementation could have fulfilled the immediate visual requirements, but it would demonstrate less about how the same interaction model could extend into Encube's product domain.

---

# 3. Orthographic Camera

The Three.js scene uses an orthographic camera rather than a perspective camera.

This was intentional.

The current task is fundamentally a design-review canvas, so a perspective camera would add visual distortion without adding meaningful functionality.

An orthographic camera gives the interface behavior closer to tools such as Figma or Miro:

- objects do not become visually smaller because of depth
- zoom behaves predictably
- spatial relationships remain easy to understand
- rectangular design elements remain visually flat

At the same time, the application is still using a genuine Three.js scene.

A future version could therefore introduce perspective views or switch between 2D-style and 3D navigation modes without replacing the entire rendering architecture.

---

# 4. Canvas Navigation

The canvas supports:

- panning
- zooming
- a live zoom indicator
- resetting zoom to 100%

Navigation is controlled through Drei's `MapControls`.

Rotation is intentionally disabled.

This leaves only the interactions relevant to the prototype:

- move around the workspace
- move closer or further away

The zoom value shown in the toolbar is calculated relative to the initial camera zoom.

The initial camera zoom is treated as:

```text
100%
```

This creates a more familiar representation for users than exposing the raw Three.js camera zoom value.

Clicking the zoom percentage resets the camera zoom to its initial value.

This is a small interaction, but it makes the canvas controls behave more like a finished product rather than a technical prototype.

---

# 5. Design Elements

The canvas contains a small set of placeholder design elements.

They are deliberately simple rectangular objects rather than detailed mockups.

This was a scope decision.

The design elements exist mainly to provide spatial content for:

- canvas navigation
- object manipulation
- annotation placement
- design review

Spending substantial time designing realistic mock interfaces would not have materially improved the technical demonstration.

## Individual object movement

The design elements can be dragged independently.

This creates an important distinction between two interactions:

### Dragging empty canvas space

Pans the camera.

### Dragging a design element

Moves that individual object.

During an object drag, the camera controls are temporarily disabled.

Without this, both the object and the camera can respond to the same pointer movement, which creates unpredictable interaction.

Disabling camera controls during object manipulation creates a clear ownership model for the gesture.

---

# 6. Comment Placement

Comments are placed using an explicit Comment tool.

The tool can be activated through the toolbar or using the `C` keyboard shortcut.

After a comment is placed, the application returns to Select mode.

`Esc` exits Comment mode and closes the currently selected thread.

## Why use an explicit Comment mode?

It would have been possible to interpret every canvas click as a new comment.

I deliberately avoided that interaction.

A canvas click can potentially mean several things:

- select something
- begin dragging
- pan
- inspect an object
- place an annotation

Automatically creating comments from normal clicks would therefore make the interface prone to accidental annotations.

An explicit Comment mode introduces one additional user action but removes that ambiguity.

The keyboard shortcut keeps the workflow fast for frequent use.

---

# 7. World-Space Comment Coordinates

One of the most important implementation decisions was storing annotation positions in scene coordinates rather than viewport coordinates.

A comment stores a position such as:

```ts
position: [x, y, z]
```

The application does not store the comment using screen values such as:

```ts
left: 420
top: 280
```

Viewport coordinates describe where something happens to appear on a user's screen.

They do not describe where the annotation belongs in the canvas.

If annotations were stored in viewport coordinates, moving or zooming the camera would separate the annotation from the content it was intended to reference.

By storing world coordinates, comment markers stay at the same spatial location while the camera moves.

This distinction between scene coordinates and viewport coordinates is one of the central technical concepts behind the prototype.

---

# 8. Comments Attached to Design Elements

There are two useful concepts for annotations in a spatial application:

1. comments attached to the canvas
2. comments attached to an object

A comment placed on empty canvas space can remain anchored to a world-space position.

A comment placed on a movable design element ideally needs a relationship to that element.

The lightweight implementation can represent that relationship using an optional element identifier:

```ts
elementId?: string
```

When the relevant element moves, the annotation can move by the same positional delta.

This gives the expected interaction for the prototype:

```text
place comment on card
        ↓
move card
        ↓
comment follows card
```

## More robust production implementation

The delta-based approach is sufficient for simple translated rectangles, but it would not be the approach I would use for arbitrary production 3D objects.

A stronger model would store the annotation in the object's **local coordinate system**.

For example:

```ts
{
  elementId: "object-42",
  localPosition: [0.4, -0.2, 0.1]
}
```

The renderer would then transform that local position into world space using the parent object's transformation matrix.

Conceptually:

```text
local annotation position
          ↓
object transform
          ↓
world position
          ↓
camera projection
          ↓
screen position
```

This becomes important when an object can:

- rotate
- scale
- move through depth
- belong to another transformed group
- use arbitrary 3D geometry

A local-coordinate approach would therefore be the natural next step for a more complete Encube-style implementation.

---

# 9. Comment Pins and HTML UI

The annotations are represented visually as numbered pins.

The canvas itself is rendered using Three.js, while the annotation UI uses HTML projected into the scene.

This provides a useful combination:

Three.js controls the spatial position.

HTML/CSS controls the interaction and styling.

Using normal HTML for the comment marker allows familiar browser behavior for:

- buttons
- hover states
- text
- accessibility
- CSS styling

while its position remains connected to the 3D scene.

---

# 10. Comment Threads

Each thread contains:

- an ID
- canvas position
- author
- timestamp
- initial comment text
- resolved state
- replies
- optionally, an associated design element

Replies are represented as a flat list beneath the original comment.

I intentionally did not implement recursively nested comments.

For a design-review workflow, the important abstraction is generally:

```text
annotation
  ↳ discussion
```

rather than a deeply branching discussion tree.

Recursive replies would add both state and interface complexity without materially improving this prototype.

---

# 11. Editing Comments

The original comment text remains editable through the thread interface.

This keeps the implementation simple while satisfying the requirement that comment text can be edited.

A more complete system would likely distinguish between:

- creating
- editing
- edited timestamps
- ownership
- edit permissions
- deletion

Those concerns were deliberately excluded from the prototype.

---

# 12. Resolve and Reopen

Threads have a boolean resolved state.

A resolved thread remains part of the canvas instead of being deleted.

This reflects how design-review systems generally behave: resolving a discussion represents workflow state rather than removal of historical information.

Resolved comments are also visually differentiated from active comments.

Threads can be reopened if further discussion is necessary.

---

# 13. Comment Filtering

The comment sidebar provides:

- All
- Open
- Resolved

The counts are derived directly from the current thread collection.

Filtering only changes the list being displayed.

It does not destroy or mutate thread state.

This keeps the model straightforward and predictable.

---

# 14. Sidebar Interaction

The sidebar acts as the primary discussion surface.

Selecting a comment pin opens the corresponding thread.

Selecting a thread in the list also makes that comment active.

I chose a side panel instead of a floating popup because it gives replies and longer text a stable layout.

This also keeps the canvas visually cleaner.

A floating popover might work well for quick annotations, but it becomes less convenient once a thread contains several replies.

---

# 15. Client-Side Persistence

The assignment explicitly states that no backend is required.

For that reason, all application state remains client-side.

Comments and design-element positions are stored in `localStorage`.

This gives the prototype one useful quality beyond purely temporary React state:

refreshing the page does not immediately erase the review session.

It also demonstrates a basic persistence boundary without introducing unnecessary backend infrastructure.

## Why not build a backend?

A backend would introduce work around:

- API design
- database schema
- hosting
- network state
- errors
- authentication
- synchronization

None of those were necessary to demonstrate the interaction requested by the assignment.

Given the limited time available, they would reduce the quality of the actual canvas experience.

---

# 16. State Management

The prototype uses React's built-in state primitives:

- `useState`
- `useEffect`
- `useRef`

I intentionally did not introduce:

- Redux
- Zustand
- MobX
- another external global-state solution

The amount of application state is still small enough that adding a state-management dependency would create more structure than value.

The relevant state currently includes concepts such as:

- active tool
- comments
- active thread
- comment filter
- reply draft
- design elements
- zoom level
- zoom reset state

For a larger product, especially one with real-time collaboration, I would reconsider this decision.

---

# 17. Why Most of the Implementation Is in `App.tsx`

For a production application, I would not keep this amount of functionality in a single component file.

The current implementation intentionally keeps much of the prototype in `App.tsx`.

This was a time-boxing decision rather than a recommendation for long-term architecture.

The project was implemented within a short take-home window.

Splitting every concern immediately into separate modules would require additional time for:

- file creation
- prop interfaces
- exports
- imports
- shared type placement
- state ownership decisions
- refactoring while features were still changing rapidly

During a fast prototype, keeping closely related logic together can make iteration substantially faster.

It also reduced the chance of spending limited implementation time creating abstractions before the final shape of the feature was known.

## How I would refactor it

With additional development time, I would move toward a structure similar to:

```text
src/
  components/
    canvas/
      CanvasViewport.tsx
      Scene.tsx
      DesignElement.tsx
      CommentPin.tsx
      CameraControls.tsx

    comments/
      CommentsPanel.tsx
      CommentThread.tsx
      CommentList.tsx
      CommentFilters.tsx
      ReplyComposer.tsx

    toolbar/
      Toolbar.tsx
      ZoomControl.tsx

  hooks/
    useComments.ts
    useCanvasElements.ts
    useKeyboardShortcuts.ts
    useLocalStorage.ts

  types/
    comments.ts
    canvas.ts

  data/
    initialElements.ts

  App.tsx
```

At that point, `App.tsx` would mainly compose the major sections and coordinate high-level state.

I would perform this refactor after stabilizing the product behavior rather than before.

---

# 18. Why I Did Not Abstract Everything Immediately

An early abstraction is useful only when the correct boundaries are reasonably clear.

During development, several concepts changed rapidly:

- comments became selectable
- design elements became draggable
- camera controls needed to be disabled during dragging
- zoom state moved from static UI to camera-derived state
- comments gained persistence
- design elements gained persistence
- annotations gained potential relationships with design elements

Creating rigid abstractions before those interactions were understood would likely result in more refactoring rather than less.

For this exercise, I prioritized making the complete interaction understandable first.

---

# 19. Styling

Tailwind CSS is used for most interface styling.

The visual system is deliberately restrained:

- neutral canvas background
- white toolbar and sidebar
- simple borders
- violet annotation state
- minimal shadows
- simple typography

The purpose was to communicate hierarchy clearly without spending a disproportionate amount of the exercise on visual decoration.

The project is intended to feel like a lightweight productivity tool rather than a marketing website.

---

# 20. Accessibility Considerations

The prototype uses standard HTML buttons and text areas for much of the UI rather than rendering all controls directly into WebGL.

This gives a better baseline for:

- keyboard interaction
- focus
- semantic controls
- text input
- browser accessibility behavior

There is still substantial accessibility work that would be required for production.

Examples include:

- more complete keyboard canvas navigation
- screen-reader descriptions of canvas objects
- focus management when threads open
- accessible announcements when comments are added or resolved
- stronger contrast validation
- keyboard object movement

---

# 21. Performance Considerations

The current canvas contains only a handful of objects and comments, so straightforward React state updates are sufficient.

A production infinite canvas could contain thousands of objects and annotations.

At that scale, I would investigate:

- selective rendering
- memoization
- spatial indexing
- viewport culling
- instanced rendering
- object virtualization
- optimized shared state
- avoiding whole-scene React updates
- annotation clustering at low zoom levels

React Three Fiber provides a useful foundation for optimizing rendering without giving up React for the rest of the application.

---

# 22. Infinite Canvas Scope

The prototype represents an effectively large navigation surface rather than implementing mathematically unlimited coordinates.

The invisible placement surface is intentionally much larger than the initial viewport.

For the purposes of this exercise, this creates the expected infinite-canvas interaction.

A production implementation might need to consider:

- floating-point precision at very large distances
- origin rebasing
- dynamic content loading
- spatial partitioning
- extremely distant object handling

Those concerns are unnecessary at this scale.

---

# 23. Responsive Design

The prototype is primarily optimized for desktop.

This was deliberate because the core interaction requires:

- pointer manipulation
- canvas navigation
- side-panel discussion

A production version would need additional behavior for smaller screens.

Possible approaches include:

- collapsible comments panel
- bottom-sheet discussion UI
- touch-specific pan and zoom
- larger touch targets
- gestures for object manipulation
- responsive toolbars

Mobile optimization was lower priority than completing the core desktop review experience.

---

# 24. Real-Time Collaboration

The application is described as collaborative, but the exercise explicitly does not require a backend.

The prototype therefore implements the **interaction model of a collaborative review system**, not networking between multiple active clients.

The largest architectural addition for a real product would be synchronized shared state.

Possible synchronization technologies could include:

- WebSockets
- a collaborative state service
- CRDT-based systems
- operational transformation
- hosted collaboration infrastructure

Shared state would need to include:

- comments
- replies
- resolved status
- element positions
- active users
- presence
- potentially cursor positions

---

# 25. Concurrency

Once multiple users can edit the same scene, several conflicts become possible.

For example:

- two users move the same element
- two users edit the same comment
- a thread is resolved while another user is replying
- an object is deleted while it still has annotations

These problems do not exist in the current client-only prototype.

A production architecture would need explicit conflict-resolution rules.

---

# 26. User Identity

The prototype uses a simple local author value such as:

```text
You
```

Authentication was intentionally excluded.

A production system would associate comments with authenticated users and include:

- user ID
- name
- avatar
- permissions
- organization/workspace membership

Authorship should ultimately be based on trusted backend identity rather than client-generated values.

---

# 27. Permissions

A production review system would likely require permissions such as:

- view
- comment
- edit canvas
- resolve comments
- delete comments
- manage project

Those permissions are outside the scope of the current implementation.

---

# 28. Comment Notifications

A real collaborative implementation would probably notify users when:

- someone replies
- they are mentioned
- their comment is resolved
- a thread they participated in changes

Notifications were intentionally excluded because they depend on users, backend persistence, and asynchronous infrastructure.

---

# 29. Navigating to Comments

One useful improvement would be camera navigation from the sidebar.

Selecting a thread could automatically center or smoothly animate the camera toward that comment's position.

This would become particularly valuable on a much larger canvas.

The current implementation keeps selection simple and avoids introducing camera animation logic.

---

# 30. Selection Model

The prototype only needs enough selection state to distinguish the active comment and object-drag gesture.

A richer editor would likely introduce a formal selection model supporting:

- selected design object
- multiple selection
- bounding boxes
- hover state
- transformation controls
- keyboard manipulation

This could become its own state domain rather than remaining implicit in pointer interactions.

---

# 31. Richer 3D Content

The current rectangles are intentionally simple.

A natural continuation of the prototype would be importing richer scene content such as:

- GLTF / GLB models
- images
- UI mockups
- meshes
- CAD-derived geometry

Annotations could then be placed on actual object surfaces through raycasting.

That would more fully demonstrate the benefit of using a Three.js-based architecture.

---

# 32. Surface-Level 3D Annotations

For a genuine 3D review workflow, an annotation should potentially capture more than an XYZ position.

Useful information might include:

- parent object ID
- local-space point
- surface normal
- triangle or face reference
- camera orientation at creation
- model version

This would allow annotations to remain meaningful even as the reviewer moves around a complex object.

---

# 33. Object Transformations

The current design elements are translated through the canvas.

Future object manipulation could include:

- rotation
- scaling
- depth movement
- snapping
- alignment
- grouping

At that point, local-space annotations become substantially more important than world-position updates.

---

# 34. Persistence Architecture

`localStorage` is useful for a prototype, but it would not be suitable as the authoritative data store for a collaborative product.

A production implementation would likely split state into:

### Server-persisted state

- comments
- replies
- resolved status
- design object state

### Ephemeral collaborative state

- cursor position
- active tool
- selected object
- camera position
- user presence

Not all collaborative information needs permanent storage.

---

# 35. Error Handling

Because the prototype is fully local, there are few network failure states.

Adding a backend would require UI for:

- failed comment submission
- lost connection
- reconnection
- conflicting edits
- authorization errors
- stale document versions

These states would be important product considerations in a real implementation.

---

# 36. Data Validation

The prototype trusts the locally generated data.

A backend implementation should validate:

- comment length
- valid object IDs
- coordinates
- permissions
- author identity
- thread state transitions

Client validation should improve UX, while server validation should enforce correctness.

---

# 37. Testing Strategy

Given the limited implementation window, I prioritized manual verification of the complete user workflow.

The most important behaviors to test are:

1. canvas pans correctly
2. zoom changes smoothly
3. zoom percentage updates
4. zoom can reset
5. individual elements move independently
6. camera does not pan while an element is being dragged
7. Comment mode activates correctly
8. comments can be placed on canvas space
9. comments can be placed on design elements
10. annotations remain correctly positioned during camera navigation
11. threads can be selected
12. text can be edited
13. replies can be added
14. threads can be resolved
15. resolved threads can be reopened
16. filtering behaves correctly
17. state survives a refresh
18. the production build completes successfully

With more development time, I would add automated tests around the state logic and component interaction.

---

# 38. Deployment

The project is built using Vite and deployed as a static site.

Because GitHub Pages hosts project repositories under a repository-specific path rather than the root domain, Vite requires the repository path to be configured as its build base.

The deployed version must also publish the generated `dist` directory rather than the TypeScript source repository itself.

A GitHub Actions deployment workflow is therefore used to:

1. check out the repository
2. install dependencies
3. build the Vite application
4. upload `dist`
5. publish the generated site to GitHub Pages

This deployment structure keeps hosting simple and appropriate for a client-only prototype.

---

# 39. Scope Tradeoffs

The primary constraint on the implementation was time.

I intentionally chose completeness of the main workflow over implementing many partially finished features.

The main loop was prioritized as:

```text
navigate canvas
      ↓
move content
      ↓
place annotation
      ↓
write comment
      ↓
reply
      ↓
resolve
      ↓
filter
```

This meant deliberately not spending substantial implementation time on features such as:

- authentication
- backend APIs
- networking
- polished mock designs
- complex animation
- recursive discussions
- sophisticated state-management infrastructure
- deep component abstractions
- production-grade responsive behavior

---

# 40. Further Development

Given more time, I would continue development roughly in this order.

## 1. Refactor application structure

The first step would be separating `App.tsx` into clear canvas, comments, toolbar, state, and persistence modules.

The current single-file structure was useful for rapid iteration, but modularization would improve maintainability as soon as the behavior stabilizes.

## 2. Replace delta-based annotation attachment with local coordinates

Annotations attached to design objects would store their position relative to the parent object's coordinate system.

This would make attachments robust to:

- translation
- rotation
- scaling
- parent transforms

## 3. Camera navigation to annotations

Selecting a comment from the sidebar would center or animate the camera toward that annotation.

## 4. Real-time collaboration

Move shared state out of `localStorage` and into a synchronized collaboration layer.

## 5. Presence

Add:

- user cursors
- active collaborators
- selection indicators
- potentially camera/frustum awareness

## 6. Richer 3D assets

Support actual models and allow raycast-based comments directly on mesh surfaces.

## 7. Better object manipulation

Introduce:

- selection states
- transform handles
- multi-select
- snap/alignment behavior
- keyboard movement

## 8. Comment UX

Extend discussion functionality with:

- edit history
- delete
- mentions
- reactions
- richer timestamps
- notifications
- assigned reviewers

## 9. Backend persistence and history

Store document state remotely and preserve:

- revisions
- authorship
- activity history
- model/document versions

## 10. Responsive and touch interfaces

Design a dedicated mobile/tablet interaction model rather than merely shrinking the desktop interface.

---

# 41. What I Would Keep

Not every prototype decision would need to be replaced.

Several choices would remain appropriate as the application grew:

- React for surrounding product UI
- TypeScript
- Three.js / React Three Fiber for spatial content
- an orthographic review mode
- world/local coordinate-based annotation placement
- explicit interaction modes
- standard HTML UI for comment composition
- comments as persistent threads rather than disposable popovers

---

# 42. Final Reflection

The main technical idea behind the implementation is that canvas content and annotations should exist in a meaningful spatial coordinate system rather than being positioned relative to the browser viewport.

That allows the interface to behave correctly as users navigate the canvas and provides a foundation for object-relative annotations and more sophisticated 3D workflows.

The main product decision was to keep navigation, object manipulation, and commenting understandable as separate interactions rather than trying to infer too many intentions from the same pointer gesture.

The implementation deliberately favors a complete and understandable prototype over premature production architecture.

Given the short implementation window, keeping the core code close together made iteration faster. Given more time, the next engineering step would be to retain the same data and interaction model while separating the implementation into dedicated components, hooks, and state domains.

The resulting prototype is therefore intended to demonstrate both the immediate review workflow and a direction in which that workflow could evolve into a richer collaborative 3D product.