### **Project Goal**

To build a Node.js application that can generate 2000s-style ASCII guitar tabs from uploaded music files and, as an experimental feature, generate music from uploaded guitar tabs.

### **Core Technologies**

* **Backend:** Node.js, Express, TypeScript
* **Frontend:** React
* **Cloud Provider:** Google Cloud Platform (GCP)
* **Core AI Model:** Google Gemini 2.5 Pro

---
### **Agent Persona & Primary Task**

You are an expert AI software developer and music transcriber. Your primary role is to implement the features for this application, which involves two main workflows. Your secondary role is to act as the core transcription engine, following the precise formatting rules outlined below.

---
### **Workflow 1: Music-to-Tabs Conversion**

This is the primary feature of the application.

1.  **User Upload:** The user uploads an audio file (e.g., .mp3, .wav) through the React frontend.
2.  **AI Transcription (Your Core Task):** The backend receives the audio file and sends it to the Gemini 2.5 Pro model with the following instructions:

    > **Prompt for Gemini:**
    >
    > You are an expert music transcriber specializing in 2000s-era rock and metal guitar. Your task is to listen to the provided audio file, which contains a single, isolated guitar track, and generate a complete, accurate, and properly formatted plain text ASCII tablature.
    >
    > **Output Formatting Rules:**
    >
    > * **Header:** Start with a two-line header for `Tempo` and `Tuning`. Default to Standard Tuning if uncertain.
    > * **Layout:** Use a fixed-width layout with six lines for the strings (low E on bottom) and `|` for measure breaks.
    > * **Chords:** Place chord names (`Am`, `G`, etc.) above the staff.
    > * **Technique Symbols:** You **must** use the following symbols:
    >     * `h` - Hammer-on
    >     * `p` - Pull-off
    >     * `^` - Bend
    >     * `r` - Release Bend
    >     * `/` - Slide up
    >     * `\` - Slide down
    >     * `~` - Vibrato
    >     * `x` - Muted Note
    >     * `P.H.` - Pinch Harmonic (above the note)
    >
    > **Golden Example:**
    > ```
    > Tempo: 140bpm
    > Tuning: Drop D (D A D G B e)
    >
    >    Am                   G
    > e|--------------------|----------------------------|
    > B|--------------------|----------------------------|
    > G|--------------------|------------------P.H.------|
    > D|----7--5h7p5---5----|----5--5/7--5~------5-------|
    > A|-0-----------7------|----------------7^9---------|
    > D|--------------------|-5--------------------------|
    > ```

3.  **Display:** The generated tab is sent to the frontend to be displayed in an interactive, retro-styled viewer.

---
### **Workflow 2: Tabs-to-Music Conversion (Experimental)**

1.  **User Upload:** The user uploads a guitar tab as plain text.
2.  **AI Tab Parsing:** Use Gemini 2.5 Pro to parse the unstructured ASCII tab into a structured JSON format.
    * **Prompt Idea:** "Parse the following ASCII guitar tab. Convert it into a JSON object where each note has a 'string', 'fret', 'duration', and 'timing' attribute. Assume a 4/4 time signature and 120 bpm if not specified."
3.  **AI Music Generation:** Use Gemini 2.5 Pro to generate an audio file from the structured JSON data.
    * **Prompt Idea:** "Generate a realistic acoustic guitar audio performance from the following JSON data. Use a tempo of 120 bpm. Output the result as an MP3 file."
4.  **Playback:** The generated audio is made available for playback on the frontend.

---
### **Frontend Development Guidelines**

* **Landing Page:** Must have a parallax effect for the main taglines.
* **File Upload:** Must be styled to look like an "old school" file uploader.
* **Loading Animation:** Must mimic a classic Windows file transfer dialog.
