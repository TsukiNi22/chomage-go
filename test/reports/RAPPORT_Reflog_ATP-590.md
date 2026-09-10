## Résultats

| ID | Fonctionnalité | Résultat |
|---|---|---|
| **F01** | Register an account | ✅ OK |
| **F02** | Log in | ✅ OK |
| **F03** | Log out | ✅ OK |
| **F04** | Change display name | ✅ OK |
| **F05** | Change password | ✅ OK |
| **F06** | Change profile picture | ✅ OK |
| **F07** | Remove profile picture | ✅ OK |
| **F08** | Add SSH key | ✅ OK |
| **F09** | Rename SSH key | ✅ OK |
| **F10** | Remove SSH key | ✅ OK |
| **F11** | Revoke a session | ✅ OK |
| **F12** | CLI authentication | ⛔ Not tested: no CLI available. The Info & Access sheet of this plan gives the install point as the literal "https://TODO", and the product exposes no download either (/cli, /download, /docs, /install, /releases and /api/cli all return HTTP 404). |
| **F13** | Git credential helper | ⛔ Not tested: depends on F12 (no CLI). Would also be blocked by the HTTPS issue described in F28: no authentication challenge is ever issued, so no credential helper can supply credentials. |
| **F14** | Create a merge request from the CLI | ⛔ Not tested: no CLI available (see F12). |
| **F15** | Agent guidelines via the CLI | ⛔ Not tested: no CLI available (see F12). |
| **F16** | Create a repository | ✅ OK |
| **F17** | Clone a repository (SSH) | ✅ OK |
| **F18** | Push commits (SSH) | ✅ OK |
| **F19** | Pull changes (SSH) | ✅ OK |
| **F20** | Create a branch | ✅ OK |
| **F21** | Delete a branch | ✅ OK |
| **F22** | Change the default branch | ✅ OK |
| **F23** | Change the default merge strategy | ✅ OK |
| **F24** | Add a collaborator | ✅ OK |
| **F25** | Change a collaborator's role | ✅ OK |
| **F26** | Remove a collaborator | ✅ OK |
| **F27** | Delete a repository | ✅ OK |
| **F28** | Authenticated clone / pull over HTTPS | ❌ KO: the anonymous clone is correctly refused, but no authenticated HTTPS clone is possible. The Git smart-HTTP endpoint answers HTTP 307 redirecting to the HTML page /login instead of 401 + WWW-Authenticate: Basic, so HTTP credentials are never evaluated. git clone fails on "fatal: unable to update url base from redirection". |
| **F29** | Push commits over HTTPS | ❌ KO: same cause as F28. No authenticated HTTPS clone can be obtained, so no HTTPS push can be attempted; git-receive-pack behaves identically (307 to /login). |
| **F30** | Browse files | ✅ OK |
| **F31** | View file content with syntax highlighting | ✅ OK |
| **F32** | View commit diff | ✅ OK |
| **F33** | Compare refs | ✅ OK |
| **F34** | View file history | ✅ OK |
| **F35** | Range diff | ❌ KO: no range-diff or compare-versions view exists. The force-push is recorded in the feed ("pushed 239ce11 -> d3c8341"), so both iterations are known to the server, but the previous one cannot be selected or compared anywhere. |
| **F36** | Create an organization | ✅ OK |
| **F37** | Delete an organization | ✅ OK |
| **F38** | Add organization member | ✅ OK |
| **F39** | Remove organization member | ✅ OK |
| **F40** | Change member role | ✅ OK |
| **F41** | Create a merge request | ✅ OK |
| **F42** | View a merge request | ✅ OK |
| **F43** | Approve a merge request | ✅ OK |
| **F44** | Request changes | ✅ OK |
| **F45** | Merge a merge request | ✅ OK |
| **F46** | Close a merge request | ✅ OK |
| **F47** | Comment on a merge request | ✅ OK |
| **F48** | Inline code comment | ❌ KO: the diff carries no comment affordance. Hovering a line, clicking it and dragging across a line range open no composer, and there is no gutter button anywhere in the diff. |
| **F49** | Reply to a comment | ❌ KO: comments render as a flat list, with no Reply control and no thread nesting. |
| **F50** | Markdown in comments | ✅ OK |
| **F51** | Request a change on a single comment | ❌ KO: there is no per-comment control to mark a single comment as requiring a change, and with F48 missing the feature has no anchor point in the diff either. |
