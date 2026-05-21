# TODOS

## FFmpeg process timeout and cleanup
**What:** Add context.WithTimeout and defer Kill() around FFmpeg subprocess in Go backend.
**Why:** If FFmpeg hangs or crashes mid-recording, the Go process leaks file descriptors and goroutines.
**Pros:** Prevents resource leaks. Ensures clean recordings even under failure.
**Cons:** ~5 lines of code. Minimal complexity.
**Context:** Go spawns FFmpeg as a subprocess to encode PCM from pion audio tracks to MP3. Without timeout/cleanup, a hanging FFmpeg process will orphan and consume resources indefinitely.
**Depends on / blocked by:** Requires FFmpeg integration to be implemented first.

## TURN server setup
**What:** Deploy coturn on the same VPS as the Go backend for WebRTC NAT traversal.
**Why:** If either user is behind a restrictive firewall (corporate network, some home routers), WebRTC peer connections will fail without a TURN relay.
**Pros:** Ensures connectivity works in all network environments. Professional reliability.
**Cons:** Additional server component to deploy and maintain. ~30 min setup.
**Context:** pion/webrtc uses STUN by default (Google's free servers). STUN works for most home networks but fails for symmetric NATs and corporate firewalls. TURN acts as a relay when direct peer-to-peer fails.
**Depends on / blocked by:** Can defer to post-launch if both users are on typical home networks.
