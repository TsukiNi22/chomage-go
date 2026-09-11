# ar-chitect - report

## Custom

### Bug~Other

```
 - the application targets an old version of Android, so it is not secure
 - the heart is displayed on the offers but there is no way to actually like them
```

### Design

```
 - when you type the website, the input bar moves in front of the field so you cannot see what you are writing
 - a password that is too long pushes the reveal icon out of its box
 - a long name overflows the name box when you edit it
```

## Test Plan (can be inacurate on some of them)

> [!IMPORTANT]
> Anything that require external file was not tested!!!

### F-01 - Create a client account
> 🟡 **~**

```
 - the email address and the phone number are never verified
 - no limit on the first name and the last name, anything can be typed and there is no length cap
 - text is accepted inside the phone number field
```

### F-02 - Create a company account
> 🟡 **~**

```
 - the email address and the phone number are never verified, same as F-01 for the names
 - the website is never validated, anything can be put in its place
 - the type of company cannot be chosen
```

### F-03 - Log in as a client
> 🟢 **OK**

### F-04 - Log in as a company
> 🟡 **~**

```
 - a company that signed up without a website cannot log in at all
```

### F-05 - Delete an account
> 🟢 **OK**

### F-06 - Reset a password
> 🟢 **OK**

### F-07 - Log out
> 🟢 **OK**

### F-08 - Navigate to the catalogue
> 🟢 **OK**

### F-09 - Navigate to the Scan page
> 🟢 **OK**

### F-10 - Browse the catalogue
> 🟢 **OK**

### F-11 - Refresh the catalogue
> 🟢 **OK**

### F-12 - Refresh the scans
> 🟢 **OK**

### F-13 - View catalogue furniture details
> 🟡 **~**

```
 - what the application displays for a piece of furniture does not match what its description says
```

### F-14 - View scan furniture details
> 🟢 **OK**

### F-15 - Search catalogue furniture
> 🟢 **OK**

### F-16 - Search scan furniture
> 🟢 **OK**

### F-17 - Filter furniture by type
> 🟢 **OK**

### F-18 - Launch AR visualisation
> 🟢 **OK**

### F-19 - Move furniture in AR
> 🟢 **OK**

### F-20 - Rotate furniture in AR
> 🟢 **OK**

### F-21 - Import a 3D model
> 🟡 **~**

```
 - only .glb is accepted and that format is hard to get onto a phone
 - any .glb goes through, it does not have to be a piece of furniture
```

### F-22 - Place a 3D model in AR
> 🟢 **OK**

### F-23 - View imported 3D models
> 🟢 **OK**

### F-24 - Rename an imported model
> 🟢 **OK**

### F-25 - Delete an imported model
> 🔴 **NONE**

### F-26 - View a company or client profile
> 🟢 **OK**

### F-27 - Edit a company or client profile
> 🟡 **~**

```
 - there is no restriction on what can be entered when editing
 - the type of company still cannot be chosen
```

### F-28 - Submit a furniture item
> 🟢 **OK**

### F-29 - Hide a furniture item
> 🟢 **OK**

### F-30 - Add credits
> 🔴 **NONE**

### F-31 - Pay subscription
> 🔴 **NONE**

### F-32 - Cancel subscription
> 🔴 **NONE**

### F-33 - Scan a furniture
> 🔴 **NONE**

### F-34 - Use credits
> 🔴 **NONE**

### F-35 - Access admin account
> 🟢 **OK**

### F-36 - View furniture details on admin history page
> 🟢 **OK**

### F-37 - View furniture details on admin in review page
> 🟢 **OK**

### F-38 - View 3D model as admin validating a submission
> 🔴 **NONE**

### F-39 - Approve a furniture submission
> 🟢 **OK**

### F-40 - Reject a furniture submission
> 🟢 **OK**

### F-41 - Scale an imported 3D model
> 🔴 **NONE**

### F-42 - Send a help request
> 🔴 **NONE**
