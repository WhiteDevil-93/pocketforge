#!/usr/bin/env bash
# Fetch a model file from Google Drive onto a GCE instance.
#
# Uses the instance's attached service account via the metadata server, so there is no
# key file to create, download, or paste. That requires two things to be true:
#
#   1. The instance was created with a Drive access scope
#      (https://www.googleapis.com/auth/drive.readonly or .../drive). Note that the
#      cloud-platform scope does NOT include Drive — it has to be set explicitly, and
#      access scopes can only be changed while the instance is stopped.
#   2. The Drive file (or a folder containing it) is shared with the service account's
#      email address as at least Viewer. Drive permissions are separate from IAM; no
#      project role grants access to a user's Drive.
#
# Usage:
#   ./gcp-fetch-model-from-drive.sh
#   MODEL_NAME=other.gguf DEST=/mnt/disks/models ./gcp-fetch-model-from-drive.sh
#
# Safe to re-run: a partial download resumes rather than starting over.

set -euo pipefail

MODEL_NAME="${MODEL_NAME:-gemma-4-E2B-it-Q4_K_M.gguf}"
FOLDER_ID="${FOLDER_ID:-1uNWTdlI5nz21pXz5AJ_d9g-hyPJpeXU2}"   # Drive folder "pocketforge"
EXPECTED_SIZE="${EXPECTED_SIZE:-3106738272}"                   # 0 disables the check
METADATA_ROOT="http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default"

# Prefer system-wide paths when we can write to them (startup-script runs as root),
# otherwise fall back to the invoking user's home so browser SSH works without sudo.
if [ -w /opt ] || [ "$(id -u)" -eq 0 ]; then
  DEST="${DEST:-/opt/models}"
  LOG="${LOG:-/var/log/pocketforge-model-fetch.log}"
else
  DEST="${DEST:-$HOME/models}"
  LOG="${LOG:-$HOME/pocketforge-model-fetch.log}"
fi

mkdir -p "$DEST" "$(dirname "$LOG")"
exec > >(tee -a "$LOG") 2>&1

log()  { printf '[%s] %s\n' "$(date -u '+%Y-%m-%dT%H:%M:%SZ')" "$*"; }
die()  { log "ERROR: $*"; exit 1; }

log "=== fetching '${MODEL_NAME}' from Drive folder ${FOLDER_ID} into ${DEST} ==="

# --- preflight ---------------------------------------------------------------

command -v curl    >/dev/null || die "curl not found"
command -v python3 >/dev/null || die "python3 not found"

curl -sf -m 5 -H 'Metadata-Flavor: Google' "${METADATA_ROOT}/email" >/dev/null \
  || die "no metadata server reachable — this script must run ON the GCE instance"

SA_EMAIL="$(curl -sf -H 'Metadata-Flavor: Google' "${METADATA_ROOT}/email")"
log "service account: ${SA_EMAIL}"

SCOPES="$(curl -sf -H 'Metadata-Flavor: Google' "${METADATA_ROOT}/scopes")" \
  || die "could not read instance scopes from the metadata server — transient error?
  Re-run; if it persists the metadata service is unreachable, which is an instance-level
  problem rather than anything to do with Drive."

# Only these two actually permit reading a file that was *shared with* this account:
# drive.file covers only files the caller itself created, drive.metadata.readonly cannot
# fetch content, and cloud-platform does not imply Drive at all. Matching loosely here
# would let those pass preflight and fail later as a confusing "not found".
if ! grep -qE '^https://www\.googleapis\.com/auth/drive(\.readonly)?$' <<<"$SCOPES"; then
  log "instance scopes: $(tr '\n' ' ' <<<"$SCOPES")"
  die "this instance has no Drive access scope.
  Fix: stop the instance, then either recreate it with 'Set access for each API ->
  Drive: Enabled', or run:
    gcloud compute instances set-service-account INSTANCE --zone ZONE \\
      --service-account ${SA_EMAIL} \\
      --scopes https://www.googleapis.com/auth/drive.readonly,https://www.googleapis.com/auth/cloud-platform
  then start it again. Scopes cannot be changed on a running instance."
fi

TOKEN="$(curl -sf -H 'Metadata-Flavor: Google' "${METADATA_ROOT}/token" \
  | python3 -c 'import sys,json; print(json.load(sys.stdin)["access_token"])')"
[ -n "$TOKEN" ] || die "could not mint an access token from the metadata server"

# --- resolve the file by name ------------------------------------------------
# Looking it up by name means there is no 33-character file id to transcribe.

# Drive's query grammar quotes string literals in single quotes, so a name containing an
# apostrophe or backslash has to be escaped for *that* grammar. --data-urlencode only
# handles URL encoding, one layer further out, and would leave the query itself malformed.
# Backslash first, or it would double-escape the ones added for the quotes.
ESC_NAME="${MODEL_NAME//\\/\\\\}"
ESC_NAME="${ESC_NAME//\'/\\\'}"

LOOKUP="$(curl -sf -G 'https://www.googleapis.com/drive/v3/files' \
  -H "Authorization: Bearer ${TOKEN}" \
  --data-urlencode "q=name='${ESC_NAME}' and '${FOLDER_ID}' in parents and trashed=false" \
  --data-urlencode 'fields=files(id,name,size)' \
  --data-urlencode 'supportsAllDrives=true' \
  --data-urlencode 'includeItemsFromAllDrives=true' \
  --data-urlencode 'pageSize=2')" \
  || die "Drive lookup request failed. If this is a 403, the Drive API may not be enabled
  on this project: APIs & Services -> Enable APIs -> Google Drive API."

# Drive allows several files with the same name in one folder, so a re-upload can quietly
# leave a duplicate behind. Taking the first match would then pick an arbitrary one.
COUNT="$(python3 -c 'import sys,json; print(len(json.load(sys.stdin).get("files",[])))' <<<"$LOOKUP")"

case "$COUNT" in
  0) die "'${MODEL_NAME}' not found in folder ${FOLDER_ID}.
  Most likely the file or its folder is not shared with ${SA_EMAIL}.
  Fix: in Drive, share it with that address as Viewer. Drive permissions are separate
  from IAM, so no project role substitutes for this.
  Also check the name matches exactly, including case." ;;
  1) : ;;
  *) die "more than one file named '${MODEL_NAME}' in folder ${FOLDER_ID}.
  Refusing to guess which one you meant. Remove the duplicate in Drive (check the trash
  too), or point FOLDER_ID at a folder holding only the copy you want." ;;
esac

read -r FILE_ID DRIVE_SIZE < <(python3 -c '
import sys, json
f = json.load(sys.stdin)["files"][0]
print(f["id"], f.get("size", "0"))
' <<<"$LOOKUP")
log "resolved id=${FILE_ID} size=${DRIVE_SIZE} bytes"

# Everything below does arithmetic on this, so refuse a missing or junk value rather than
# letting it turn into a confusing arithmetic error later.
case "$DRIVE_SIZE" in
  ''|*[!0-9]*|0) die "Drive did not report a usable size for '${MODEL_NAME}' (got '${DRIVE_SIZE}').
  Shortcuts and Google-native files have no byte size and cannot be downloaded this way." ;;
esac

if [ "$EXPECTED_SIZE" -ne 0 ] && [ "$DRIVE_SIZE" != "$EXPECTED_SIZE" ]; then
  die "Drive reports ${DRIVE_SIZE} bytes but expected ${EXPECTED_SIZE}.
  If you re-uploaded the file deliberately, re-run with EXPECTED_SIZE=${DRIVE_SIZE}.
  Otherwise the upload may be incomplete — check it in Drive before continuing."
fi

# --- download ----------------------------------------------------------------

OUT="${DEST}/${MODEL_NAME}"

HAVE=0
[ -f "$OUT" ] && HAVE="$(stat -c%s "$OUT")"

# A local file bigger than the remote one means the Drive copy was replaced with something
# smaller while a stale partial sat here. Resuming from that offset asks for a range the
# server cannot satisfy, and every retry would fail the same way.
if [ "$HAVE" -gt "$DRIVE_SIZE" ]; then
  log "local copy is larger than the Drive copy (${HAVE} > ${DRIVE_SIZE}) — discarding it"
  rm -f "$OUT"
  HAVE=0
fi

if [ "$HAVE" -eq "$DRIVE_SIZE" ]; then
  log "already present at the expected size — skipping download"
else
  # Only the bytes still missing need to fit. Sizing this off the whole file would reject a
  # complete or nearly-complete download on a disk with plenty of room for the remainder.
  REMAINING=$(( DRIVE_SIZE - HAVE ))
  AVAIL_KB="$(df -Pk "$DEST" | awk 'NR==2 {print $4}')"
  NEED_KB=$(( REMAINING / 1024 + 262144 ))   # remainder + 256 MiB headroom
  [ "$AVAIL_KB" -ge "$NEED_KB" ] \
    || die "only $((AVAIL_KB/1024)) MiB free on ${DEST}, need ~$((NEED_KB/1024)) MiB
  to write the remaining $((REMAINING/1024/1024)) MiB."

  RESUME=()
  if [ "$HAVE" -gt 0 ]; then
    log "resuming from ${HAVE} bytes ($((REMAINING/1024/1024)) MiB to go)"
    RESUME=(-C -)
  else
    log "downloading $((DRIVE_SIZE/1024/1024)) MiB"
  fi

  curl -fL --progress-bar "${RESUME[@]}" \
    --retry 5 --retry-delay 5 --retry-all-errors \
    -H "Authorization: Bearer ${TOKEN}" \
    "https://www.googleapis.com/drive/v3/files/${FILE_ID}?alt=media&supportsAllDrives=true" \
    -o "$OUT" \
    || die "download failed — re-run this script to resume from where it stopped"
fi

# --- verify ------------------------------------------------------------------

ACTUAL="$(stat -c%s "$OUT")"
[ "$ACTUAL" = "$DRIVE_SIZE" ] \
  || die "size mismatch: got ${ACTUAL}, expected ${DRIVE_SIZE}. Re-run to resume."

# A Drive error page saved under a .gguf name is the classic silent failure, and it is
# the right size to look plausible. Every GGUF starts with the magic bytes "GGUF".
MAGIC="$(head -c 4 "$OUT")"
[ "$MAGIC" = "GGUF" ] \
  || die "not a GGUF file (magic bytes were '${MAGIC}') — likely an API error page.
  Inspect with: head -c 400 '${OUT}'"

log "OK: ${OUT}"
log "    ${ACTUAL} bytes, GGUF magic verified"

command -v nvidia-smi >/dev/null \
  && nvidia-smi --query-gpu=name,memory.total,driver_version --format=csv,noheader \
  || log "    (no nvidia-smi — GPU driver not installed on this image)"

df -h "$DEST" | awk 'NR==2 {print "    disk: " $4 " free on " $6}'
log "=== done ==="
