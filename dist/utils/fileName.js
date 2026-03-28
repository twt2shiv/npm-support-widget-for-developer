/** Display name: first 10 chars + "[...]" if longer; full name in tooltip via title */
export function shortAttachmentLabel(fileName, maxChars = 10) {
    const n = fileName.trim();
    if (n.length <= maxChars)
        return n;
    return `${n.slice(0, maxChars)}[...]`;
}
