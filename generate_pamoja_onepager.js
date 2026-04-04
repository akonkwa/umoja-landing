const fs = require("fs");
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  ImageRun, Header, Footer, AlignmentType, BorderStyle, WidthType,
  ShadingType, VerticalAlign, LevelFormat, HeadingLevel, PageNumber,
} = require("docx");

const archImg = fs.readFileSync("/Users/akonkwamubagwa/Documents/00 Claude MIT/pamoja-architecture.png");

// Theme colors
const PURPLE = "7C3AED";
const CYAN = "06B6D4";
const DARK = "1E1B4B";      // deep indigo for body text
const MID = "4338CA";       // indigo mid
const LIGHT_BG = "F0EDFF";  // light purple tint for accent boxes
const CYAN_BG = "ECFEFF";   // light cyan tint
const WHITE = "FFFFFF";
const GRAY = "64748B";
const LIGHT_GRAY = "F8FAFC";

const noBorder = { style: BorderStyle.NONE, size: 0 };
const noBorders = { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder };

// Helper: section header with colored left border feel
function sectionTitle(text, color) {
  return new Paragraph({
    spacing: { before: 160, after: 60 },
    children: [
      new TextRun({ text: text.toUpperCase(), bold: true, size: 17, font: "Arial", color: color }),
    ],
  });
}

function bodyText(text, opts = {}) {
  return new Paragraph({
    spacing: { before: opts.spaceBefore || 0, after: opts.spaceAfter || 40 },
    alignment: opts.align || AlignmentType.LEFT,
    children: [
      new TextRun({ text, size: 15, font: "Arial", color: opts.color || DARK }),
    ],
  });
}

function bulletItem(text) {
  return new Paragraph({
    spacing: { before: 0, after: 20 },
    indent: { left: 180, hanging: 140 },
    children: [
      new TextRun({ text: "\u2022 ", size: 14, font: "Arial", color: PURPLE }),
      new TextRun({ text, size: 14, font: "Arial", color: DARK }),
    ],
  });
}

function emptyPara(size) {
  return new Paragraph({ spacing: { before: size || 0, after: 0 }, children: [new TextRun({ text: "", size: 2 })] });
}

// Cell helper
function cell(children, opts = {}) {
  return new TableCell({
    borders: noBorders,
    width: { size: opts.width || 4680, type: WidthType.DXA },
    shading: opts.shading ? { fill: opts.shading, type: ShadingType.CLEAR } : undefined,
    margins: { top: opts.padV || 80, bottom: opts.padV || 80, left: opts.padH || 120, right: opts.padH || 120 },
    verticalAlign: opts.vAlign || VerticalAlign.TOP,
    children: Array.isArray(children) ? children : [children],
    columnSpan: opts.colSpan,
  });
}

// ============================================================
// BUILD DOCUMENT
// ============================================================

const doc = new Document({
  styles: {
    default: {
      document: { run: { font: "Arial", size: 16, color: DARK } },
    },
  },
  sections: [
    {
      properties: {
        page: {
          size: { width: 12240, height: 15840 },
          margin: { top: 580, right: 720, bottom: 480, left: 720 },
        },
      },
      children: [
        // ── HEADER BANNER ──
        // Title: PAMOJA
        new Paragraph({
          spacing: { before: 0, after: 0 },
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({ text: "P", bold: true, size: 56, font: "Arial Black", color: "6D28D9" }),
            new TextRun({ text: "A", bold: true, size: 56, font: "Arial Black", color: "7C3AED" }),
            new TextRun({ text: "M", bold: true, size: 56, font: "Arial Black", color: "6366F1" }),
            new TextRun({ text: "O", bold: true, size: 56, font: "Arial Black", color: "3B82F6" }),
            new TextRun({ text: "J", bold: true, size: 56, font: "Arial Black", color: "0EA5E9" }),
            new TextRun({ text: "A", bold: true, size: 56, font: "Arial Black", color: "06B6D4" }),
          ],
        }),

        // Subtitle
        new Paragraph({
          spacing: { before: 0, after: 20 },
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({ text: "AGENT-BASED SOCIAL NAVIGATION", size: 18, font: "Arial", color: GRAY, characterSpacing: 120 }),
          ],
        }),

        // Team line
        new Paragraph({
          spacing: { before: 20, after: 40 },
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({ text: "Akonkwa Mubagwa (Harvard)  |  Oluwatise (MIT)  |  MIT AI Venture Studio 2026", size: 14, font: "Arial", color: GRAY }),
          ],
        }),

        // Tagline bar
        new Table({
          width: { size: 10800, type: WidthType.DXA },
          columnWidths: [10800],
          rows: [
            new TableRow({
              children: [
                cell(
                  [new Paragraph({
                    alignment: AlignmentType.CENTER,
                    spacing: { before: 0, after: 0 },
                    children: [
                      new TextRun({ text: "Your network has always been a map - frozen in time. Pamoja turns it into a living system that remembers, reasons, and acts.", size: 16, font: "Arial", italics: true, color: WHITE }),
                    ],
                  })],
                  { width: 10800, shading: PURPLE, padV: 100, padH: 200 }
                ),
              ],
            }),
          ],
        }),

        emptyPara(80),

        // ── TWO-COLUMN MAIN CONTENT ──
        new Table({
          width: { size: 10800, type: WidthType.DXA },
          columnWidths: [5200, 5600],
          rows: [
            new TableRow({
              children: [
                // LEFT COLUMN
                cell([
                  sectionTitle("Problem", PURPLE),
                  bodyText("People attend high-value events with no intelligent support for navigating who to meet or how one event connects to the next. Existing tools provide static profiles - valuable connections are left to luck and memory decays immediately."),

                  sectionTitle("Why Agentic", PURPLE),
                  bulletItem("Each user has a persistent Profile Agent with memory, goals, and callable workflows"),
                  bulletItem("Each event gets an Event Agent understanding attendees, themes, and context"),
                  bulletItem("Profile Agents query Event Agents, retrieve cross-event memory, rank who matters"),
                  bulletItem("After debrief, agents update memory so recommendations improve over time"),

                  sectionTitle("MVP Loop", PURPLE),
                  new Paragraph({ spacing: { before: 0, after: 20 }, indent: { left: 100 }, children: [
                    new TextRun({ text: "1. ", bold: true, size: 14, color: PURPLE, font: "Arial" }),
                    new TextRun({ text: "Organizer uploads attendee list + event metadata", size: 14, color: DARK, font: "Arial" }),
                  ]}),
                  new Paragraph({ spacing: { before: 0, after: 20 }, indent: { left: 100 }, children: [
                    new TextRun({ text: "2. ", bold: true, size: 14, color: PURPLE, font: "Arial" }),
                    new TextRun({ text: "System creates draft Profile Agents for attendees", size: 14, color: DARK, font: "Arial" }),
                  ]}),
                  new Paragraph({ spacing: { before: 0, after: 20 }, indent: { left: 100 }, children: [
                    new TextRun({ text: "3. ", bold: true, size: 14, color: PURPLE, font: "Arial" }),
                    new TextRun({ text: "User claims agent, confirms: working on / looking for / want to meet", size: 14, color: DARK, font: "Arial" }),
                  ]}),
                  new Paragraph({ spacing: { before: 0, after: 20 }, indent: { left: 100 }, children: [
                    new TextRun({ text: "4. ", bold: true, size: 14, color: PURPLE, font: "Arial" }),
                    new TextRun({ text: 'User asks: "Who should I meet at this event?"', size: 14, color: DARK, font: "Arial" }),
                  ]}),
                  new Paragraph({ spacing: { before: 0, after: 20 }, indent: { left: 100 }, children: [
                    new TextRun({ text: "5. ", bold: true, size: 14, color: PURPLE, font: "Arial" }),
                    new TextRun({ text: "Agent returns 3 ranked people with reasons", size: 14, color: DARK, font: "Arial" }),
                  ]}),
                  new Paragraph({ spacing: { before: 0, after: 20 }, indent: { left: 100 }, children: [
                    new TextRun({ text: "6. ", bold: true, size: 14, color: PURPLE, font: "Arial" }),
                    new TextRun({ text: "Post-event debrief updates memory for future runs", size: 14, color: DARK, font: "Arial" }),
                  ]}),

                  sectionTitle("Success Metric", PURPLE),
                  bodyText("User receives 3 relevant recommendations in under 90 seconds; at least one rated useful after debrief."),

                ], { width: 5200, padH: 140 }),

                // RIGHT COLUMN
                cell([
                  sectionTitle("Architecture", CYAN),
                  new Paragraph({
                    spacing: { before: 40, after: 60 },
                    alignment: AlignmentType.CENTER,
                    children: [
                      new ImageRun({
                        type: "png",
                        data: archImg,
                        transformation: { width: 370, height: 208 },
                        altText: { title: "Architecture", description: "PAMOJA system architecture diagram", name: "arch" },
                      }),
                    ],
                  }),

                  sectionTitle("Why Us / Why Now", CYAN),
                  bodyText("We build for a setting we inhabit: recurring Harvard/MIT cohort communities where the same people gather but lack intelligent social infrastructure. Function-calling LLMs and practical memory systems now make persistent agents feasible."),

                  sectionTitle("Feasibility", CYAN),
                  new Paragraph({
                    spacing: { before: 0, after: 20 },
                    children: [
                      new TextRun({ text: "Build: ", bold: true, size: 14, color: CYAN, font: "Arial" }),
                      new TextRun({ text: "Profile Agent creation from roster, claim/confirm flow, Event Agent per event, ranked recommendations with explanations, post-event debrief with memory writeback", size: 14, color: DARK, font: "Arial" }),
                    ],
                  }),
                  new Paragraph({
                    spacing: { before: 0, after: 40 },
                    children: [
                      new TextRun({ text: "Won't build: ", bold: true, size: 14, color: GRAY, font: "Arial" }),
                      new TextRun({ text: "full messaging platform, always-on autonomous agents, full graph explorer, generalized multi-agent simulations", size: 14, color: GRAY, font: "Arial" }),
                    ],
                  }),

                  sectionTitle("Unique Moat", CYAN),
                  bulletItem("Persistent agent memory compounds in value over time"),
                  bulletItem("Cross-event intelligence missing from incumbents"),
                  bulletItem("Closed-cohort deployment solves cold start on day one"),
                  bulletItem("Every debrief strengthens future retrieval and ranking"),

                  sectionTitle("Platform Vision", CYAN),
                  bodyText("Pamoja is the agentic social layer for any recurring community - alumni networks, professional cohorts, conference circuits, housing co-ops. A decentralized successor to static WhatsApp groups."),

                ], { width: 5600, padH: 140 }),
              ],
            }),
          ],
        }),

        // ── FOOTER BAR ──
        emptyPara(60),
        new Table({
          width: { size: 10800, type: WidthType.DXA },
          columnWidths: [10800],
          rows: [
            new TableRow({
              children: [
                cell(
                  [new Paragraph({
                    alignment: AlignmentType.CENTER,
                    spacing: { before: 0, after: 0 },
                    children: [
                      new TextRun({ text: "pamoja  ", bold: true, size: 15, font: "Arial", color: WHITE }),
                      new TextRun({ text: "  |  ", size: 14, font: "Arial", color: "C4B5FD" }),
                      new TextRun({ text: "  Developed @ MIT Media Lab", size: 14, font: "Arial", color: "E0E7FF" }),
                      new TextRun({ text: "  |  ", size: 14, font: "Arial", color: "C4B5FD" }),
                      new TextRun({ text: "  pamoja.mit.edu", size: 14, font: "Arial", color: "E0E7FF" }),
                    ],
                  })],
                  { width: 10800, shading: "4338CA", padV: 80, padH: 200 }
                ),
              ],
            }),
          ],
        }),
      ],
    },
  ],
});

Packer.toBuffer(doc).then((buffer) => {
  fs.writeFileSync("/Users/akonkwamubagwa/Documents/Playground/PAMOJA_One_Page_Elite.docx", buffer);
  console.log("DONE - PAMOJA_One_Page_Elite.docx created (" + buffer.length + " bytes)");
});
