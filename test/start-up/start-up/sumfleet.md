# sumfleet - report

## Custom

### Bug~Other
```
 - need to reload the page to see new employee just created
 - the owner is counted in employee count on the metric page
 - no error message on many invalid slot (only a glowing orange aura in many case)
 - during a bookin reservation scheduling if i have no vehicle selected and the other data are valid the reservation page disapear and no reservation where made
 - can create a vehicule with 0 place (automatic transport for merch?)
 - booking that where finished can still be canceled
 - on the employee side: the reservation of vehicle is quite a mess after returning a car before the end of the reservation: can't reserve vehicule on some page and on other yes, marked has availible but it's reserved, ...
```

### Design
```
 - tab delacement doesn't work on group selection when creating a new employee
 - button hover too on the header
 - pricing & button (small offer) background color not too much contrast from the global background
 - a bigger font size for the metric title on the home page? can't find in one sight the one i search for
 - no more header display after the connection, maybe allow the user to go back home or enable it
```

## Test Plan (can be inacurate on some of them)

> [!IMPORTANT]
> Anything that require external file was not tested!!!

### F1 - Register a new Company
> 🟢 **OK**

### F2 - Log in
> 🟢 **OK**

### F3 - Update email
> 🟢 **OK**

### F4 - Update password
> 🟢 **OK**

### F5 - Create vehicle
> 🟢 **OK**

### F6 - Edit vehicle
> 🟢 **OK**

### F7 - Delete vehicle
> 🟢 **OK**

### F8 - Adding a description to a vehicle
> 🟢 **OK**

### F9 - View vehicle gas tickets
> 🔴 **NONE**

### F10 - Import bulk vehicle data
> 🔴 **NONE**

### F11 - Adding profile picture to the vehicle
> 🔴 **NONE**

### F12 - Update the vehicle position
> 🔴 **NONE**

### F13 - Create employee or admin
> 🟡 **~**

```
 - can't find where to create admin
```

### F14 - Import bulk user data
> 🔴 **NONE**

### F15 - View employee gas tickets
> 🔴 **NONE**

### F16 - Edit employee
> 🟢 **OK**

### F17 - Delete employee
> 🟢 **OK**

### F18 - Create group
> 🟡 **~**

```
 - can only create one group with no parent before telling me i can't (connected has admin)
```

### F19 - Create sub-group
> 🟢 **OK**

### F20 - Assign vehicle to group
> 🟢 **OK**

### F21 - Move vehicle to another group
> 🟢 **OK**

### F22 - Remove vehicles from a group
> 🟢 **OK**

### F23 - Seeing the tree groups
> 🔴 **NONE**

### F24 - Invite a employee on a group
> 🔴 **NONE**

### F25 - Assign employee to group
> 🟢 **OK**

### F26 - Move an employee or admin to another group
> 🟢 **OK**

### F27 - Remove en employee from a group
> 🟢 **OK**

### F28 - Delete a group or a subGroup
> 🟢 **OK**

### F29 - Create parking
> 🟢 **OK**

### F30 - Update parking
> 🟢 **OK**

### F31 - Delete parking
> 🟢 **OK**

### F32 - View parking informations
> 🟢 **OK**

### F33 - Create parking spots
> 🟢 **OK**

### F34 - Manage parking spots
> 🟢 **OK**

### F35 - Manage parking vehicles
> 🔴 **NONE**

### F36 - Add vehicle to parking
> 🔴 **NONE**

### F37 - Create reservation
> 🟢 **OK**

### F38 - End a reservation
> 🟢 **OK**

### F39 - Report incident
> 🟢 **OK**

### F40 - Monitor reservations
> 🟢 **OK**

### F41 - View own current, past and future reservation
> 🟢 **OK**

### F42 - Modify own reservation
> 🟢 **OK**

### F43 - Cancel own reservation
> 🟢 **OK**

### F44 - Cancel any reservation
> 🟢 **OK**

### F45 - Modify any reservation
> 🟢 **OK**

### F46 - View vehicle statistics
> 🟢 **OK**

### F47 - View employee statistics
> 🟢 **OK**

### F48 - View group statistics
> 🟢 **OK**

### F49 - Append a gas ticket
> 🔴 **NONE**

### F50 - View gas tickets
> 🔴 **NONE**

### F51 - Setup notification
> 🔴 **NONE**

### F52 - Set a domain filters for invite
> 🔴 **NONE**
