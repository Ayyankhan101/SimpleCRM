from datetime import timedelta


def calc_growth_rate(entries, field='metric_a'):
    if len(entries) < 2:
        return []

    result = []
    for i in range(1, len(entries)):
        prev = getattr(entries[i - 1], field, 0) or 0
        curr = getattr(entries[i], field, 0) or 0
        if prev > 0:
            rate = round((curr - prev) / prev * 100, 2)
        else:
            rate = 0
        result.append({
            'date': entries[i].date.isoformat() if entries[i].date else None,
            'value': curr,
            'growth_rate': rate
        })
    return result


def calc_moving_average(entries, field='metric_a', window=7):
    if len(entries) < window:
        return []

    result = []
    for i in range(window - 1, len(entries)):
        window_data = entries[i - window + 1:i + 1]
        avg = sum(getattr(e, field, 0) or 0 for e in window_data) / window
        result.append({
            'date': entries[i].date.isoformat() if entries[i].date else None,
            'value': getattr(entries[i], field, 0) or 0,
            'moving_avg': round(avg, 2)
        })
    return result


def forecast_trend(entries, field='metric_a', days_ahead=7):
    if len(entries) < 2:
        return []

    x_values = list(range(len(entries)))
    y_values = [getattr(e, field, 0) or 0 for e in entries]

    n = len(x_values)
    sum_x = sum(x_values)
    sum_y = sum(y_values)
    sum_xy = sum(x * y for x, y in zip(x_values, y_values))
    sum_x2 = sum(x * x for x in x_values)

    denom = n * sum_x2 - sum_x * sum_x
    if denom == 0:
        return []

    slope = (n * sum_xy - sum_x * sum_y) / denom
    intercept = (sum_y - slope * sum_x) / n

    last_date = entries[-1].date
    result = []
    for i in range(1, days_ahead + 1):
        future_date = last_date + timedelta(days=i)
        predicted = max(0, round(slope * (len(entries) + i - 1) + intercept))
        result.append({
            'date': future_date.isoformat(),
            'predicted': predicted
        })
    return result


def detect_anomalies(entries, field='metric_a', threshold=3):
    if len(entries) < 3:
        return []

    values = [getattr(e, field, 0) or 0 for e in entries]
    mean = sum(values) / len(values)
    variance = sum((v - mean) ** 2 for v in values) / len(values)
    std_dev = variance ** 0.5

    if std_dev == 0:
        return []

    anomalies = []
    for entry in entries:
        val = getattr(entry, field, 0) or 0
        z_score = abs(val - mean) / std_dev
        if z_score > threshold:
            anomalies.append({
                'date': entry.date.isoformat() if entry.date else None,
                'value': val,
                'z_score': round(z_score, 2),
                'field': field
            })
    return anomalies
