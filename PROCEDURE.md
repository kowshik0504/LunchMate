# LunchMate Delivery Lifecycle: Official PROCEDURE

This document defines the strict sequential operational procedure for lunchbox pickups and deliveries in LunchMate.

Whenever the keyword **PROCEDURE** is referenced, the following steps are executed and reported:

---

### Step 1: Pack Tiffin & Notified to Driver
* Parent prepares the child's lunchbox at home and clicks **Pack Tiffin & Mark "Food Ready"**.
* The UI status immediately updates to **"Notified to Driver"**.
* A dispatch ping is broadcast to the nearest verified neighborhood delivery partner (e.g. Ramesh Kumar in Anna Nagar East zone).

### Step 2: Driver Acceptance & Approach
* The assigned driver accepts the order in the driver app.
* Parent UI updates to show driver profile, photo, ratings, contact details, and vehicle information (Bajaj Chetak EV).
* The live map reveals the driver's current position and route approaching the parent's home / pickup location.

### Step 3: Driver Nearing Notification (< 300m)
* When the driver moves within ~300 meters (~1 minute away) of the parent's pickup address:
* The app automatically sends a high-priority alert to the parent:
  > **"Driver is Nearing Your Home! Please keep the warm lunchbox ready."**

### Step 4: Driver Arrived at Location & 30-Second Bell Alarm
* Upon reaching the parent's doorstep, the driver marks **"Arrived at Location"** (or proximity triggers arrival).
* The app triggers an audible **30-second bell chime alarm** to alert the parent.
* A visible **10-minute Pickup Waiting Window countdown timer** starts for both the parent and driver.

### Step 5: Pickup OTP Handshake
* The app displays a 4-digit **Pickup OTP** (e.g. `4821`) on the parent's screen.
* The driver app presents an OTP input box.
* The parent hands over the lunchbox and shares the OTP with the driver.
* The driver enters the OTP to verify the handover and secure the tiffin inside the thermal insulated bag.

### Step 6: Overtime Waiting Rule & Compulsory ₹10 Penalty Fee
* If the 10-minute waiting window expires before OTP handover:
  * A **2-minute grace period** is automatically granted.
* If the lunchbox is still not handed over after the grace period expires:
  * A **compulsory ₹10 extra tip / waiting fee** is added for that driver for the day.
  * The penalty is automatically billed on the parent's next payment/checkout, with the exact date and reason clearly listed:
    > *"₹10 Driver Waiting Fee (Exceeded 10 min pickup window on [Date])"*

### Step 7: En Route to School & Live GPS Road Telematics
* Once the Pickup OTP is verified, the driver starts the school delivery leg.
* The live map displays the exact moving location of the driver along the road corridor (e.g. Anna Arch Road to DAV Higher Secondary School).
* Both the parent and driver see real-time telematics: live speed (18–32 km/h), road traffic density, and accurate ETA to the school bell.

### Step 8: School Gate Arrival (< 100m Radius) & Gate OTP Handshake
* The driver must arrive within a **100-meter radius** of the designated school gate (e.g. Gate 2 Staff / Security Reception).
* The driver requests the **4-digit School Gate OTP** from the authorized school security or gate staff.
* The driver enters the Gate OTP into the app.
* Once verified:
  * The delivery is marked as **Complete / Delivered**.
  * The delivery amount / daily meal fee is deducted from the wallet **instantly**, generating an escrow receipt.
