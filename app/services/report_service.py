import io
import json
from datetime import datetime, timezone
from typing import Any

from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle


def build_pdf_report(prediction: dict[str, Any], filename: str, clinician_note: str = "") -> bytes:
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter, rightMargin=48, leftMargin=48, topMargin=48, bottomMargin=48)
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle("Title", parent=styles["Heading1"], textColor=colors.HexColor("#006688"))
    body = styles["Normal"]
    story = []

    ts = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")
    story.append(Paragraph("OncoLens AI — Clinical Intelligence Report", title_style))
    story.append(Paragraph(f"Generated: {ts}", body))
    story.append(Spacer(1, 0.2 * inch))

    cm = prediction.get("confidence_metrics", {})
    rows = [
        ["Study ID", prediction.get("study_id", "")],
        ["Filename", filename],
        ["Classification", prediction.get("classification", "")],
        ["Modality", prediction.get("modality", "")],
        ["Model", prediction.get("model_name", "")],
        ["Primary Confidence", f"{cm.get('primary_confidence', 0) * 100:.1f}%"],
        ["Benign Probability", f"{cm.get('benign_probability', 0) * 100:.1f}%"],
        ["Malignancy Probability", f"{cm.get('malignancy_probability', 0) * 100:.1f}%"],
        ["Processing Time", f"{prediction.get('processing_time_ms', 0):.0f} ms"],
        ["Molecular Subtype", prediction.get("molecular_subtype", "")],
    ]
    table = Table(rows, colWidths=[2.2 * inch, 4.3 * inch])
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (0, -1), colors.HexColor("#e8f4f8")),
                ("TEXTCOLOR", (0, 0), (-1, -1), colors.HexColor("#1a2a3a")),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#99c9d6")),
                ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
                ("FONTSIZE", (0, 0), (-1, -1), 9),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ]
        )
    )
    story.append(table)
    story.append(Spacer(1, 0.25 * inch))

    story.append(Paragraph("<b>Treatment Protocol</b>", body))
    for agent in prediction.get("treatment_protocol", []):
        line = (
            f"<b>{agent.get('medicine')}</b> — {agent.get('dosage')} "
            f"({agent.get('route')}, {agent.get('cycle')})<br/>"
            f"<i>{agent.get('purpose')}</i>"
        )
        story.append(Paragraph(line, body))
        story.append(Spacer(1, 0.08 * inch))

    story.append(Spacer(1, 0.15 * inch))
    story.append(Paragraph("<b>Disease Breakdown</b>", body))
    story.append(Paragraph(json.dumps(prediction.get("disease_breakdown", {}), indent=2), body))

    if clinician_note:
        story.append(Spacer(1, 0.15 * inch))
        story.append(Paragraph(f"<b>Clinician Notes:</b> {clinician_note}", body))

    story.append(Spacer(1, 0.2 * inch))
    story.append(
        Paragraph(
            "<i>Disclaimer: AI decision-support only. Physician review required before clinical action.</i>",
            body,
        )
    )
    doc.build(story)
    return buffer.getvalue()
