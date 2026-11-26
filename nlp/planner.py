def build_plan(scores: dict, weak: list, days_left: int, daily_hours: float,
               weakness_factor: float = 0.5) -> list:
    """Greedy scheduler: hours are shared in proportion to priority; last day is revision."""
    if days_left < 2:
        raise ValueError("At least two days are needed (study + revision)")
    study_days = days_left - 1
    priority = {t: s * (1 + (weakness_factor if t in weak else 0)) for t, s in scores.items()}
    total = sum(priority.values()) or 1
    hours = {t: study_days * daily_hours * p / total for t, p in priority.items()}

    schedule, day, free = [], 1, daily_hours
    for topic in sorted(hours, key=hours.get, reverse=True):
        need = hours[topic]
        while need > 1e-9 and day <= study_days:
            slot = min(need, free)
            schedule.append({"day": day, "topic_id": topic, "hours": round(slot, 2)})
            need, free = need - slot, free - slot
            if free <= 1e-9:
                day, free = day + 1, daily_hours
    schedule.append({"day": days_left, "topic_id": "REVISION", "hours": daily_hours})
    return schedule
