# Morning Debrief Command

## Purpose
Transcribe morning debrief audio recordings and analyze content for engineering ideas, priorities, and actionable insights.

## Variables
- `[[FILE_PATH]]` - The absolute path to the audio/video file

## Task
Process the audio file at `[[FILE_PATH]]` to create a comprehensive morning debrief analysis.

### Processing Pipeline:

1. **Audio Transcription**
   ```bash
   # Use Whisper for transcription (tiny model for speed, English)
   whisper [[FILE_PATH]] --model tiny --language English --output_dir /tmp/whisper_output/
   ```
   - Supported formats: MP3, WAV, M4A, FLAC, OGG, AAC, MP4
   - Generate timestamped transcript
   - Handle background noise and multiple speakers

2. **Content Analysis**
   Extract and analyze:
   - **Top 3 Priorities**: Identify the most important tasks or goals mentioned
   - **Engineering Ideas**: Technical concepts, solutions, or innovations discussed
   - **Direct Commands**: Explicit action items or instructions
   - **Key Decisions**: Important choices or directions established
   - **Blockers/Challenges**: Problems or obstacles mentioned
   - **Follow-up Items**: Things that need further investigation

3. **Insight Generation**
   - **Novel Extensions**: Suggest creative expansions of discussed ideas
   - **Leading Questions**: Generate thought-provoking questions for deeper exploration
   - **Connection Points**: Link ideas to existing projects or knowledge
   - **Risk Considerations**: Identify potential challenges or concerns

4. **Document Structure**
   Create structured markdown output:
   ```markdown
   # Morning Debrief - [Date]
   **Quarter**: Q[X] 2025
   **Duration**: [XX] minutes
   **Participants**: [Detected or inferred]
   
   ## Executive Summary
   [2-3 sentence overview of the debrief]
   
   ## Top 3 Priorities
   1. [Priority 1 with context]
   2. [Priority 2 with context]
   3. [Priority 3 with context]
   
   ## Engineering Ideas
   ### Idea 1: [Title]
   - **Concept**: [Description]
   - **Implementation**: [Potential approach]
   - **Impact**: [Expected benefit]
   
   ## Direct Commands Extracted
   - [ ] Command 1: [Exact quote or paraphrase]
   - [ ] Command 2: [Exact quote or paraphrase]
   
   ## Transcript (Formatted)
   [Bulleted sentences for easy scanning]
   • [Sentence 1]
   • [Sentence 2]
   
   ## Novel Extensions
   1. **What if...**: [Creative extension of discussed idea]
   2. **Consider...**: [Alternative approach]
   
   ## Leading Questions
   1. How might we...?
   2. What would happen if...?
   3. Have we considered...?
   
   ## Next Steps
   - [ ] [Actionable next step 1]
   - [ ] [Actionable next step 2]
   ```

5. **Output Management**
   - Save to: `morning_debrief_zone/debrief_output/<date>_<time>/`
   - Create files:
     - `debrief_analysis.md` - Main analysis document
     - `transcript_raw.txt` - Original transcription
     - `priorities.json` - Structured priority data
     - `ideas_tracker.csv` - Ideas for tracking over time
   - Archive original audio to: `morning_debrief_zone/archive/`

### Advanced Features:

#### Speaker Diarization (if possible):
- Attempt to identify different speakers
- Tag contributions by speaker
- Track who proposed which ideas

#### Sentiment Analysis:
- Gauge overall mood (optimistic, concerned, neutral)
- Identify emotional peaks in discussion
- Flag areas of uncertainty or concern

#### Trend Tracking:
- Compare with previous debriefs if available
- Identify recurring themes or priorities
- Track progress on previously mentioned items

### Quality Checks:
1. Verify transcription quality (confidence scores)
2. Flag unclear or potentially misheard sections
3. Highlight technical terms that may need verification
4. Note any audio quality issues affecting transcription

### Error Handling:
- Check if Whisper is installed: `which whisper`
- Handle long audio files (>30 min) with chunking
- Manage different audio codecs and formats
- Provide fallback for transcription failures
- Clean up temporary files after processing