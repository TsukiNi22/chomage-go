# reflog - report

## Custom

### Bug~Other

```
 - no email verification, the account is live immediately and nothing proves the address belongs to you
 - you are added to a repository or an organization without being asked, there is no invitation to accept
 - [bug] open a file, click the repository name in the breadcrumb, and you cannot select that same file again
 - no clone URL on the repository page, there is nothing to copy and paste to clone it
 - reloading a page seems to redo the whole authentication round trip
 - an organization has a username and is stored like a user profile, unclear whether that is intended
 - unclear whether an organization can have more than one owner
 - the commit author is shown as the raw git email instead of the account display name
 - no Private badge on the repository page even though every repository is private
```

### Design

```
 - the widgets on the repository view cannot be rearranged
 - the file tree folds back on its own when you switch revision
```

## Test Plan (can be inacurate on some of them)

> [!IMPORTANT]
> Anything that require external file was not tested!!!

### F01 - Register an account
> 🟢 **OK**

### F02 - Log in
> 🟢 **OK**

### F03 - Log out
> 🟢 **OK**

### F04 - Change display name
> 🟢 **OK**

### F05 - Change password
> 🟢 **OK**

### F06 - Change profile picture
> 🟢 **OK**

### F07 - Remove profile picture
> 🟢 **OK**

### F08 - Add SSH key
> 🟢 **OK**

### F09 - Rename SSH key
> 🟢 **OK**

### F10 - Remove SSH key
> 🟢 **OK**

### F11 - Revoke a session
> 🟢 **OK**

### F12 - CLI authentication
> 🔴 **NONE**

```
 - no CLI anywhere: the Info & Access sheet of the plan still says "https://TODO"
 - /cli, /download, /downloads, /docs, /install, /releases and /api/cli all return 404
 - the web app has no download link either
```

### F13 - Git credential helper
> 🔴 **NONE**

```
 - depends on F12, there is no CLI to install
 - it would be blocked anyway by the HTTPS problem described in F28: the server never sends an auth challenge, so no credential helper can answer one
```

### F14 - Create a merge request from the CLI
> 🔴 **NONE**

```
 - depends on F12, there is no CLI to install
```

### F15 - Agent guidelines via the CLI
> 🔴 **NONE**

```
 - depends on F12, there is no CLI to install
```

### F16 - Create a repository
> 🟢 **OK**

### F17 - Clone a repository (SSH)
> 🟢 **OK**

### F18 - Push commits (SSH)
> 🟢 **OK**

### F19 - Pull changes (SSH)
> 🟢 **OK**

### F20 - Create a branch
> 🟢 **OK**

### F21 - Delete a branch
> 🟢 **OK**

### F22 - Change the default branch
> 🟢 **OK**

### F23 - Change the default merge strategy
> 🟢 **OK**

### F24 - Add a collaborator
> 🟢 **OK**

### F25 - Change a collaborator's role
> 🟢 **OK**

### F26 - Remove a collaborator
> 🟢 **OK**

### F27 - Delete a repository
> 🟢 **OK**

### F28 - Authenticated clone / pull over HTTPS
> 🔴 **NONE**

```
 - the anonymous clone is correctly refused, so that half of the expected result works
 - but no authenticated HTTPS clone is possible at all
 - git smart-HTTP answers 307 towards /login, an HTML page, instead of 401 + WWW-Authenticate: Basic
 - because of that the HTTP credentials are never even read (tested with curl -u and with user:pass inside the URL)
 - git clone stops on "fatal: unable to update url base from redirection"
```

### F29 - Push commits over HTTPS
> 🔴 **NONE**

```
 - same cause as F28, git-receive-pack answers the same 307 towards /login
 - without an authenticated clone there is no push to attempt in the first place
```

### F30 - Browse files
> 🟢 **OK**

### F31 - View file content with syntax highlighting
> 🟢 **OK**

### F32 - View commit diff
> 🟢 **OK**

### F33 - Compare refs
> 🟢 **OK**

### F34 - View file history
> 🟢 **OK**

### F35 - Range diff
> 🔴 **NONE**

```
 - there is no range-diff or compare-versions view anywhere
 - the force-push is recorded in the feed ("pushed 239ce11 -> d3c8341"), so the server knows both iterations
 - but the previous iteration cannot be selected or compared, the Commits tab only lists the current one
```

### F36 - Create an organization
> 🟢 **OK**

### F37 - Delete an organization
> 🟢 **OK**

### F38 - Add organization member
> 🟢 **OK**

### F39 - Remove organization member
> 🟢 **OK**

### F40 - Change member role
> 🟢 **OK**

### F41 - Create a merge request
> 🟢 **OK**

### F42 - View a merge request
> 🟢 **OK**

### F43 - Approve a merge request
> 🟢 **OK**

### F44 - Request changes
> 🟢 **OK**

### F45 - Merge a merge request
> 🟢 **OK**

### F46 - Close a merge request
> 🟢 **OK**

### F47 - Comment on a merge request
> 🟢 **OK**

### F48 - Inline code comment
> 🔴 **NONE**

```
 - the diff offers no way to comment
 - hovering a line, clicking it and dragging across a range of lines all open nothing
 - there is no gutter button either, the diff is display only
```

### F49 - Reply to a comment
> 🔴 **NONE**

```
 - comments are shown as a flat list
 - there is no Reply button and no thread nesting
```

### F50 - Markdown in comments
> 🟢 **OK**

### F51 - Request a change on a single comment
> 🔴 **NONE**

```
 - there is no per-comment control to mark a single comment as blocking
 - and since F48 is missing, the feature has no anchor point in the diff either
```
