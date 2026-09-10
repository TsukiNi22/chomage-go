# pikselite - report

## Custom

### Bug~Other

```
 - the object hierarchy cannot be reordered, there is no drag and drop
```

### Design

```
 - there is no help anywhere in the application
 - the edit button still shows a placeholder
 - the interface is not responsive at all
```

## Test Plan (can be inacurate on some of them)

> [!IMPORTANT]
> Anything that require external file was not tested!!!

### F1 - Create a new project
> 🟡 **~**

```
 - it crashes the first time you start a new project
```

### F2 - Save a project
> 🟡 **~**

```
 - the save button sits in the home menu but not in the editor itself
```

### F3 - Open an existing project
> 🟡 **~**

```
 - cancelling the open-project dialog leaves an invalid project entry in the list
```

### F4 - Import a project
> 🟢 **OK**

### F5 - Create Pixel sprites using the sprite editor
> 🟢 **OK**

### F6 - Edit Pixel sprite using the sprite editor
> 🟢 **OK**

### F7 - Save Pixel sprite using the sprite editor
> 🟢 **OK**

### F8 - Load Pixel sprite using the sprite editor
> 🟢 **OK**

### F9 - Remove pixels using the eraser
> 🟢 **OK**

### F10 - Switch pixel element brush
> 🟢 **OK**

### F11 - Resize the brush
> 🟢 **OK**

### F12 - Pixel sprite color pattern
> 🟢 **OK**

### F13 - Place elements
> 🟢 **OK**

### F14 - Create PNG sprite game object to current scene
> 🟡 **~**

```
 - you cannot deselect the object while placing it if you change your mind
```

### F15 - Create Pixel sprite game object to current scene
> 🟡 **~**

```
 - you cannot deselect the object while placing it if you change your mind
```

### F16 - Rename a game object
> 🟢 **OK**

### F17 - Remove a game object
> 🟢 **OK**

### F18 - Move a game object
> 🟡 **~**

```
 - two sprites erase each other when you move them
```

### F19 - Enable/Disable a game object
> 🟢 **OK**

### F20 - Add a physics component to an existing game object
> 🟢 **OK**

### F21 - Add gravity force to a physics game object
> 🟢 **OK**

### F22 - Add rotation locker to the a physics game object
> 🟢 **OK**

### F23 - Remove a physics component to an existing game object
> 🟢 **OK**

### F24 - Add a velocity component to an existing game object
> 🔴 **NONE**

```
 - the velocity never applies, the object does not move
```

### F25 - Remove a velocity component to an existing PNG sprite game object
> 🟢 **OK**

### F26 - Add a sprite component to an existing game object
> 🟢 **OK**

### F27 - Resize a sprite game object using sprite component
> 🟢 **OK**

### F28 - Change renderer layer of a sprite game object
> 🟢 **OK**

### F29 - Remove a sprite component to an existing game object
> 🟢 **OK**

### F30 - Add a script component to an existing game object
> 🟢 **OK**

### F31 - Remove a script component to an existing game object
> 🟢 **OK**

### F32 - Configure sprite game object events using scripting
> 🟢 **OK**

### F33 - Add a light component to an existing game object
> 🔴 **NONE**

### F34 - Add point light to the game object
> 🔴 **NONE**

### F35 - Add directional light to the game object
> 🔴 **NONE**

### F36 - Remove a light component to an existing game object
> 🔴 **NONE**

### F37 - Add an animation component to an existing game object
> 🔴 **NONE**

### F38 - Remove an animation component to an existing game object
> 🔴 **NONE**

### F39 - Add a sound component to an existing game object
> 🔴 **NONE**

### F40 - Add ambient sound to the game object
> 🔴 **NONE**

### F41 - Add spatialized sound to the game object
> 🔴 **NONE**

### F42 - Remove a sound component to an existing game object
> 🔴 **NONE**

### F43 - Add a button component to an existing game object
> 🔴 **NONE**

### F44 - Remove a button component to an existing game object
> 🔴 **NONE**

### F45 - Add a text component to an existing game object
> 🔴 **NONE**

### F46 - Remove a text component to an existing game object
> 🔴 **NONE**

### F47 - Add a ProgessBar component to an existing game object
> 🔴 **NONE**

### F48 - Remove a ProgressBar component to an existing game object
> 🔴 **NONE**

### F49 - Simulate gameplay in real time inside the editor
> 🟢 **OK**

### F50 - Simulate pixel physics
> 🟢 **OK**

### F51 - Simulate pixel interactions
> 🟢 **OK**

### F52 - Simulate particle interaction with pixels
> 🟢 **OK**

### F53 - Create a scene
> 🟢 **OK**

### F54 - Remove a scene
> 🟢 **OK**

### F55 - Load a scene in project editor
> 🟡 **~**

```
 - no save prompt when you switch scene, unsaved work is lost silently
```

### F56 - Reload scene in build/preview
> 🟢 **OK**

### F57 - Switch scene in build/preview
> 🟢 **OK**

### F58 - Generate a playable executable
> 🟢 **OK**
