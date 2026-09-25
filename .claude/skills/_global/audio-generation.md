# Skill: Audio Generation (Chatterbox TTS)

> Open-source text-to-speech + zero-shot voice cloning, 23 languages (Resemble AI).

## When To Use
Any feature needing generated speech: narration, voiceovers, IVR/voice
agents, accessibility "read aloud", multilingual audio content.

## Model Zoo
| Model | Size | Languages | Use For |
|-------|------|-----------|---------|
| `ChatterboxMultilingualTTS` | 500M | 23+ | Default — multilingual, voice cloning |
| `ChatterboxTTS` | 500M | English | English-only, original model |
| `ChatterboxTurboTTS` | 350M | English | Low-latency voice agents |
| `ChatterboxTurboTTS(nano=True)` | 110M | English | CPU / on-device |

## Install
```bash
pip install chatterbox-tts
```
First run auto-downloads model weights (~2GB) from Hugging Face and caches
them in `~/.cache/huggingface`. Set `HF_TOKEN` (see Credentials) to avoid
rate-limit warnings/slow downloads.

## Supported Languages (Multilingual model)
`ar` `da` `de` `el` `en` `es` `fi` `fr` `he` `hi` `it` `ja` `ko` `ms` `nl`
`no` `pl` `pt` `ru` `sv` `sw` `tr` `zh`

## Usage
```python
import torch, torchaudio as ta
from chatterbox.mtl_tts import ChatterboxMultilingualTTS

device = "cuda" if torch.cuda.is_available() else "cpu"
model = ChatterboxMultilingualTTS.from_pretrained(device=device, t3_model="v3")

# Default built-in voice
wav = model.generate("नमस्ते, आप कैसे हैं?", language_id="hi")

# Voice cloning — audio_prompt_path MUST be a real, existing wav file
wav = model.generate(
    "नमस्ते, आप कैसे हैं?",
    language_id="hi",
    audio_prompt_path="reference_voice.wav",
)

ta.save("output.wav", wav.cpu(), model.sr)
```

## Integration Pattern
- **Python backend:** import `chatterbox` directly into the service layer.
- **Non-Python backend (Node/etc.):** wrap it as a small internal FastAPI
  microservice (`POST /tts {text, language_id, audio_prompt_path?}` →
  returns wav) OR a CLI script invoked via `subprocess` with args for
  text/language/output-path. BlackPanther decides based on
  `doc/project-overview.md#stack`.
- Model load is slow (~seconds) — load once at service startup, not per
  request.

## Voice Cloning Notes
- Reference clip: 5–15s, clean, single speaker, no background noise.
- Match reference language to target language where possible. If they
  differ, set `cfg_weight=0` to stop the output inheriting the reference's
  accent.
- Defaults `exaggeration=0.5, cfg_weight=0.5` work for most cases. Faster
  reference speech → lower `cfg_weight` (~0.3) for better pacing.

## Credentials
- `HF_TOKEN` — **optional**. Only needed to avoid Hugging Face rate limits
  on model download, not required for generation itself.

## Error Handling
- `FileNotFoundError` on `audio_prompt_path` → path doesn't exist relative
  to cwd; verify with an absolute path.
- Slow first run / "Fetching files" → normal, one-time weight download.
- CUDA OOM → fall back to `device="cpu"` or use the Nano/Turbo model.

## Security Notes
- Every output is embedded with Resemble AI's inaudible Perth watermark
  (responsible-AI feature) — don't represent generated audio as
  unwatermarked.
- Voice cloning of a real person requires their consent — don't build a
  feature that clones a voice from user-uploaded audio without explicit
  opt-in and disclosure.
- Add generated/uploaded audio directories to the **project's** `.gitignore`
  (not this `.claude/.gitignore`) — reference voice samples are
  biometric-adjacent data and shouldn't be committed.

## Testing
Manual smoke test:
```bash
python -c "
from chatterbox.mtl_tts import ChatterboxMultilingualTTS
import torchaudio as ta
m = ChatterboxMultilingualTTS.from_pretrained(device='cpu')
w = m.generate('Hello, this is a test.', language_id='en')
ta.save('smoke_test.wav', w.cpu(), m.sr)
print('OK:', __import__('os').path.getsize('smoke_test.wav'), 'bytes')
"
```
Pass criteria for Hulk: output file exists, size > 0 bytes, playable,
sample rate matches `model.sr`.

## Memory Hooks
- Log which model variant was chosen per feature and why (latency vs.
  quality vs. language coverage).
- Log voice-cloning parameter tuning (`cfg_weight`, `exaggeration`) that
  worked well for a given reference voice.

## Change Log
- 2026-08-31: Added — Chatterbox TTS multilingual audio generation, global skill.