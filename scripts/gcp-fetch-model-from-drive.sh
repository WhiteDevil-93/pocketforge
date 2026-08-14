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

log() { printf '[%s] %s\n' "$(date -u '+%Y-%m-%dT%H:%M:%SZ')" "$*"; }
die() { printf '[%s] ERROR: %s\n' "$(date -u '+%Y-%m-%dT%H:%M:%SZ')" "$*" >&2; exit 1; }

MODEL_NAME="${MODEL_NAME:-gemma-4-E2B-it-Q4_K_M.gguf}"
FOLDER_ID="${FOLDER_ID:-1uNWTdlI5nz21pXz5AJ_d9g-hyPJpeXU2}"   # Drive folder "pocketforge"
EXPECTED_SIZE="${EXPECTED_SIZE:-3106738272}"                   # 0 disables the check
SKIP_MD5="${SKIP_MD5:-0}"                                      # 1 skips the checksum pass
METADATA_ROOT="http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default"

# --- validate inputs ---------------------------------------------------------
# These are interpolated into a filesystem path and a Drive query, so check them before
# use rather than discovering the damage afterwards.

case "$EXPECTED_SIZE" in
  ''|*[!0-9]*) die "EXPECTED_SIZE must be a non-negative integer (got '${EXPECTED_SIZE}')" ;;
esac

# MODEL_NAME becomes the output filename. Anything with a slash or a .. component could
# write outside DEST entirely.
case "$MODEL_NAME" in
  ''|*/*|.|..) die "MODEL_NAME must be a bare filename, no path separators (got '${MODEL_NAME}')" ;;
  *[[:cntrl:]]*) die "MODEL_NAME contains control characters" ;;
esac

# Drive ids are URL-safe base64-ish. Anything else is a typo at best.
case "$FOLDER_ID" in
  ''|*[!A-Za-z0-9_-]*) die "FOLDER_ID is not a valid Drive folder id (got '${FOLDER_ID}')" ;;
esac

# --- choose paths ------------------------------------------------------------
# Both system paths have to be usable, or we fall back to $HOME for both. Checking only
# /opt would let a non-root user who can create /opt/models still lose the log to
# /var/log, which they cannot write.

if [ "$(id -u)" -eq 0 ] || { [ -w /opt ] && [ -w /var/log ]; }; then
  DEST="${DEST:-/opt/models}"
  LOG="${LOG:-/var/log/pocketforge-model-fetch.log}"
else
  DEST="${DEST:-$HOME/models}"
  LOG="${LOG:-$HOME/pocketforge-model-fetch.log}"
fi

mkdir -p "$DEST" "$(dirname "$LOG")"
exec > >(tee -a "$LOG") 2>&1

log "=== fetching '${MODEL_NAME}' from Drive folder ${FOLDER_ID} into ${DEST} ==="
log "logging to ${LOG}"

# --- preflight ---------------------------------------------------------------

command -v curl    >/dev/null || die "curl not found"
command -v python3 >/dev/null || die "python3 not found"

# Every request needs a bound. curl does not time out by default, and an unattended
# startup script that hangs on a wedged connection just never finishes.
CURL_SHORT=(--fail --silent --connect-timeout 5 --max-time 30)

curl "${CURL_SHORT[@]}" -H 'Metadata-Flavor: Google' "${METADATA_ROOT}/email" >/dev/null \
  || die "no metadata server reachable — this script must run ON the GCE instance"

SA_EMAIL="$(curl "${CURL_SHORT[@]}" -H 'Metadata-Flavor: Google' "${METADATA_ROOT}/email")"
log "service account: ${SA_EMAIL}"

SCOPES="$(curl "${CURL_SHORT[@]}" -H 'Metadata-Flavor: Google' "${METADATA_ROOT}/scopes")" \
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

TOKEN="$(curl "${CURL_SHORT[@]}" -H 'Metadata-Flavor: Google' "${METADATA_ROOT}/token" \
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

LOOKUP="$(curl --fail --silent --connect-timeout 5 --max-time 60 \
  -G 'https://www.googleapis.com/drive/v3/files' \
  -H "Authorization: Bearer ${TOKEN}" \
  --data-urlencode "q=name='${ESC_NAME}' and '${FOLDER_ID}' in parents and trashed=false" \
  --data-urlencode 'fields=files(id,name,size,md5Checksum)' \
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

read -r FILE_ID DRIVE_SIZE DRIVE_MD5 < <(python3 -c '
import sys, json
f = json.load(sys.stdin)["files"][0]
print(f["id"], f.get("size", "0"), f.get("md5Checksum", "-"))
' <<<"$LOOKUP")
log "resolved id=${FILE_ID} size=${DRIVE_SIZE} md5=${DRIVE_MD5}"

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

# --- verification helper -----------------------------------------------------

verify() {
  local f=$1 actual magic sum

  actual="$(stat -c%s "$f")"
  [ "$actual" = "$DRIVE_SIZE" ] || { log "size mismatch: ${actual} != ${DRIVE_SIZE}"; return 1; }

  # A Drive error page saved under a .gguf name is the classic silent failure. Resuming
  # onto one can even reach the right total size, so this check earns its place.
  magic="$(head -c 4 "$f")"
  [ "$magic" = "GGUF" ] || { log "not a GGUF file (magic '${magic}')"; return 1; }

  if [ "$DRIVE_MD5" != "-" ] && [ "$SKIP_MD5" != "1" ] && command -v md5sum >/dev/null; then
    log "verifying md5 (a few seconds for a file this size)"
    sum="$(md5sum "$f" | cut -d' ' -f1)"
    [ "$sum" = "$DRIVE_MD5" ] || { log "md5 mismatch: ${sum} != ${DRIVE_MD5}"; return 1; }
    log "md5 matches Drive"
  fi

  return 0
}

# --- download ----------------------------------------------------------------

OUT="${DEST}/${MODEL_NAME}"
PART="${OUT}.partial"

if [ -f "$OUT" ] && [ "$(stat -c%s "$OUT")" = "$DRIVE_SIZE" ] && verify "$OUT"; then
  log "already present and verified — nothing to do"
else
  HAVE=0
  [ -f "$PART" ] && HAVE="$(stat -c%s "$PART")"

  # A partial larger than the remote file means the Drive copy was replaced with something
  # smaller. Resuming from that offset asks for a range the server cannot satisfy, and
  # every retry would fail identically.
  if [ "$HAVE" -gt "$DRIVE_SIZE" ]; then
    log "partial is larger than the Drive copy (${HAVE} > ${DRIVE_SIZE}) — discarding it"
    rm -f "$PART"
    HAVE=0
  fi

  if [ "$HAVE" -lt "$DRIVE_SIZE" ]; then
    # Only the bytes still missing need to fit. Sizing this off the whole file would
    # reject a nearly complete download on a disk with room for its remainder.
    REMAINING=$(( DRIVE_SIZE - HAVE ))
    AVAIL_KB="$(df -Pk "$DEST" | awk 'NR==2 {print $4}')"
    NEED_KB=$(( REMAINING / 1024 + 262144 ))   # remainder + 256 MiB headroom
    [ "$AVAIL_KB" -ge "$NEED_KB" ] \
      || die "only $((AVAIL_KB/1024)) MiB free on ${DEST}, need ~$((NEED_KB/1024)) MiB
  to write the remaining $(( (REMAINING + 1048575) / 1048576 )) MiB."

    # Round up, or a sub-MiB remainder reports as "0 MiB to go".
    REMAINING_MIB=$(( (REMAINING + 1048575) / 1048576 ))

    RESUME=()
    if [ "$HAVE" -gt 0 ]; then
      log "resuming from ${HAVE} bytes (${REMAINING_MIB} MiB to go)"
      RESUME=(-C -)
    else
      log "downloading $((DRIVE_SIZE/1024/1024)) MiB"
    fi

    # No --max-time here: a legitimate multi-GB transfer can take a long while. The
    # low-speed guard aborts a genuinely wedged connection instead, and --retry-max-time
    # keeps the retry loop from running forever.
    curl --fail --location --progress-bar "${RESUME[@]}" \
      --connect-timeout 10 \
      --speed-limit 1024 --speed-time 120 \
      --retry 5 --retry-delay 5 --retry-all-errors --retry-max-time 1800 \
      -H "Authorization: Bearer ${TOKEN}" \
      "https://www.googleapis.com/drive/v3/files/${FILE_ID}?alt=media&supportsAllDrives=true" \
      -o "$PART" \
      || die "download failed — re-run this script to resume from where it stopped"
  fi

  # Verify before publishing, so nothing ever observes a partial or corrupt file at the
  # final path, and a bad download is cleared rather than poisoning every future run.
  if ! verify "$PART"; then
    rm -f "$PART"
    die "downloaded file failed verification and was discarded. Re-run to try again."
  fi

  mv -f "$PART" "$OUT"
fi

log "OK: ${OUT}"
log "    ${DRIVE_SIZE} bytes, GGUF magic verified"

if command -v nvidia-smi >/dev/null; then
  if ! nvidia-smi --query-gpu=name,memory.total,driver_version --format=csv,noheader; then
    log "    (nvidia-smi present but failed — driver may be broken)"
  fi
else
  log "    (no nvidia-smi — GPU driver not installed on this image)"
fi

df -h "$DEST" | awk 'NR==2 {print "    disk: " $4 " free on " $6}'
log "=== done ==="
