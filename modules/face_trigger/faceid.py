import face_recognition
import cv2
import numpy as np
import time
import pickle
import os
import RPi.GPIO as GPIO

# -------------------------
# GPIO / PIR Setup
# -------------------------
GPIO.setmode(GPIO.BOARD)
GPIO.setup(16, GPIO.IN)

# -------------------------
# Load Encodings
# -------------------------
print("[INFO] loading encodings...")
with open("encodings3.pickle", "rb") as f:
    data = pickle.loads(f.read())

known_face_encodings = data["encodings"]
known_face_names = data["names"]

# -------------------------
# State File
# -------------------------
STATE_FILE = os.path.join("..", "face_trigger", "face_state.txt")

def write_state(value):
    with open(STATE_FILE, "w") as f:
        f.write(str(value))

def read_state():
    try:
        with open(STATE_FILE, "r") as f:
            return int(f.read().strip())
    except:
        return 0

# -------------------------
# Camera (starts OFF)
# -------------------------
cap = None

def start_camera():
    global cap
    if cap is None:
        print("[CAM] Starting camera...")
        cap = cv2.VideoCapture(0)
        time.sleep(0.5)  # allow USB to settle
        if not cap.isOpened():
            print("[ERROR] Camera failed to open.")
            cap = None

def stop_camera():
    global cap
    if cap is not None:
        print("[CAM] Stopping camera...")
        cap.release()
        cv2.destroyAllWindows()
        cap = None
# -------------------------
# Face processing
# -------------------------
cv_scaler = 1
face_names = []

def process_frame(frame):
    global face_names

    resized = cv2.resize(frame, (0, 0), fx=(1 / cv_scaler), fy=(1 / cv_scaler))
    rgb = cv2.cvtColor(resized, cv2.COLOR_BGR2RGB)

    locations = face_recognition.face_locations(rgb)
    encodings = face_recognition.face_encodings(rgb, locations, model="large")

    face_names = []

    for encoding in encodings:
        matches = face_recognition.compare_faces(known_face_encodings, encoding)
        distances = face_recognition.face_distance(known_face_encodings, encoding)

        name = "Unknown"

        if len(distances) > 0:
            best_match = np.argmin(distances)
            if matches[best_match]:
                name = known_face_names[best_match]

        face_names.append(name)

# -------------------------
# Timing
# -------------------------
STATE_ON_DURATION = 20
CHECK_INTERVAL = 15

last_seen_time = 0
last_check_time = 0
pir_last_trigger = 0

# -------------------------
# Main Loop
# -------------------------
try:
    while True:
        current_time = time.time()
        current_state = read_state()
        pir_motion = GPIO.input(16)

        detected_user = 0

        # =================================================
        # STATE 0 — CAMERA OFF (fully released)
        # =================================================
        if current_state == 0:
            stop_camera()

            if pir_motion:
                print("[PIR] Motion detected → state 1")
                write_state(1)
                pir_last_trigger = current_time
                last_check_time = current_time

            time.sleep(0.2)  # PIR check 5x/sec
            continue

        # =================================================
        # STATE 1, 2, 3 — CAMERA ON
        # =================================================
        if current_state in [1, 2, 3]:
            start_camera()

            ret, frame = cap.read() if cap else (False, None)

            if ret:
                process_frame(frame)

                # Detect users
                if "Brady Spak" in face_names:
                    detected_user = 1
                elif "Camren Spak" in face_names:
                    detected_user = 2

            # -------------------------
            # STATE 1 logic (idle/lock)
            # -------------------------
            if current_state == 1:
                if pir_motion:
                    pir_last_trigger = current_time

                if detected_user != 0:
                    write_state(detected_user + 1)
                    last_seen_time = current_time
                    last_check_time = current_time
                    print(f"[LOGIN] User {detected_user + 1}")

                elif current_time - pir_last_trigger > STATE_ON_DURATION:
                    print("[TIMEOUT] → state 0")
                    write_state(0)

            # -------------------------
            # STATE 2/3 logic (logged in)
            # -------------------------
            else:
                if current_time - last_check_time >= CHECK_INTERVAL:
                    last_check_time = current_time

                    if current_state == 2 and "Brady Spak" in face_names:
                        last_seen_time = current_time

                    elif current_state == 3 and "Camren Spak" in face_names:
                        last_seen_time = current_time

                if current_time - last_seen_time > STATE_ON_DURATION:
                    print("[LOGOUT] → state 0")
                    write_state(0)

        # Small CPU safety sleep
        time.sleep(0.05)

except KeyboardInterrupt:
    pass

finally:
    stop_camera()
    GPIO.cleanup()
