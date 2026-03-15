from __future__ import annotations

from datetime import date, datetime, timedelta


def today_date() -> date:
    return date.today()


def today_str() -> str:
    return today_date().isoformat()


def parse_day(value: str | None) -> date:
    if not value:
        return today_date()

    try:
        return date.fromisoformat(value)
    except ValueError:
        return today_date()


def iso_day(value: date | datetime | str | None = None) -> str:
    if value is None:
        return today_str()

    if isinstance(value, datetime):
        return value.date().isoformat()

    if isinstance(value, date):
        return value.isoformat()

    return parse_day(value).isoformat()


def shift_day(value: str | date | None, days: int) -> str:
    base = parse_day(value if isinstance(value, str) else iso_day(value))
    return (base + timedelta(days=days)).isoformat()


def daterange(days: int, end_day: str | date | None = None) -> list[str]:
    total_days = max(1, int(days or 1))
    end_value = parse_day(end_day if isinstance(end_day, str) else iso_day(end_day))
    start_value = end_value - timedelta(days=total_days - 1)
    return [
        (start_value + timedelta(days=index)).isoformat()
        for index in range(total_days)
    ]


def weekday_label(day_value: str) -> str:
    return parse_day(day_value).strftime("%a")
