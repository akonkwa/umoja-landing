from __future__ import annotations

from pathlib import Path
from xml.sax.saxutils import escape
import zipfile


OUTPUT_PATH = Path(
    "/Users/akonkwamubagwa/Documents/Playground/EFSTH_Gambia_Diesel_Comparison_Tables.xlsx"
)


BASE_PACKAGE_COST = 411_900.00
DIESEL_INSTALL_COST = 30_000.00
ASSUMED_LOAD_KW = 60
OPERATING_HOURS_PER_DAY = 10
ANNUAL_ENERGY_KWH = ASSUMED_LOAD_KW * OPERATING_HOURS_PER_DAY * 365
FUEL_INTENSITY = 0.30
DIESEL_PRICE = 1.25
ANNUAL_DIESEL_FUEL_USE = ANNUAL_ENERGY_KWH * FUEL_INTENSITY
ANNUAL_DIESEL_FUEL_COST = ANNUAL_DIESEL_FUEL_USE * DIESEL_PRICE
ANNUAL_DIESEL_OM = 3_500.00
TOTAL_ANNUAL_DIESEL_COST = ANNUAL_DIESEL_FUEL_COST + ANNUAL_DIESEL_OM
ANNUAL_SOLAR_OM_YEARS_1_TO_3 = 13_000.00
ANNUAL_SOLAR_OM_AFTER_YEAR_3 = 0.00
BREAK_EVEN_YEAR = (
    BASE_PACKAGE_COST + (3 * ANNUAL_SOLAR_OM_YEARS_1_TO_3) - DIESEL_INSTALL_COST
) / TOTAL_ANNUAL_DIESEL_COST
YEARLY_SAVINGS_AFTER_BREAK_EVEN = TOTAL_ANNUAL_DIESEL_COST - ANNUAL_SOLAR_OM_AFTER_YEAR_3


def money(value: float) -> str:
    sign = "-" if value < 0 else ""
    return f"{sign}${abs(value):,.2f}"


summary_rows = [
    ["Item", "Value"],
    ["Base package cost", money(BASE_PACKAGE_COST)],
    ["Assumed diesel install cost", money(DIESEL_INSTALL_COST)],
    ["Extra upfront cost vs diesel", money(BASE_PACKAGE_COST - DIESEL_INSTALL_COST)],
    ["Assumed equivalent diesel-served load", f"{ASSUMED_LOAD_KW} kW"],
    ["Assumed operating hours", f"{OPERATING_HOURS_PER_DAY} hours/day"],
    ["Annual energy served", f"{ANNUAL_ENERGY_KWH:,.0f} kWh/year"],
    ["Diesel fuel intensity", f"{FUEL_INTENSITY:.2f} L/kWh"],
    ["Annual diesel fuel use", f"{ANNUAL_DIESEL_FUEL_USE:,.0f} L/year"],
    ["Diesel price", f"${DIESEL_PRICE:.2f}/L"],
    ["Annual diesel fuel cost", money(ANNUAL_DIESEL_FUEL_COST)],
    ["Annual diesel O&M", money(ANNUAL_DIESEL_OM)],
    ["Total annual diesel cost", money(TOTAL_ANNUAL_DIESEL_COST)],
    ["Annual solar O&M", f"{money(ANNUAL_SOLAR_OM_YEARS_1_TO_3)}/year for years 1-3 only"],
    ["Annual solar O&M after year 3", "$0/year"],
    ["Break-even year", f"year {BREAK_EVEN_YEAR:.1f}"],
    ["Yearly savings after break-even", f"{money(YEARLY_SAVINGS_AFTER_BREAK_EVEN)}/year"],
]

five_year_rows = [
    [
        "Year",
        "Cumulative Solar Cost (Base Package)",
        "Cumulative Diesel Cost",
        "Net Position of Solar vs Diesel",
    ]
]
for year in range(0, 6):
    solar_cost = BASE_PACKAGE_COST
    if year > 0:
        solar_cost += ANNUAL_SOLAR_OM_YEARS_1_TO_3 * min(year, 3)
    diesel_cost = DIESEL_INSTALL_COST + (TOTAL_ANNUAL_DIESEL_COST * year)
    net = diesel_cost - solar_cost
    five_year_rows.append(
        [str(year), money(solar_cost), money(diesel_cost), money(net)]
    )


def col_letter(index: int) -> str:
    result = ""
    while index:
        index, rem = divmod(index - 1, 26)
        result = chr(65 + rem) + result
    return result


def cell_xml(ref: str, value: str, style_id: int) -> str:
    return (
        f'<c r="{ref}" s="{style_id}" t="inlineStr">'
        f"<is><t>{escape(value)}</t></is></c>"
    )


def row_xml(row_idx: int, values: list[str], style_id: int) -> str:
    cells = []
    for col_idx, value in enumerate(values, start=1):
        cells.append(cell_xml(f"{col_letter(col_idx)}{row_idx}", value, style_id))
    return f'<row r="{row_idx}" ht="24" customHeight="1">{"".join(cells)}</row>'


def make_sheet_xml() -> str:
    rows = []
    current = 1
    for values in summary_rows:
        style = 1 if current == 1 else 2
        rows.append(row_xml(current, values, style))
        current += 1
    current += 4
    for idx, values in enumerate(five_year_rows):
        style = 1 if idx == 0 else 2
        rows.append(row_xml(current, values, style))
        current += 1
    return (
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">'
        '<dimension ref="A1:D27"/>'
        '<sheetViews><sheetView workbookViewId="0"/></sheetViews>'
        '<sheetFormatPr defaultRowHeight="24"/>'
        '<cols>'
        '<col min="1" max="1" width="22" customWidth="1"/>'
        '<col min="2" max="2" width="52" customWidth="1"/>'
        '<col min="3" max="3" width="24" customWidth="1"/>'
        '<col min="4" max="4" width="30" customWidth="1"/>'
        '</cols>'
        f"<sheetData>{''.join(rows)}</sheetData>"
        '</worksheet>'
    )


def make_styles_xml() -> str:
    return """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <fonts count="2">
    <font>
      <sz val="11"/>
      <color rgb="000000"/>
      <name val="Aptos"/>
      <family val="2"/>
    </font>
    <font>
      <b/>
      <sz val="11"/>
      <color rgb="FFFFFF"/>
      <name val="Aptos"/>
      <family val="2"/>
    </font>
  </fonts>
  <fills count="3">
    <fill><patternFill patternType="none"/></fill>
    <fill><patternFill patternType="gray125"/></fill>
    <fill>
      <patternFill patternType="solid">
        <fgColor rgb="7F7F7F"/>
        <bgColor indexed="64"/>
      </patternFill>
    </fill>
  </fills>
  <borders count="2">
    <border>
      <left/><right/><top/><bottom/><diagonal/>
    </border>
    <border>
      <left style="thin"><color auto="1"/></left>
      <right style="thin"><color auto="1"/></right>
      <top style="thin"><color auto="1"/></top>
      <bottom style="thin"><color auto="1"/></bottom>
      <diagonal/>
    </border>
  </borders>
  <cellStyleXfs count="1">
    <xf numFmtId="0" fontId="0" fillId="0" borderId="0"/>
  </cellStyleXfs>
  <cellXfs count="3">
    <xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>
    <xf numFmtId="0" fontId="1" fillId="2" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1">
      <alignment horizontal="left" vertical="center"/>
    </xf>
    <xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0" applyBorder="1" applyAlignment="1">
      <alignment horizontal="left" vertical="center"/>
    </xf>
  </cellXfs>
  <cellStyles count="1">
    <cellStyle name="Normal" xfId="0" builtinId="0"/>
  </cellStyles>
</styleSheet>
"""


def main() -> None:
    content_types = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
  <Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
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
    <sheet name="Diesel Comparison" sheetId="1" r:id="rId1"/>
  </sheets>
</workbook>
"""
    workbook_rels = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>
"""
    core = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties"
 xmlns:dc="http://purl.org/dc/elements/1.1/"
 xmlns:dcterms="http://purl.org/dc/terms/"
 xmlns:dcmitype="http://purl.org/dc/dcmitype/"
 xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <dc:title>EFSTH Gambia Diesel Comparison Tables</dc:title>
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
    with zipfile.ZipFile(OUTPUT_PATH, "w", compression=zipfile.ZIP_DEFLATED) as zf:
        zf.writestr("[Content_Types].xml", content_types)
        zf.writestr("_rels/.rels", rels)
        zf.writestr("xl/workbook.xml", workbook)
        zf.writestr("xl/_rels/workbook.xml.rels", workbook_rels)
        zf.writestr("xl/worksheets/sheet1.xml", make_sheet_xml())
        zf.writestr("xl/styles.xml", make_styles_xml())
        zf.writestr("docProps/core.xml", core)
        zf.writestr("docProps/app.xml", app)
    print(OUTPUT_PATH)


if __name__ == "__main__":
    main()
