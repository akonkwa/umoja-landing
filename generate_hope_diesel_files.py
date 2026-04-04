from __future__ import annotations

from pathlib import Path
from xml.sax.saxutils import escape
import zipfile


OUTPUT_DIR = Path("/Users/akonkwamubagwa/Documents/Playground")
XLSX_PATH = OUTPUT_DIR / "Hope_for_Women_Diesel_Comparison_Base_Package.xlsx"
DOCX_PATH = OUTPUT_DIR / "Hope_for_Women_Diesel_Cost_Benefit_Analysis_Base_Package.docx"


BASE_PACKAGE_COST = 180700.0
SOLAR_OM_YEARS_1_3 = 13000.0
SOLAR_OM_AFTER_YEAR_3 = 0.0
DIESEL_INSTALL_COST = 30000.0
OPERATING_KW = 40.0
HOURS_PER_DAY = 10.0
DAYS_PER_YEAR = 365.0
ANNUAL_ENERGY = OPERATING_KW * HOURS_PER_DAY * DAYS_PER_YEAR
FUEL_INTENSITY = 0.30
DIESEL_PRICE = 0.976
DIESEL_OM = 3500.0
ANNUAL_DIESEL_FUEL_USE = ANNUAL_ENERGY * FUEL_INTENSITY
ANNUAL_DIESEL_FUEL_COST = ANNUAL_DIESEL_FUEL_USE * DIESEL_PRICE
ANNUAL_DIESEL_COST = ANNUAL_DIESEL_FUEL_COST + DIESEL_OM
BREAK_EVEN_YEAR = (
    (BASE_PACKAGE_COST - DIESEL_INSTALL_COST - (3 * SOLAR_OM_YEARS_1_3))
    / ANNUAL_DIESEL_COST
)
YEARLY_SAVINGS_AFTER_BREAK_EVEN = ANNUAL_DIESEL_COST - SOLAR_OM_AFTER_YEAR_3


def money(value: float) -> str:
    return f"${value:,.2f}"


summary_table = [
    ["Item", "Value"],
    ["Base package cost", money(BASE_PACKAGE_COST)],
    ["Assumed diesel install cost", money(DIESEL_INSTALL_COST)],
    ["Extra upfront cost vs diesel", money(BASE_PACKAGE_COST - DIESEL_INSTALL_COST)],
    ["Assumed equivalent diesel-served load", "40 kW"],
    ["Assumed operating hours", "10 hours/day"],
    ["Annual energy served", "146,000 kWh/year"],
    ["Diesel fuel intensity", "0.30 L/kWh"],
    ["Annual diesel fuel use", "43,800 L/year"],
    ["Diesel price", "$0.98/L"],
    ["Annual diesel fuel cost", money(ANNUAL_DIESEL_FUEL_COST)],
    ["Annual diesel O&M", money(DIESEL_OM)],
    ["Total annual diesel cost", money(ANNUAL_DIESEL_COST)],
    ["Annual solar O&M", "$13,000/year for years 1-3 only"],
    ["Annual solar O&M after year 3", "$0/year"],
    ["Break-even year", f"{BREAK_EVEN_YEAR:.2f} years"],
    [
        "Yearly savings after break-even",
        money(YEARLY_SAVINGS_AFTER_BREAK_EVEN) + "/year",
    ],
]


five_year_table = [
    [
        "Year",
        "Cumulative Solar Cost (Base Package)",
        "Cumulative Diesel Cost",
        "Net Position of Solar vs Diesel",
    ]
]

for year in range(0, 6):
    if year == 0:
        solar_cost = BASE_PACKAGE_COST
        diesel_cost = DIESEL_INSTALL_COST
    else:
        diesel_cost = DIESEL_INSTALL_COST + (ANNUAL_DIESEL_COST * year)
        if year <= 3:
            solar_cost = BASE_PACKAGE_COST + (SOLAR_OM_YEARS_1_3 * year)
        else:
            solar_cost = BASE_PACKAGE_COST + (SOLAR_OM_YEARS_1_3 * 3)
    net_position = diesel_cost - solar_cost
    five_year_table.append(
        [str(year), money(solar_cost), money(diesel_cost), money(net_position)]
    )


def xlsx_inline_cell(ref: str, value: str) -> str:
    return (
        f'<c r="{ref}" t="inlineStr"><is><t>{escape(value)}</t></is></c>'
    )


def build_sheet_xml(rows: list[list[str]]) -> str:
    row_xml = []
    for row_idx, row in enumerate(rows, start=1):
        cells = []
        for col_idx, value in enumerate(row, start=1):
            col_label = ""
            n = col_idx
            while n:
                n, rem = divmod(n - 1, 26)
                col_label = chr(65 + rem) + col_label
            cells.append(xlsx_inline_cell(f"{col_label}{row_idx}", str(value)))
        row_xml.append(f'<row r="{row_idx}">{"".join(cells)}</row>')
    dimension = f"A1:{'D' if len(rows[0]) >= 4 else 'B'}{len(rows)}"
    return (
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">'
        f'<dimension ref="{dimension}"/>'
        "<sheetViews><sheetView workbookViewId=\"0\"/></sheetViews>"
        "<sheetFormatPr defaultRowHeight=\"15\"/>"
        f"<sheetData>{''.join(row_xml)}</sheetData>"
        "</worksheet>"
    )


def create_xlsx() -> None:
    content_types = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
  <Override PartName="/xl/worksheets/sheet2.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
  <Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
  <Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>
</Types>
"""
    rels = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>
</Relationships>
"""
    workbook = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"
 xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets>
    <sheet name="Base Summary" sheetId="1" r:id="rId1"/>
    <sheet name="5-Year View" sheetId="2" r:id="rId2"/>
  </sheets>
</workbook>
"""
    workbook_rels = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet2.xml"/>
</Relationships>
"""
    core = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties"
 xmlns:dc="http://purl.org/dc/elements/1.1/"
 xmlns:dcterms="http://purl.org/dc/terms/"
 xmlns:dcmitype="http://purl.org/dc/dcmitype/"
 xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <dc:title>Hope for Women Diesel Comparison Base Package</dc:title>
  <dc:creator>Codex</dc:creator>
  <cp:lastModifiedBy>Codex</cp:lastModifiedBy>
  <dcterms:created xsi:type="dcterms:W3CDTF">2026-03-24T00:00:00Z</dcterms:created>
  <dcterms:modified xsi:type="dcterms:W3CDTF">2026-03-24T00:00:00Z</dcterms:modified>
</cp:coreProperties>
"""
    app = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties"
 xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes">
  <Application>Codex</Application>
</Properties>
"""
    with zipfile.ZipFile(XLSX_PATH, "w", compression=zipfile.ZIP_DEFLATED) as zf:
        zf.writestr("[Content_Types].xml", content_types)
        zf.writestr("_rels/.rels", rels)
        zf.writestr("xl/workbook.xml", workbook)
        zf.writestr("xl/_rels/workbook.xml.rels", workbook_rels)
        zf.writestr("xl/worksheets/sheet1.xml", build_sheet_xml(summary_table))
        zf.writestr("xl/worksheets/sheet2.xml", build_sheet_xml(five_year_table))
        zf.writestr("docProps/core.xml", core)
        zf.writestr("docProps/app.xml", app)


def make_paragraph(text: str, bold: bool = False) -> str:
    safe = escape(text)
    if bold:
        return (
            "<w:p><w:r><w:rPr><w:b/></w:rPr>"
            f"<w:t xml:space=\"preserve\">{safe}</w:t></w:r></w:p>"
        )
    return f"<w:p><w:r><w:t xml:space=\"preserve\">{safe}</w:t></w:r></w:p>"


def create_docx() -> None:
    paragraphs = [
        make_paragraph(
            "Cost-Benefit Analysis of Diesel Generator Equivalent - Base Package Only",
            bold=True,
        ),
        make_paragraph(
            "Reference system: HOPE for Women Health Center, Monrovia, Liberia. "
            "Base package includes 42 kWp solar PV and 261 kWh usable battery storage. "
            f"Base EPC price: {money(BASE_PACKAGE_COST)}."
        ),
        make_paragraph(
            "Comparison case: equivalent diesel supply serving an assumed 40 kW daytime load "
            "for roughly 10 hours per day over a full year."
        ),
        make_paragraph("Key assumptions", bold=True),
        make_paragraph("Annual energy served: 146,000 kWh/year"),
        make_paragraph("Diesel fuel intensity: 0.30 liters/kWh"),
        make_paragraph(f"Diesel price: approximately {money(DIESEL_PRICE)}/liter"),
        make_paragraph(f"Diesel annual O&M: {money(DIESEL_OM)}/year"),
        make_paragraph(
            "Solar O&M: $13,000/year for years 1-3 only, then hospital technicians take over routine care"
        ),
        make_paragraph(
            f"Diesel installed cost assumed for comparison: {money(DIESEL_INSTALL_COST)}"
        ),
        make_paragraph("Annual diesel cost", bold=True),
        make_paragraph(f"Fuel use: {ANNUAL_DIESEL_FUEL_USE:,.0f} liters/year"),
        make_paragraph(f"Fuel cost: {money(ANNUAL_DIESEL_FUEL_COST)}/year"),
        make_paragraph(
            f"Total diesel operating cost including O&M: {money(ANNUAL_DIESEL_COST)}/year"
        ),
        make_paragraph("Break-even result", bold=True),
        make_paragraph(
            f"With the year-3 maintenance handoff, break-even occurs at about {BREAK_EVEN_YEAR:.2f} years, "
            "which means during year 5 on a simple cumulative cash basis."
        ),
        make_paragraph("Savings after break-even", bold=True),
        make_paragraph(
            "After year 3, once solar maintenance is assumed to drop to zero, the annual savings "
            f"versus diesel are approximately {money(YEARLY_SAVINGS_AFTER_BREAK_EVEN)} per year."
        ),
        make_paragraph("Five-year cumulative view", bold=True),
    ]
    for year, solar, diesel, net in five_year_table[1:]:
        paragraphs.append(
            make_paragraph(
                f"Year {year}: Solar cumulative cost {solar}; diesel cumulative cost {diesel}; "
                f"net solar position {net}."
            )
        )
    paragraphs.extend(
        [
            make_paragraph("Conclusion", bold=True),
            make_paragraph(
                "The diesel option is cheaper at the start because of lower upfront cost. "
                "Once fuel and recurring generator operation are included, the base solar and battery "
                "package overtakes diesel during year 5. After the maintenance handoff, the avoided "
                f"diesel cost is approximately {money(YEARLY_SAVINGS_AFTER_BREAK_EVEN)} per year."
            ),
        ]
    )
    document_xml = (
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        '<w:document xmlns:wpc="http://schemas.microsoft.com/office/word/2010/wordprocessingCanvas" '
        'xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006" '
        'xmlns:o="urn:schemas-microsoft-com:office:office" '
        'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" '
        'xmlns:m="http://schemas.openxmlformats.org/officeDocument/2006/math" '
        'xmlns:v="urn:schemas-microsoft-com:vml" '
        'xmlns:wp14="http://schemas.microsoft.com/office/word/2010/wordprocessingDrawing" '
        'xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing" '
        'xmlns:w10="urn:schemas-microsoft-com:office:word" '
        'xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" '
        'xmlns:w14="http://schemas.microsoft.com/office/word/2010/wordml" '
        'xmlns:wpg="http://schemas.microsoft.com/office/word/2010/wordprocessingGroup" '
        'xmlns:wpi="http://schemas.microsoft.com/office/word/2010/wordprocessingInk" '
        'xmlns:wne="http://schemas.microsoft.com/office/word/2006/wordml" '
        'xmlns:wps="http://schemas.microsoft.com/office/word/2010/wordprocessingShape" '
        'mc:Ignorable="w14 wp14">'
        f"<w:body>{''.join(paragraphs)}"
        "<w:sectPr><w:pgSz w:w=\"12240\" w:h=\"15840\"/><w:pgMar "
        "w:top=\"1440\" w:right=\"1440\" w:bottom=\"1440\" w:left=\"1440\" "
        "w:header=\"708\" w:footer=\"708\" w:gutter=\"0\"/></w:sectPr>"
        "</w:body></w:document>"
    )
    content_types = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
  <Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>
</Types>
"""
    rels = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>
</Relationships>
"""
    core = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties"
 xmlns:dc="http://purl.org/dc/elements/1.1/"
 xmlns:dcterms="http://purl.org/dc/terms/"
 xmlns:dcmitype="http://purl.org/dc/dcmitype/"
 xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <dc:title>Hope for Women Diesel Cost Benefit Analysis Base Package</dc:title>
  <dc:creator>Codex</dc:creator>
  <cp:lastModifiedBy>Codex</cp:lastModifiedBy>
  <dcterms:created xsi:type="dcterms:W3CDTF">2026-03-24T00:00:00Z</dcterms:created>
  <dcterms:modified xsi:type="dcterms:W3CDTF">2026-03-24T00:00:00Z</dcterms:modified>
</cp:coreProperties>
"""
    app = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties"
 xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes">
  <Application>Codex</Application>
</Properties>
"""
    with zipfile.ZipFile(DOCX_PATH, "w", compression=zipfile.ZIP_DEFLATED) as zf:
        zf.writestr("[Content_Types].xml", content_types)
        zf.writestr("_rels/.rels", rels)
        zf.writestr("word/document.xml", document_xml)
        zf.writestr("docProps/core.xml", core)
        zf.writestr("docProps/app.xml", app)


def main() -> None:
    create_xlsx()
    create_docx()
    print(XLSX_PATH)
    print(DOCX_PATH)


if __name__ == "__main__":
    main()
