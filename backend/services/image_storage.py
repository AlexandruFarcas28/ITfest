from __future__ import annotations

from datetime import datetime

from bson import ObjectId
from flask import has_request_context, url_for
from gridfs import GridFS
from gridfs.errors import NoFile

GRIDFS_COLLECTION = "nutrition_images"


def _as_optional_string(value) -> str | None:
    if value is None:
        return None

    normalized = str(value).strip()
    return normalized or None


def _build_image_url(image_id: str | None) -> str | None:
    if not image_id:
        return None

    if has_request_context():
        return url_for("images.get_image", image_id=image_id, _external=True)

    return f"/api/images/{image_id}"


def _get_bucket(db) -> GridFS:
    return GridFS(db, collection=GRIDFS_COLLECTION)


def save_uploaded_image(
    db,
    *,
    image_bytes: bytes,
    content_type: str,
    filename: str | None = None,
    user_id: str | None = None,
    source: str = "meal_scan",
) -> dict:
    stored_filename = _as_optional_string(filename) or "meal-upload.jpg"
    stored_content_type = _as_optional_string(content_type) or "image/jpeg"
    metadata = {
        "user_id": _as_optional_string(user_id),
        "source": source,
        "created_at": datetime.utcnow().isoformat(),
    }
    image_id = _get_bucket(db).put(
        image_bytes,
        filename=stored_filename,
        content_type=stored_content_type,
        metadata=metadata,
    )

    return {
        "image_file_id": str(image_id),
        "image_storage": "gridfs",
        "image_filename": stored_filename,
        "image_content_type": stored_content_type,
        "image_url": _build_image_url(str(image_id)),
    }


def build_entry_image_fields(data: dict, existing: dict | None = None) -> dict:
    base = existing or {}
    image_file_id = _as_optional_string(data.get("image_file_id"))
    if image_file_id is None:
        image_file_id = _as_optional_string(base.get("image_file_id"))

    image_storage = _as_optional_string(data.get("image_storage"))
    if image_storage is None:
        image_storage = _as_optional_string(base.get("image_storage"))

    if image_file_id and not image_storage:
        image_storage = "gridfs"

    image_filename = _as_optional_string(data.get("image_filename"))
    if image_filename is None:
        image_filename = _as_optional_string(base.get("image_filename"))

    image_content_type = _as_optional_string(data.get("image_content_type"))
    if image_content_type is None:
        image_content_type = _as_optional_string(base.get("image_content_type"))

    image_uri = _as_optional_string(data.get("image_uri"))
    if image_uri is None:
        image_uri = _as_optional_string(data.get("image_url"))
    if image_uri is None:
        image_uri = _as_optional_string(base.get("image_uri"))

    return {
        "image_uri": image_uri,
        "image_file_id": image_file_id,
        "image_storage": image_storage,
        "image_filename": image_filename,
        "image_content_type": image_content_type,
    }


def serialize_entry_image_fields(entry: dict) -> dict:
    image_file_id = _as_optional_string(entry.get("image_file_id"))
    image_url = _build_image_url(image_file_id) if image_file_id else _as_optional_string(entry.get("image_uri"))
    image_storage = _as_optional_string(entry.get("image_storage"))
    if image_file_id and not image_storage:
        image_storage = "gridfs"

    return {
        "image_uri": image_url,
        "image_url": image_url,
        "image_file_id": image_file_id,
        "image_storage": image_storage,
        "image_filename": _as_optional_string(entry.get("image_filename")),
        "image_content_type": _as_optional_string(entry.get("image_content_type")),
    }


def get_stored_image(db, image_id: str):
    try:
        object_id = ObjectId(image_id)
    except Exception as exc:
        raise ValueError("Invalid image id") from exc

    try:
        return _get_bucket(db).get(object_id)
    except NoFile as exc:
        raise FileNotFoundError("Image not found") from exc
