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

This was a time-boxing decision rather than a recommenda