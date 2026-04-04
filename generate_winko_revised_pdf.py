from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT, TA_RIGHT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import Image, PageBreak, Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle


BASE_DIR = Path("/Users/akonkwamubagwa/Documents/Playground")
OUTPUT = BASE_DIR / "Winko_Gambia_Revised_Proposal_20260316_v2.pdf"
PHOTO_STRIP = BASE_DIR / "extracted_images" / "ref_page1_1_X6.png"

RED = colors.HexColor("#D62828")
TEXT = colors.HexColor("#111111")
MUTED = colors.HexColor("#5F6368")
LINE = colors.HexColor("#D9D9D9")
HEADER_GREY = colors.HexColor("#4A4A4A")
LIGHT_GREY = colors.HexColor("#F4F4F4")


def money(value: str) -> str:
    return f"${value}"


styles = getSampleStyleSheet()
styles.add(
    ParagraphStyle(
        name="Body",
        fontName="Helvetica",
        fontSize=10,
        leading=14,
        textColor=TEXT,
        spaceAfter=6,
    )
)
styles.add(
    ParagraphStyle(
        name="Small",
        fontName="Helvetica",
        fontSize=8.5,
        leading=11,
        textColor=MUTED,
        spaceAfter=4,
    )
)
styles.add(
    ParagraphStyle(
        name="TitleCustom",
        fontName="Helvetica-Bold",
        fontSize=20,
        leading=25,
        textColor=TEXT,
        spaceAfter=10,
    )
)
styles.add(
    ParagraphStyle(
        name="Section",
        fontName="Helvetica-Bold",
        fontSize=13,
        leading=16,
        textColor=TEXT,
        spaceAfter=8,
        spaceBefore=8,
    )
)
styles.add(
    ParagraphStyle(
        name="Subsection",
        fontName="Helvetica-Bold",
        fontSize=11,
        leading=14,
        textColor=TEXT,
        spaceAfter=6,
        spaceBefore=6,
    )
)
styles.add(
    ParagraphStyle(
        name="RightNote",
        fontName="Helvetica",
        fontSize=9,
        leading=12,
        textColor=MUTED,
        alignment=TA_RIGHT,
    )
)


def header(canvas, doc):
    canvas.saveState()
    width, height = A4
    canvas.setFont("Helvetica-Bold", 18)
    canvas.setFillColor(RED)
    canvas.drawRightString(width - doc.rightMargin, height - 36, "WINKO")
    canvas.setFont("Helvetica", 8)
    canvas.setFillColor(MUTED)
    canvas.drawString(doc.leftMargin, 22, f"Edward Francis Small Teaching Hospital (EFSTH) | Revised Proposal")
    canvas.drawRightString(width - doc.rightMargin, 22, str(canvas.getPageNumber()))
    canvas.restoreState()


def p(text, style="Body"):
    return Paragraph(text, styles[style])


def bullet(text):
    return Paragraph(f"• {text}", styles["Body"])


def make_table(rows, col_widths, header_rows=1, align="LEFT", small=False):
    style = styles["Small"] if small else styles["Body"]
    wrapped = []
    for row in rows:
        wrapped.append([Paragraph(str(cell), style) for cell in row])
    table = Table(wrapped, colWidths=col_widths, repeatRows=header_rows, hAlign=align)
    ts = TableStyle(
        [
            ("BACKGROUND", (0, 0), (-1, 0), HEADER_GREY),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTSIZE", (0, 0), (-1, 0), 9),
            ("LEADING", (0, 0), (-1, -1), 12),
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("GRID", (0, 0), (-1, -1), 0.5, LINE),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, LIGHT_GREY]),
            ("LEFTPADDING", (0, 0), (-1, -1), 6),
            ("RIGHTPADDING", (0, 0), (-1, -1), 6),
            ("TOPPADDING", (0, 0), (-1, -1), 6),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ]
    )
    table.setStyle(ts)
    return table


story = []

story.append(Spacer(1, 0.2 * inch))
story.append(p("Updated Proposal and Commercial Response", "TitleCustom"))
story.append(
    p(
        "Edward Francis Small Teaching Hospital (EFSTH), Banjul, The Gambia",
        "Subsection",
    )
)
story.append(
    p(
        "Solar PV, battery storage, and automated cleaning system expansion for oxygen-system reliability.",
        "Body",
    )
)
story.append(Spacer(1, 0.1 * inch))
story.append(Image(str(PHOTO_STRIP), width=6.9 * inch, height=1.75 * inch))
story.append(Spacer(1, 0.16 * inch))
story.append(
    p(
        "This revised offer updates the original EFSTH EPC proposal by increasing the installed solar capacity from "
        "<b>140 kWp</b> to <b>170 kWp</b>, increasing usable battery storage from <b>522 kWh</b> to "
        "<b>622 kWh</b>, and incorporating the automated PV cleaning system into the full project total.",
        "Body",
    )
)

summary_rows = [
    ["Item", "Original Scope", "Revised Scope"],
    ["Solar PV capacity", "140 kWp", "170 kWp"],
    ["Approximate module count", "~300 modules", "~365 modules"],
    ["Usable battery capacity", "522 kWh", "622 kWh"],
    ["Hybrid inverter capacity", "125 kW", "125 kW"],
]
story.append(make_table(summary_rows, [2.5 * inch, 2.0 * inch, 2.0 * inch]))
story.append(Spacer(1, 0.16 * inch))

story.append(p("1. Executive Summary", "Section"))
story.append(
    p(
        "The technical design basis remains tied to the oxygen plant load profile validated during the site visit on "
        "<b>January 19, 2026</b>: base load <b>15 kW</b>, average load <b>25 kW</b>, cyclic peak load <b>35 kW</b>, "
        "and daily energy demand of approximately <b>600 kWh/day</b>.",
        "Body",
    )
)
for item in [
    "The extra 30 kWp improves daytime production margin and battery charging headroom.",
    "The extra 100 kWh improves outage-bridging capability and late-day resilience.",
    "The automated cleaning system protects real delivered energy yield under Harmattan dust and coastal salt exposure.",
    "The overall objective remains uninterrupted oxygen-system support during grid instability.",
]:
    story.append(bullet(item))

story.append(p("2. Technical Scope", "Section"))
story.append(
    p(
        "The revised system remains a distributed rooftop PV and battery installation across EFSTH buildings, with the "
        "battery and inverter equipment located as close as practical to the oxygen-plant point of interconnection.",
        "Body",
    )
)
for item in [
    "Distributed rooftop PV arrays across the approved hospital roofs",
    "LiFePO4 battery energy storage system",
    "Hybrid inverter system with controlled solar, battery, and grid operation",
    "Dedicated oxygen-plant circuits with clear isolation and protection philosophy",
    "Remote monitoring, alarms, event logging, and cleaning-cycle reporting",
    "Automated cleaning system using rail cleaning on regular roof sections and tethered robots on irregular sections",
]:
    story.append(bullet(item))

story.append(p("3. Implementation Plan", "Section"))
phase_rows = [
    ["Phase", "Duration", "Primary Deliverables"],
    [
        "Phase I - Planning and validation",
        "2-3 weeks",
        "Final SLD, PV layout, BoM, cable routing, protection philosophy, cleaning-zone assignment, HSE and commissioning plans",
    ],
    [
        "Phase II - Procurement, logistics, and installation",
        "6-10 weeks",
        "Equipment procurement, shipping to Banjul, port handling, PV/BESS installation, cleaning-system installation, electrical integration",
    ],
    [
        "Phase III - Testing, commissioning, and handover",
        "2-3 weeks",
        "Step-load tests, grid-loss and grid-return tests, monitoring verification, training, as-builts, handover pack",
    ],
]
story.append(make_table(phase_rows, [2.0 * inch, 1.0 * inch, 3.7 * inch], small=True))

story.append(Spacer(1, 0.08 * inch))
story.append(p("4. Revised Commercial Summary", "Section"))
story.append(
    p(
        "The revised commercial total below uses the previously established project value for the original "
        "<b>140 kWp / 522 kWh</b> system, then adds the delivered EPC increment for the larger PV and battery scope "
        "together with the automated cleaning package.",
        "Body",
    )
)
pricing_rows = [
    ["Category", "Cost (USD)"],
    ["Original EFSTH EPC system price (140 kWp PV + 522 kWh BESS)", money("411,900.00")],
    ["Additional scope for +30 kWp PV and +100 kWh battery", money("92,000.00")],
    ["Automated cleaning system", money("80,000.00")],
    ["Total revised project cost", money("583,900.00")],
]
pricing_table = make_table(pricing_rows, [4.8 * inch, 1.9 * inch])
pricing_table.setStyle(
    TableStyle(
        [
            ("BACKGROUND", (0, 4), (-1, 4), LIGHT_GREY),
            ("TEXTCOLOR", (0, 4), (-1, 4), TEXT),
            ("FONTNAME", (0, 4), (-1, 4), "Helvetica-Bold"),
        ]
    )
)
story.append(pricing_table)
story.append(
    p(
        "The incremental <b>$92,000</b> is intended to capture the full delivered EPC effect of the added PV modules, "
        "additional battery capacity, mounting and BOS expansion, shipping impact, integration, commissioning, and "
        "performance responsibility. The cleaning system is carried separately at <b>$80,000</b> as directed.",
        "Body",
    )
)

story.append(p("5. Payment Timeline", "Section"))
story.append(
    p(
        "The payment schedule below follows the client-provided phase structure and date windows and recalculates the "
        "milestone values against the revised total of <b>$583,900.00</b>.",
        "Body",
    )
)
payment_rows = [
    ["Time", "Phase", "Duration", "Payment trigger", "Cumulative %", "Amount (USD)", "Projected dates"],
    ["T0", "Omega", "60 days", "50% at order placement", "50.0%", money("291,950.00"), "Aug 1, 2026 - Sep 30, 2026"],
    ["T1", "Sigma", "40 days", "25% before shipment", "75.0%", money("145,975.00"), "Oct 1, 2026 - Nov 9, 2026"],
    ["T2", "Lambda", "30 days", "12.5% upon equipment arrival", "87.5%", money("72,987.50"), "Nov 10, 2026 - Dec 9, 2026"],
    ["T3", "Kappa", "15 days", "No payment milestone", "87.5%", money("0.00"), "Dec 10, 2026 - Dec 24, 2026"],
    ["T4", "Epsilon", "5 days", "Final 12.5% after reporting", "100.0%", money("72,987.50"), "Dec 25, 2026 - Dec 29, 2026"],
]
story.append(make_table(payment_rows, [0.45 * inch, 0.7 * inch, 0.7 * inch, 1.8 * inch, 0.7 * inch, 1.0 * inch, 1.55 * inch], small=True))

story.append(PageBreak())

story.append(p("6. Bill of Materials Included in Contract", "Section"))
story.append(
    p(
        "The Bill of Materials should be incorporated into the contract as a formal appendix. A recommended clause is "
        "set out below.",
        "Body",
    )
)
story.append(
    p(
        "<b>Bill of Materials (BoM) and Scope Reference.</b> The Bill of Materials attached as Appendix A forms an "
        "integral part of this Contract. The Contractor shall supply, deliver, install, test, and commission the "
        "equipment and material listed in Appendix A, together with all associated accessories, cabling, mounting, "
        "monitoring, protection devices, and incidental works required for a complete and operational system. "
        "Equivalent or higher-specification components may only be substituted with prior written approval from the "
        "Client, provided that such substitution does not reduce performance, safety, warranty coverage, or monitoring "
        "functionality.",
        "Body",
    )
)

bom_rows = [
    ["Hardware Category", "Cost (USD)", "Equipment Included"],
    ["PV Modules", money("69,214.29"), "PV modules for approximately 365 panels, MC4 connectors, and module cabling"],
    ["Battery Energy Storage System (BESS)", money("101,283.52"), "LiFePO4 battery modules, racks, BMS, and battery enclosure"],
    ["Hybrid Inverter System", money("28,000.00"), "Hybrid inverter units, communication modules, and monitoring interface"],
    ["Mounting Structures & PV BOS", money("21,857.14"), "Rooftop rails, clamps, structural attachments, DC combiner boxes, and PV DC cabling"],
    ["Electrical BOS & Protection", money("14,257.32"), "ATS, AC cabling, disconnects, breakers, surge protection, grounding, and distribution interface"],
    ["Total hardware mapping", money("234,612.28"), ""],
]
bom_table = make_table(bom_rows, [2.2 * inch, 1.0 * inch, 3.45 * inch], small=True)
bom_table.setStyle(
    TableStyle(
        [
            ("BACKGROUND", (0, 6), (-1, 6), LIGHT_GREY),
            ("TEXTCOLOR", (0, 6), (-1, 6), TEXT),
            ("FONTNAME", (0, 6), (-1, 6), "Helvetica-Bold"),
        ]
    )
)
story.append(bom_table)

story.append(p("7. Commercial Notes", "Section"))
for item in [
    "The inverter platform is kept at 125 kW in this draft.",
    "The revised module count is shown as approximately 365 modules for planning purposes.",
    "The payment schedule follows the dates supplied by the client and is shown here against calendar dates in 2026.",
    "Final procurement values should be confirmed at equipment ordering.",
]:
    story.append(bullet(item))

story.append(Spacer(1, 0.15 * inch))
story.append(
    p(
        "Winko delivers not only hardware, but a complete critical-load energy system built for real hospital operating "
        "conditions: design, integration, logistics, installation, commissioning, safety, training, and performance.",
        "Subsection",
    )
)

story.append(PageBreak())
story.append(p("8. Complete Project Breakdown", "Section"))
story.append(
    p(
        "The table below consolidates the full project price into hardware, non-hardware EPC delivery items, and the "
        "automatic cleaning system so the complete commercial structure is visible in one place.",
        "Body",
    )
)
breakdown_rows = [
    ["Category Group", "Line Item", "Cost (USD)"],
    ["Hardware", "PV Modules", money("69,214.29")],
    ["Hardware", "Battery Energy Storage System (BESS)", money("101,283.52")],
    ["Hardware", "Hybrid Inverter System", money("28,000.00")],
    ["Hardware", "Mounting Structures & PV BOS", money("21,857.14")],
    ["Hardware", "Electrical BOS & Protection", money("14,257.32")],
    ["Hardware", "Total Hardware", money("234,612.28")],
    ["Non-Hardware", "Logistics & Import Handling", money("8,000.00")],
    ["Non-Hardware", "Installation & On-Site Works", money("37,100.00")],
    ["Non-Hardware", "Engineering, Travel & Commissioning", money("34,800.00")],
    ["Non-Hardware", "EPC Delivery & Performance Assurance", money("189,387.72")],
    ["Non-Hardware", "Total Non-Hardware", money("269,287.72")],
    ["Automatic Cleaning", "Automated Cleaning System", money("80,000.00")],
    ["Grand Total", "Complete Revised Project Cost", money("583,900.00")],
]

breakdown_table = make_table(breakdown_rows, [1.35 * inch, 4.1 * inch, 1.25 * inch], small=True)
breakdown_table.setStyle(
    TableStyle(
        [
            ("BACKGROUND", (0, 6), (-1, 6), LIGHT_GREY),
            ("BACKGROUND", (0, 10), (-1, 10), LIGHT_GREY),
            ("BACKGROUND", (0, 12), (-1, 12), LIGHT_GREY),
            ("BACKGROUND", (0, 13), (-1, 13), LIGHT_GREY),
            ("TEXTCOLOR", (0, 6), (-1, 13), TEXT),
            ("FONTNAME", (0, 6), (-1, 6), "Helvetica-Bold"),
            ("FONTNAME", (0, 10), (-1, 10), "Helvetica-Bold"),
            ("FONTNAME", (0, 12), (-1, 12), "Helvetica-Bold"),
            ("FONTNAME", (0, 13), (-1, 13), "Helvetica-Bold"),
        ]
    )
)
story.append(breakdown_table)

doc = SimpleDocTemplate(
    str(OUTPUT),
    pagesize=A4,
    leftMargin=42,
    rightMargin=42,
    topMargin=56,
    bottomMargin=34,
    title="Winko Revised Proposal - EFSTH Gambia",
    author="Winko",
)
doc.build(story, onFirstPage=header, onLaterPages=header)
print(OUTPUT)
