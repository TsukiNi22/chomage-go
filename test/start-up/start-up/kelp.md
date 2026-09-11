# kelp - report

## Custom

### Bug~Other

```
 - errors never disappear on their own
```

### Design

```
 - the cards should all share the same size, as in the example
 - two questions and answers cannot be shown at the bottom at the same time, and resizing has no animation on some parts
 - the profile text should be larger, or a text-size setting should be offered
 - the left bar could be open by default, its state resets on every page change
 - the settings do not need their own category, the footer of the profile would do the same job
 - a badge or a red dot would help when friend requests are waiting
```

### Global

```
 - good idea, but a user will probably be too lazy for it, unless it is a professor setting up a custom activity
```

## Test Plan (can be inacurate on some of them)

> [!IMPORTANT]
> Anything that require external file was not tested!!!

### F1 - Sign up
> 🟡 **~**

```
 - the password rules are imposed, a weak password is refused outright
 - clicking create an account a second time does nothing once the error has faded, then "Fail to create user" appears
 - "Too many requests" is returned after only five attempts
 - the invalid-username error says nothing useful: which characters are allowed, how many, or whether the name is already taken
```

### F2 - Sign in
> 🟢 **OK**

### F3 - Tutorial
> 🟢 **OK**

### F4 - Create a deck
> 🟢 **OK**

### F5 - Create a card blueprint
> 🟡 **~**

```
 - the deck picker for choosing the owner deck sits on the slot itself, you cannot tell whether you selected it or whether it is only showing the choice
```

### F6 - Image occlusion card
> 🔴 **NONE**

### F7 - Learn deck
> 🟡 **~**

```
 - the same deck cannot be restarted several times in a row
```

### F8 - Review card
> 🟢 **OK**

### F9 - Reveal back
> 🟢 **OK**

### F10 - Input recall ease
> 🟢 **OK**

### F11 - Import CSV file
> 🟢 **OK**

### F12 - Delete a deck
> 🟢 **OK**

### F13 - Browse cards in a deck
> 🟢 **OK**

### F14 - Edit card content
> 🟢 **OK**

### F15 - Edit profile informations
> 🟢 **OK**

### F16 - Edit profile avatar
> 🟢 **OK**

### F17 - Statistics
> 🔴 **NONE**

### F18 - Achievements
> 🔴 **NONE**

### F19 - Access list of friend
> 🟡 **~**

```
 - the All tab lists friends only, it leaves out pending requests and blocked users
```

### F20 - Add friend
> 🟡 **~**

```
 - a friend can only be added by id, not by username
 - sending a request to someone who already sent you one fails with an error instead of simply accepting it
```

### F21 - Accept friend request
> 🟡 **~**

```
 - clicking a user in the pending requests hides their profile
```

### F22 - View other user's profile
> 🔴 **NONE**

### F23 - Remove friend
> 🟢 **OK**

### F24 - Block friend
> 🟢 **OK**

### F25 - Unblock friend
> 🟡 **~**

```
 - after unblocking someone and sending a new request, it first says the user does not exist even though the request was actually sent
```

### F26 - Download a public deck
> 🔴 **NONE**

### F27 - Rate a public deck
> 🔴 **NONE**

### F28 - Comment a public deck
> 🔴 **NONE**

### F29 - Publish a deck
> 🔴 **NONE**

### F30 - Trending decks
> 🔴 **NONE**

### F31 - Search deck via tag
> 🔴 **NONE**

### F32 - Mobile
> 🔴 **NONE**

### F33 - Kelp tree
> 🔴 **NONE**

### F34 - Showdown
> 🔴 **NONE**

### F35 - Biling process
> 🔴 **NONE**

### F36 - Data Synchronization
> 🔴 **NONE**

### F37 - Undo Review
> 🔴 **NONE**

### F38 - Logout
> 🟢 **OK**

### F39 - Delete account
> 🟢 **OK**
