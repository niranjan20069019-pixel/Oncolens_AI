ALLOWED_EXTENSIONS = {".png", ".jpg", ".jpeg", ".tif", ".tiff", ".bmp", ".dcm", ".dicom"}
ALLOWED_MIME_PREFIXES = ("image/", "application/dicom")

MAGIC_SIGNATURES = [
    (b"\x89PNG\r\n\x1a\n", "png"),
    (b"\xff\xd8\xff", "jpeg"),
    (b"II*\x00", "tiff"),
    (b"MM*\x00", "tiff"),
    (b"BM", "bmp"),
]


def extension_allowed(filename: str) -> bool:
    lower = filename.lower()
    return any(lower.endswith(ext) for ext in ALLOWED_EXTENSIONS)


def sniff_image_type(payload: bytes) -> str | None:
    if len(payload) >= 132 and payload[128:132] == b"DICM":
        return "dicom"
    for magic, kind in MAGIC_SIGNATURES:
        if payload.startswith(magic):
            return kind
    return None
