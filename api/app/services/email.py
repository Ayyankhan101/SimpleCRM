import os
import logging
from datetime import datetime, timezone, timedelta
from flask import current_app

logger = logging.getLogger(__name__)

RESEND_API_KEY = os.environ.get('RESEND_API_KEY')
FROM_EMAIL = os.environ.get('FROM_EMAIL', 'reminders@simplecrm.app')


def is_configured():
    return bool(RESEND_API_KEY)


def send_email(to, subject, html):
    if not RESEND_API_KEY:
        logger.warning("RESEND_API_KEY not set, skipping email")
        return False
    try:
        import resend
        resend.api_key = RESEND_API_KEY
        params = {"from": FROM_EMAIL, "to": to, "subject": subject, "html": html}
        result = resend.Emails.send(params)
        logger.info(f"Email sent to {to}: {result}")
        return True
    except Exception as e:
        logger.error(f"Email send failed: {e}")
        return False


def send_activity_reminder(to, activity):
    subject = f"Reminder: {activity.subject}"
    due = activity.due_date.strftime('%B %d, %Y at %I:%M %p') if activity.due_date else 'No date'
    html = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #1e40af;">Activity Reminder</h2>
      <p>You have an upcoming activity:</p>
      <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
        <p style="margin: 0; font-weight: bold;">{activity.subject}</p>
        <p style="margin: 8px 0 0; color: #6b7280;">Type: {activity.type} | Due: {due}</p>
      </div>
      <a href="{os.environ.get('FRONTEND_URL', 'https://frontend-navy-psi-33.vercel.app')}/activities"
         style="display: inline-block; background: #1e40af; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px;">
        View Activities
      </a>
    </div>
    """
    return send_email(to, subject, html)


def send_daily_digest(to, user_name, overdue, due_today, upcoming):
    total = len(overdue) + len(due_today) + len(upcoming)
    if total == 0:
        return False

    subject = f"Daily Digest: {total} activit{'y' if total == 1 else 'ies'} need attention"
    overdue_rows = ''.join(
        f'<tr><td style="padding:8px;border-bottom:1px solid #e5e7eb;color:#dc2626;font-weight:bold;">OVERDUE</td>'
        f'<td style="padding:8px;border-bottom:1px solid #e5e7eb;">{a.subject}</td>'
        f'<td style="padding:8px;border-bottom:1px solid #e5e7eb;color:#6b7280;">{a.due_date.strftime("%b %d") if a.due_date else "-"}</td></tr>'
        for a in overdue
    ) or '<tr><td colspan="3" style="padding:8px;color:#6b7280;">None</td></tr>'

    today_rows = ''.join(
        f'<tr><td style="padding:8px;border-bottom:1px solid #e5e7eb;color:#f59e0b;font-weight:bold;">TODAY</td>'
        f'<td style="padding:8px;border-bottom:1px solid #e5e7eb;">{a.subject}</td>'
        f'<td style="padding:8px;border-bottom:1px solid #e5e7eb;color:#6b7280;">{a.due_date.strftime("%I:%M %p") if a.due_date else "-"}</td></tr>'
        for a in due_today
    ) or '<tr><td colspan="3" style="padding:8px;color:#6b7280;">None</td></tr>'

    upcoming_rows = ''.join(
        f'<tr><td style="padding:8px;border-bottom:1px solid #e5e7eb;color:#3b82f6;font-weight:bold;">UPCOMING</td>'
        f'<td style="padding:8px;border-bottom:1px solid #e5e7eb;">{a.subject}</td>'
        f'<td style="padding:8px;border-bottom:1px solid #e5e7eb;color:#6b7280;">{a.due_date.strftime("%b %d") if a.due_date else "-"}</td></tr>'
        for a in upcoming
    ) or '<tr><td colspan="3" style="padding:8px;color:#6b7280;">None</td></tr>'

    html = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #1e40af;">Daily Digest</h2>
      <p>Hi {user_name}, here's your activity summary:</p>

      <h3 style="color: #dc2626; margin-top: 24px;">&#9888; Overdue ({len(overdue)})</h3>
      <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
        <tr style="background: #fef2f2;"><th style="padding:8px;text-align:left;">Status</th><th style="padding:8px;text-align:left;">Activity</th><th style="padding:8px;text-align:left;">Due</th></tr>
        {overdue_rows}
      </table>

      <h3 style="color: #f59e0b; margin-top: 24px;">&#128197; Due Today ({len(due_today)})</h3>
      <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
        <tr style="background: #fffbeb;"><th style="padding:8px;text-align:left;">Status</th><th style="padding:8px;text-align:left;">Activity</th><th style="padding:8px;text-align:left;">Due</th></tr>
        {today_rows}
      </table>

      <h3 style="color: #3b82f6; margin-top: 24px;">&#128336; Upcoming ({len(upcoming)})</h3>
      <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
        <tr style="background: #eff6ff;"><th style="padding:8px;text-align:left;">Status</th><th style="padding:8px;text-align:left;">Activity</th><th style="padding:8px;text-align:left;">Due</th></tr>
        {upcoming_rows}
      </table>

      <div style="margin-top: 24px;">
        <a href="{os.environ.get('FRONTEND_URL', 'https://frontend-navy-psi-33.vercel.app')}/activities"
           style="display: inline-block; background: #1e40af; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px;">
          View All Activities
        </a>
      </div>
    </div>
    """
    return send_email(to, subject, html)
