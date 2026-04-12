## 1. Persistent bridge server

- [ ] 1.1 Refactor `voxcpm_bridge.py` to run as a long-lived server listening on a localhost TCP port or Unix domain socket.
- [ ] 1.2 Add lazy startup: server launches on first request, loads the model and runs warm-up once, then enters the request loop.
- [ ] 1.3 Add idle shutdown: after a configurable inactivity period (default 5 min), the server exits gracefully.
- [ ] 1.4 Add a `ping` message type so the plugin can check if the server is alive without triggering synthesis.
- [ ] 1.5 Update `voice-output.config.json` to include a `bridgeServer` section with `port` or `socketPath` and `idleTimeoutMs`.

## 2. Clean stdout / stderr separation

- [ ] 2.1 Replace all `print()` calls in `voxcpm_bridge.py` that output to stdout with `sys.stderr.write()` or Python's `logging` module redirected to stderr.
- [ ] 2.2 Ensure only the final `json.dumps(result)` goes to stdout.
- [ ] 2.3 Update any test scripts that call the bridge directly to expect clean stdout and separate stderr.

## 3. Per-phase latency reporting

- [ ] 3.1 Instrument the bridge server to record wall-clock time for each phase: model load, warm-up, synthesis, WAV encoding.
- [ ] 3.2 Add an optional `timing` object to the bridge JSON response: `{ loadMs, warmupMs, synthesisMs, encodeMs, totalMs }`.
- [ ] 3.3 Update the plugin to log each phase duration at debug level when `timing` is present in the response.

## 4. Plugin integration with persistent bridge

- [ ] 4.1 Update `voice-output.js` to connect to the bridge server via TCP socket instead of spawning a subprocess.
- [ ] 4.2 Add server lifecycle management: launch server lazily, keep connection alive, auto-reconnect on disconnect.
- [ ] 4.3 Update the `voxcpmBridge` config section to accept `host`, `port`, or `socketPath` instead of `command`.
- [ ] 4.4 Preserve the existing subprocess fallback path for environments where socket communication is unavailable.

## 5. Graceful fallback on bridge failure

- [ ] 5.1 Catch bridge connection errors, timeouts, and invalid JSON responses in the plugin.
- [ ] 5.2 Log a warning with diagnostic details and preserve the text response without blocking.
- [ ] 5.3 Add a `bridgeHealth` log entry each time the bridge is contacted, indicating success or failure reason.

## 6. Validation

- [ ] 6.1 Measure cold-start latency: first synthesis request after server startup from scratch.
- [ ] 6.2 Measure warm-request latency: subsequent requests with server already running.
- [ ] 6.3 Validate that all three modes (`off`, `summary`, `full`) behave correctly with the persistent server.
- [ ] 6.4 Validate fallback behavior when the bridge is unavailable or returns an error.
- [ ] 6.5 Validate clean stdout / stderr separation with an isolated bridge call.
