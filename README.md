# Encube Take-Home Test

A lightweight collaborative canvas commenting tool built with React, TypeScript, React Three Fiber, and Tailwind CSS.

The goal of this project is to demonstrate a simple design review workflow on top of an infinite, zoomable canvas with a 3D-capable rendering foundation.

## Features

- Pan-able and zoomable canvas
- Live zoom percentage indicator
- Four draggable design elements
- Comment mode for placing comments anywhere on the canvas
- Comments anchored to world coordinates
- Comment threads with replies
- Resolve and reopen comment threads
- Filter comments by All, Open, and Resolved
- Keyboard shortcuts
- Client-side persistence with `localStorage`

## Tech Stack

- React
- TypeScript
- Vite
- React Three Fiber
- Drei
- Three.js
- Tailwind CSS

## Getting Started

### Prerequisites

Make sure you have Node.js and npm installed.

### Installation

Clone the repository:

```bash
git clone https://github.com/CarloBarone-info/encube-take-home-test.git
```

Navigate into the project:

```bash
cd encube-take-home-test
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Vite will output a local development URL, usually:

```text
http://localhost:5173
```

## Build

To create a production build:

```bash
npm run build
```

To preview the production build locally:

```bash
npm run preview
```

## How to Use

### Canvas navigation

- Drag the empty canvas to pan
- Scroll to zoom
- The current zoom level is shown in the top-right toolbar
- Drag an individual design card to reposition it

### Comments

1. Click the **Comment** button or press `C`
2. Click anywhere on the canvas or on a design element
3. Enter your comment in the right-hand panel
4. Add replies to continue the discussion
5. Resolve or reopen a thread when needed

Comment pins remain anchored to their canvas position while panning and zooming.

### Keyboard shortcuts

- `C` — activate Comment mode
- `Esc` — exit Comment mode and close the selected comment

## Persistence

Comments and design element positions are persisted using `localStorage`.

This keeps the prototype fully client-side while allowing the state to survive a page refresh.

Use the toolbar actions to reset the design elements or clear comments.

## Project Structure

```text
src/
├── App.tsx
├── App.css
├── index.css
├── main.tsx
└── assets/
```

For the scope of this exercise, most of the feature logic is intentionally kept inside `App.tsx`.

In a production application, the canvas, comments, controls, state management, and persistence logic would be separated into smaller modules.

## Implementation Notes

The canvas is rendered using React Three Fiber with an orthographic camera.

An orthographic camera gives the interface the familiar feel of a 2D design canvas while still using a real Three.js scene underneath.

Comments are stored using world-space coordinates rather than browser pixel coordinates. This means a comment remains attached to the same location in the scene regardless of camera pan or zoom.

More detail about the implementation and tradeoffs can be found in [`DECISIONS.md`](./DECISIONS.md).

## Scope

This prototype intentionally focuses on the core review workflow.

Features that would be natural next steps in a production version include:

- Real-time multiplayer collaboration
- User accounts and permissions
- Presence cursors
- Server-side persistence
- Richer design elements and 3D content
- Comment notifications
- Camera navigation to selected comments
- More advanced responsive/mobile behavior

## Live Demo

A deployment can be found at [this URL](https://carlobarone-info.github.io/encube-take-home-test/)

## Video Walkthrough

A walktrough video can be found unlisted on my personal YouTube Channel, at [this link](https://youtu.be/82mfk4oxeRU)
