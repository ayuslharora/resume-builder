import {
  AlignmentType,
  BorderStyle,
  Document,
  Packer,
  Paragraph,
  ShadingType,
  Table,
  TableCell,
  TableRow,
  TabStopPosition,
  TabStopType,
  TextRun,
  WidthType,
} from "docx";
import { stripResumeHtml } from "./resumeHtmlSanitizer";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function clean(v) {
  return stripResumeHtml(typeof v === "string" ? v : (v ? String(v) : "")).trim();
}

// Cell borders: all NONE
function noBorders() {
  const n = { style: BorderStyle.NONE, size: 0, color: "auto" };
  return { top: n, bottom: n, left: n, right: n };
}

// Table-level borders: all NONE including inner grid lines
function noTableBorders() {
  const n = { style: BorderStyle.NONE, size: 0, color: "auto" };
  return { top: n, bottom: n, left: n, right: n, insideHorizontal: n, insideVertical: n };
}

// ShadingType.CLEAR uses `fill` for the background (SOLID uses `color`, not `fill`)
function cellBg(hex) {
  return { type: ShadingType.CLEAR, color: "auto", fill: hex };
}

// TextRun with Calibri as default font
function tr(text, opts = {}) {
  return new TextRun({ text, font: "Calibri", ...opts });
}

// Right-aligned tab stop for "Left content   →   Right content" layout
const RIGHT_TAB = [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }];

// Bullet list paragraphs
function bulletList(items = [], runOpts = {}) {
  return (items || [])
    .map(clean)
    .filter(Boolean)
    .map((text) =>
      new Paragraph({
        children: [tr(text, runOpts)],
        bullet: { level: 0 },
        spacing: { after: 60 },
      })
    );
}

async function buildAndSaveDocx(docChildren, fileName, opts = {}) {
  // pageMargin: 0 removes Word's default 1-inch margins so coloured backgrounds
  // extend edge-to-edge (like the web template). Use cell/paragraph margins instead.
  const marginVal = opts.pageMargin ?? 720; // 720 twips = 0.5 in default
  const margin = { top: marginVal, right: marginVal, bottom: marginVal, left: marginVal };
  const props = { sections: [{ properties: { page: { margin } }, children: docChildren }] };
  if (opts.background) props.background = { color: opts.background };
  const doc = new Document(props);
  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${fileName}.docx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ─── Minimal ──────────────────────────────────────────────────────────────────
// Template font-size reference (Tailwind → half-points):
//   text-4xl (name)  → 54   text-base (role) → 24   text-sm (body) → 21
//   text-xs (tags)   → 18
async function exportMinimalDocx(resumeData, fileName) {
  const personal = resumeData?.personalInfo || {};
  const labels = resumeData?.labels || {};
  const dark = "111827";
  const muted = "4B5563";
  const accent = "2563EB";
  const sep = clean(labels.separator) || "•";

  const children = [];

  // Name — text-4xl bold uppercase tracking-wide
  if (clean(personal.fullName)) {
    children.push(
      new Paragraph({
        children: [tr(clean(personal.fullName).toUpperCase(), { bold: true, size: 54, color: dark, characterSpacing: 40 })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 100 },
      })
    );
  }

  // Contact — text-sm gray
  const contactParts = [personal.email, personal.phone, personal.location].map(clean).filter(Boolean);
  if (contactParts.length) {
    children.push(
      new Paragraph({
        children: contactParts.flatMap((part, i) => [
          tr(part, { color: muted, size: 21 }),
          ...(i < contactParts.length - 1 ? [tr(`  ${sep}  `, { color: muted, size: 21 })] : []),
        ]),
        alignment: AlignmentType.CENTER,
        spacing: { after: 60 },
      })
    );
  }

  // Links — text-sm blue
  const linkParts = [personal.linkedin, personal.github].map(clean).filter(Boolean);
  if (linkParts.length) {
    children.push(
      new Paragraph({
        children: linkParts.flatMap((part, i) => [
          tr(part, { color: accent, size: 21 }),
          ...(i < linkParts.length - 1 ? [tr(`  ${sep}  `, { color: muted, size: 21 })] : []),
        ]),
        alignment: AlignmentType.CENTER,
        spacing: { after: 280 },
      })
    );
  }

  // Section heading — text-sm bold uppercase tracking-widest + border-bottom black
  const sectionHeader = (text) =>
    new Paragraph({
      children: [tr(text.toUpperCase(), { bold: true, color: dark, size: 21, characterSpacing: 120 })],
      border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: dark } },
      spacing: { before: 240, after: 140 },
    });

  // Summary
  if (clean(resumeData?.summary)) {
    children.push(
      sectionHeader(clean(labels.summary) || "Professional Summary"),
      new Paragraph({ children: [tr(clean(resumeData.summary), { color: dark, size: 21 })], spacing: { after: 80 } })
    );
  }

  // Experience
  const hasExp = (resumeData?.experience || []).some(e => clean(e?.role) || (e?.bullets || []).some(b => clean(b)));
  if (hasExp) {
    children.push(sectionHeader(clean(labels.experience) || "Experience"));
    (resumeData.experience || []).forEach((exp) => {
      if (!clean(exp?.role) && !(exp?.bullets || []).some(b => clean(b))) return;
      children.push(
        // Role (text-base bold) + Duration (text-sm muted) — right-aligned
        new Paragraph({
          tabStops: RIGHT_TAB,
          children: [tr(clean(exp.role), { bold: true, color: dark, size: 24 }), tr("\t"), tr(clean(exp.duration), { color: muted, size: 21 })],
          spacing: { after: 40 },
        }),
        // Company (text-sm italic) + Location (text-sm) — right-aligned
        new Paragraph({
          tabStops: RIGHT_TAB,
          children: [tr(clean(exp.company), { italics: true, color: dark, size: 21 }), tr("\t"), tr(clean(exp.location), { color: muted, size: 21 })],
          spacing: { after: 100 },
        }),
        ...bulletList(exp.bullets, { color: dark, size: 21 }),
        new Paragraph({ children: [], spacing: { after: 200 } })
      );
    });
  }

  // Education
  const hasEdu = (resumeData?.education || []).some(e => clean(e?.degree) || clean(e?.institution));
  if (hasEdu) {
    children.push(sectionHeader(clean(labels.education) || "Education"));
    (resumeData.education || []).forEach((edu) => {
      if (!clean(edu?.degree) && !clean(edu?.institution)) return;
      const degreeText = [clean(edu.degree), clean(labels.in) || "in", clean(edu.field)].filter(Boolean).join(" ");
      children.push(
        new Paragraph({
          tabStops: RIGHT_TAB,
          children: [tr(degreeText, { bold: true, color: dark, size: 24 }), tr("\t"), tr(clean(edu.duration), { color: muted, size: 21 })],
          spacing: { after: 40 },
        }),
        new Paragraph({
          tabStops: RIGHT_TAB,
          children: [
            tr(clean(edu.institution), { italics: true, color: dark, size: 21 }),
            tr("\t"),
            ...(clean(edu.cgpa) ? [tr(`${clean(labels.gpa) || "GPA:"} ${clean(edu.cgpa)}`, { color: muted, size: 21 })] : []),
          ],
          spacing: { after: 200 },
        })
      );
    });
  }

  // Skills
  const techSkills = (resumeData?.skills?.technical || []).filter(clean);
  const softSkills = (resumeData?.skills?.soft || []).filter(clean);
  if (techSkills.length || softSkills.length) {
    children.push(sectionHeader(clean(labels.skills) || "Skills"));
    if (techSkills.length) {
      children.push(
        new Paragraph({
          children: [tr(`${clean(labels.technical) || "Technical:"}  `, { bold: true, color: dark, size: 21 }), tr(techSkills.join("  •  "), { color: dark, size: 21 })],
          spacing: { after: 100 },
        })
      );
    }
    if (softSkills.length) {
      children.push(
        new Paragraph({
          children: [tr(`${clean(labels.soft) || "Soft:"}  `, { bold: true, color: dark, size: 21 }), tr(softSkills.join("  •  "), { color: dark, size: 21 })],
          spacing: { after: 100 },
        })
      );
    }
  }

  // Projects
  const hasProj = (resumeData?.projects || []).some(p => clean(p?.name) || (p?.bullets || []).some(b => clean(b)));
  if (hasProj) {
    children.push(sectionHeader(clean(labels.projects) || "Projects"));
    (resumeData.projects || []).forEach((proj) => {
      if (!clean(proj?.name) && !(proj?.bullets || []).some(b => clean(b))) return;
      const stack = (Array.isArray(proj.techStack) ? proj.techStack : []).filter(clean).join(" • ");
      children.push(
        new Paragraph({
          children: [
            tr(clean(proj.name), { bold: true, color: dark, size: 24 }),
            ...(clean(proj.link) ? [tr(`  |  ${clean(proj.link)}`, { color: accent, size: 21 })] : []),
          ],
          spacing: { after: 40 },
        }),
        ...(stack ? [new Paragraph({ children: [tr(stack, { color: muted, size: 18 })], spacing: { after: 80 } })] : []),
        ...bulletList(proj.bullets, { color: dark, size: 21 }),
        new Paragraph({ children: [], spacing: { after: 200 } })
      );
    });
  }

  // Minimal template has p-8/p-12 internal padding — use 680 twips (≈ 0.47 in) page margin
  await buildAndSaveDocx(children, fileName, { pageMargin: 680 });
}

// ─── Modern ───────────────────────────────────────────────────────────────────
// Sidebar: text-sm body (21), name text-3xl (45), section headers text-sm bold (21)
// Right:   role text-lg (27), section headers text-xl bold (30), body text-sm (21)
async function exportModernDocx(resumeData, fileName) {
  const personal = resumeData?.personalInfo || {};
  const labels = resumeData?.labels || {};
  const sidebarBg = "2d3740";
  const mainBg = "1c252e";
  const white = "FFFFFF";
  const slate300 = "CBD5E1";
  const slate400 = "94A3B8";
  const blue = "3B82F6";

  const leftCol = [];

  // Name — text-3xl bold tracking-tight
  leftCol.push(
    new Paragraph({
      children: [tr(clean(personal.fullName), { bold: true, color: white, size: 45 })],
      border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: blue } },
      spacing: { after: 200 },
    })
  );

  // Contact — text-sm slate-300
  [
    { icon: "✉", val: personal.email },
    { icon: "☎", val: personal.phone },
    { icon: "⚲", val: personal.location },
  ].filter(x => clean(x.val)).forEach(({ icon, val }) => {
    leftCol.push(
      new Paragraph({
        children: [tr(`${icon}  `, { color: blue, size: 21 }), tr(clean(val), { color: slate300, size: 21 })],
        spacing: { after: 60 },
      })
    );
  });
  if (clean(personal.linkedin)) {
    leftCol.push(new Paragraph({
      children: [tr(`${clean(labels.linkedin) || "LinkedIn:"}  `, { color: slate400, size: 21 }), tr(clean(personal.linkedin), { color: blue, size: 21 })],
      spacing: { after: 40 },
    }));
  }
  if (clean(personal.github)) {
    leftCol.push(new Paragraph({
      children: [tr(`${clean(labels.github) || "GitHub:"}  `, { color: slate400, size: 21 }), tr(clean(personal.github), { color: blue, size: 21 })],
      spacing: { after: 180 },
    }));
  }

  // Left section headers — text-sm bold uppercase tracking-widest blue
  const leftHeader = (text) =>
    new Paragraph({
      children: [tr(text.toUpperCase(), { bold: true, color: blue, size: 21, characterSpacing: 120 })],
      spacing: { before: 220, after: 120 },
    });

  // Summary
  if (clean(resumeData?.summary)) {
    leftCol.push(
      leftHeader(clean(labels.summary) || "Summary"),
      new Paragraph({ children: [tr(clean(resumeData.summary), { color: slate300, size: 21 })], spacing: { after: 100 } })
    );
  }

  // Skills — text-sm per skill; label text-sm bold white
  const techSkills = (resumeData?.skills?.technical || []).filter(clean);
  const softSkills = (resumeData?.skills?.soft || []).filter(clean);
  if (techSkills.length || softSkills.length) {
    leftCol.push(leftHeader(clean(labels.skills) || "Skills"));
    if (techSkills.length) {
      leftCol.push(new Paragraph({ children: [tr(clean(labels.technical) || "Technical", { bold: true, color: white, size: 21 })], spacing: { after: 80 } }));
      techSkills.forEach(s => leftCol.push(new Paragraph({ children: [tr(s, { color: slate300, size: 21 })], spacing: { after: 60 } })));
    }
    if (softSkills.length) {
      leftCol.push(new Paragraph({ children: [tr(clean(labels.soft) || "Interpersonal", { bold: true, color: white, size: 21 })], spacing: { before: 120, after: 80 } }));
      softSkills.forEach(s => leftCol.push(new Paragraph({ children: [tr(s, { color: slate300, size: 21 })], spacing: { after: 60 } })));
    }
  }

  // Education (left sidebar) — degree text-sm bold, institution text-sm blue-300, duration text-xs
  const hasEdu = (resumeData?.education || []).some(e => clean(e?.degree) || clean(e?.institution));
  if (hasEdu) {
    leftCol.push(leftHeader(clean(labels.education) || "Education"));
    (resumeData.education || []).forEach((edu) => {
      if (!clean(edu?.degree) && !clean(edu?.institution)) return;
      const deg = [clean(edu.degree), clean(labels.in) || "in", clean(edu.field)].filter(Boolean).join(" ");
      leftCol.push(
        new Paragraph({ children: [tr(deg, { bold: true, color: white, size: 21 })], spacing: { after: 40 } }),
        new Paragraph({ children: [tr(clean(edu.institution), { bold: true, color: blue, size: 21 })], spacing: { after: 40 } }),
        new Paragraph({ children: [tr(clean(edu.duration), { color: slate400, size: 18 })], spacing: { after: 60 } }),
        ...(clean(edu.cgpa) ? [new Paragraph({ children: [tr(`${clean(labels.gpa) || "GPA:"} ${clean(edu.cgpa)}`, { bold: true, color: white, size: 18 })], spacing: { after: 120 } })] : [])
      );
    });
  }

  const rightCol = [];

  // Right section headers — text-xl bold uppercase tracking-wider white + border-bottom slate-700
  const rightHeader = (text) =>
    new Paragraph({
      children: [tr("◆  ", { color: blue, size: 30 }), tr(text.toUpperCase(), { bold: true, color: white, size: 30, characterSpacing: 60 })],
      border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: "334155" } },
      spacing: { after: 280 },
    });

  // Experience
  const hasExp = (resumeData?.experience || []).some(e => clean(e?.role) || (e?.bullets || []).some(b => clean(b)));
  if (hasExp) {
    rightCol.push(rightHeader(clean(labels.experience) || "Experience"));
    (resumeData.experience || []).forEach((exp) => {
      if (!clean(exp?.role) && !(exp?.bullets || []).some(b => clean(b))) return;
      rightCol.push(
        // Role text-lg bold + Duration text-xs blue right-aligned
        new Paragraph({
          tabStops: RIGHT_TAB,
          children: [tr(clean(exp.role), { bold: true, color: white, size: 27 }), tr("\t"), tr(clean(exp.duration), { color: blue, size: 18 })],
          spacing: { after: 60 },
        }),
        // Company text-sm + Location text-sm right
        new Paragraph({
          children: [tr(clean(exp.company), { color: "E2E8F0", size: 21 }), ...(clean(exp.location) ? [tr(`  •  ${clean(exp.location)}`, { color: slate400, size: 21 })] : [])],
          spacing: { after: 120 },
        }),
        ...bulletList(exp.bullets, { color: slate300, size: 21 }),
        new Paragraph({ children: [], spacing: { after: 260 } })
      );
    });
  }

  // Projects
  const hasProj = (resumeData?.projects || []).some(p => clean(p?.name) || (p?.bullets || []).some(b => clean(b)));
  if (hasProj) {
    rightCol.push(rightHeader(clean(labels.projects) || "Projects"));
    (resumeData.projects || []).forEach((proj) => {
      if (!clean(proj?.name) && !(proj?.bullets || []).some(b => clean(b))) return;
      const stack = (Array.isArray(proj.techStack) ? proj.techStack : []).filter(clean).join(" • ");
      rightCol.push(
        new Paragraph({ children: [tr(clean(proj.name), { bold: true, color: white, size: 27 })], spacing: { after: 40 } }),
        ...(stack ? [new Paragraph({ children: [tr(stack, { color: blue, size: 18 })], spacing: { after: 80 } })] : []),
        ...bulletList(proj.bullets, { color: slate300, size: 21 }),
        new Paragraph({ children: [], spacing: { after: 240 } })
      );
    });
  }

  await buildAndSaveDocx([
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: noTableBorders(),
      rows: [new TableRow({ children: [
        new TableCell({
          width: { size: 35, type: WidthType.PERCENTAGE },
          shading: cellBg(sidebarBg),
          borders: noBorders(),
          margins: { top: 480, bottom: 480, left: 480, right: 480 },
          children: leftCol.length ? leftCol : [new Paragraph({ children: [] })],
        }),
        new TableCell({
          width: { size: 65, type: WidthType.PERCENTAGE },
          shading: cellBg(mainBg),
          borders: noBorders(),
          margins: { top: 560, bottom: 560, left: 560, right: 560 },
          children: rightCol.length ? rightCol : [new Paragraph({ children: [] })],
        }),
      ]})],
    }),
  ], fileName, { background: mainBg, pageMargin: 0 });
}

// ─── Professional ─────────────────────────────────────────────────────────────
// Sidebar: name text-2xl (36), body text-sm (21), skills text-xs (18)
// Right:   headers text-lg bold (27), role text-sm bold (21), bullets text-xs (18)
async function exportProfessionalDocx(resumeData, fileName) {
  const personal = resumeData?.personalInfo || {};
  const labels = resumeData?.labels || {};
  const sidebarHex = (resumeData?.theme?.sidebarColor || "#2B3A5A").replace("#", "");
  const white = "FFFFFF";
  const gray200 = "E5E7EB";
  const gray700 = "374151";
  const gray600 = "4B5563";
  const gray500 = "6B7280";
  const accent = "2563EB";

  const leftCol = [];

  // Name — text-2xl bold uppercase tracking-wider
  leftCol.push(
    new Paragraph({
      children: [tr(clean(personal.fullName).toUpperCase(), { bold: true, color: white, size: 36, characterSpacing: 60 })],
      spacing: { after: 220 },
    })
  );

  // Contact — text-sm gray-200
  [
    { icon: "✉", val: personal.email },
    { icon: "☎", val: personal.phone },
    { icon: "⚲", val: personal.location },
  ].filter(x => clean(x.val)).forEach(({ icon, val }) => {
    leftCol.push(
      new Paragraph({
        children: [tr(`${icon}  ${clean(val)}`, { color: gray200, size: 21 })],
        spacing: { after: 60 },
      })
    );
  });
  if (clean(personal.linkedin)) {
    leftCol.push(new Paragraph({
      children: [tr(`${clean(labels.linkedin) || "LinkedIn:"}  `, { color: gray200, size: 21 }), tr(clean(personal.linkedin), { color: white, size: 21 })],
      spacing: { after: 40 },
    }));
  }
  if (clean(personal.github)) {
    leftCol.push(new Paragraph({
      children: [tr(`${clean(labels.github) || "GitHub:"}  `, { color: gray200, size: 21 }), tr(clean(personal.github), { color: white, size: 21 })],
      spacing: { after: 180 },
    }));
  }

  // Left headers — text-sm bold uppercase tracking-wider + border-bottom gray-400
  const leftHeader = (text) =>
    new Paragraph({
      children: [tr(text.toUpperCase(), { bold: true, color: white, size: 21, characterSpacing: 60 })],
      border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: gray200 } },
      spacing: { before: 220, after: 140 },
    });

  // Summary
  if (clean(resumeData?.summary)) {
    leftCol.push(
      leftHeader(clean(labels.summary) || "Summary"),
      new Paragraph({ children: [tr(clean(resumeData.summary), { color: gray200, size: 21 })], spacing: { after: 100 } })
    );
  }

  // Skills — text-xs items
  const techSkills = (resumeData?.skills?.technical || []).filter(clean);
  const softSkills = (resumeData?.skills?.soft || []).filter(clean);
  if (techSkills.length || softSkills.length) {
    leftCol.push(leftHeader(clean(labels.skills) || "Key Skills"));
    if (techSkills.length) {
      leftCol.push(new Paragraph({ children: [tr("Technical", { bold: true, color: white, size: 18 })], spacing: { after: 60 } }));
      techSkills.forEach(s => leftCol.push(
        new Paragraph({ children: [tr(s, { color: gray200, size: 18 })], bullet: { level: 0 }, spacing: { after: 40 } })
      ));
    }
    if (softSkills.length) {
      leftCol.push(new Paragraph({ children: [tr("Interpersonal", { bold: true, color: white, size: 18 })], spacing: { before: 100, after: 60 } }));
      softSkills.forEach(s => leftCol.push(
        new Paragraph({ children: [tr(s, { color: gray200, size: 18 })], bullet: { level: 0 }, spacing: { after: 40 } })
      ));
    }
  }

  const rightCol = [];

  // Right headers — text-lg bold + border-b-2 gray-900
  const rightHeader = (text) =>
    new Paragraph({
      children: [tr(text.toUpperCase(), { bold: true, color: gray700, size: 27, characterSpacing: 40 })],
      border: { bottom: { style: BorderStyle.THICK, size: 12, color: gray700 } },
      spacing: { after: 220 },
    });

  // Experience
  const hasExp = (resumeData?.experience || []).some(e => clean(e?.role) || (e?.bullets || []).some(b => clean(b)));
  if (hasExp) {
    rightCol.push(rightHeader(clean(labels.experience) || "EXPERIENCE"));
    (resumeData.experience || []).forEach((exp) => {
      if (!clean(exp?.role) && !(exp?.bullets || []).some(b => clean(b))) return;
      rightCol.push(
        // Role text-sm bold uppercase + Duration text-xs bold right
        new Paragraph({
          tabStops: RIGHT_TAB,
          children: [tr(clean(exp.role).toUpperCase(), { bold: true, color: gray700, size: 21 }), tr("\t"), tr(clean(exp.duration), { bold: true, color: gray600, size: 18 })],
          spacing: { after: 40 },
        }),
        // Company text-sm italic + Location text-sm right
        new Paragraph({
          tabStops: RIGHT_TAB,
          children: [tr(clean(exp.company), { italics: true, color: gray700, size: 21 }), tr("\t"), tr(clean(exp.location), { color: gray500, size: 21 })],
          spacing: { after: 100 },
        }),
        ...bulletList(exp.bullets, { color: gray700, size: 18 }),
        new Paragraph({ children: [], spacing: { after: 220 } })
      );
    });
  }

  // Education
  const hasEdu = (resumeData?.education || []).some(e => clean(e?.degree) || clean(e?.institution));
  if (hasEdu) {
    rightCol.push(rightHeader(clean(labels.education) || "EDUCATION"));
    (resumeData.education || []).forEach((edu) => {
      if (!clean(edu?.degree) && !clean(edu?.institution)) return;
      const deg = [clean(edu.degree), clean(labels.in) || "in", clean(edu.field)].filter(Boolean).join(" ");
      rightCol.push(
        new Paragraph({
          tabStops: RIGHT_TAB,
          children: [tr(deg, { bold: true, color: gray700, size: 21 }), tr("\t"), tr(clean(edu.duration), { bold: true, color: gray600, size: 18 })],
          spacing: { after: 40 },
        }),
        new Paragraph({
          tabStops: RIGHT_TAB,
          children: [
            tr(clean(edu.institution), { italics: true, color: gray700, size: 21 }),
            tr("\t"),
            ...(clean(edu.cgpa) ? [tr(`${clean(labels.gpa) || "GPA:"} ${clean(edu.cgpa)}`, { bold: true, color: gray600, size: 18 })] : []),
          ],
          spacing: { after: 220 },
        })
      );
    });
  }

  // Projects
  const hasProj = (resumeData?.projects || []).some(p => clean(p?.name) || (p?.bullets || []).some(b => clean(b)));
  if (hasProj) {
    rightCol.push(rightHeader(clean(labels.projects) || "PROJECTS"));
    (resumeData.projects || []).forEach((proj) => {
      if (!clean(proj?.name) && !(proj?.bullets || []).some(b => clean(b))) return;
      const stack = (Array.isArray(proj.techStack) ? proj.techStack : []).filter(clean).join(" • ");
      rightCol.push(
        new Paragraph({
          children: [
            tr(clean(proj.name), { bold: true, color: gray700, size: 21 }),
            ...(clean(proj.link) ? [tr(`  |  ${clean(proj.link)}`, { color: accent, size: 18 })] : []),
          ],
          spacing: { after: 40 },
        }),
        ...(stack ? [new Paragraph({ children: [tr(stack, { color: gray500, size: 18 })], spacing: { after: 80 } })] : []),
        ...bulletList(proj.bullets, { color: gray700, size: 18 }),
        new Paragraph({ children: [], spacing: { after: 200 } })
      );
    });
  }

  await buildAndSaveDocx([
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: noTableBorders(),
      rows: [new TableRow({ children: [
        new TableCell({
          width: { size: 30, type: WidthType.PERCENTAGE },
          shading: cellBg(sidebarHex),
          borders: noBorders(),
          margins: { top: 480, bottom: 480, left: 480, right: 480 },
          children: leftCol.length ? leftCol : [new Paragraph({ children: [] })],
        }),
        new TableCell({
          width: { size: 70, type: WidthType.PERCENTAGE },
          borders: noBorders(),
          margins: { top: 480, bottom: 480, left: 480, right: 480 },
          children: rightCol.length ? rightCol : [new Paragraph({ children: [] })],
        }),
      ]})],
    }),
  ], fileName, { pageMargin: 0 });
}

// ─── Creative ─────────────────────────────────────────────────────────────────
// Name text-[4rem] (96), section headers text-2xl (36), role text-lg (27)
// Contact labels text-[10px] (15), contact values text-sm (21)
// Experience bullets text-[13px] (20), project bullets text-[13px] uppercase (20)
async function exportCreativeDocx(resumeData, fileName) {
  const personal = resumeData?.personalInfo || {};
  const labels = resumeData?.labels || {};
  const accent = "D32F2F";
  const dark = "121212";
  const muted = "555555";

  // Contact cells
  const contactCells = [
    { k: labels.phone || "PHONE", v: personal.phone },
    { k: labels.email || "EMAIL", v: personal.email },
    { k: labels.linkedin || "LINKEDIN", v: personal.linkedin },
    { k: labels.github || "WEBSITE", v: personal.github },
  ].filter(x => clean(x.v));

  // Projects → left column of bottom grid
  const leftCol = [];
  (resumeData?.projects || []).forEach((proj) => {
    if (!clean(proj?.name) && !(proj?.bullets || []).some(b => clean(b))) return;
    // Project name — text-base font-black uppercase tracking-wider
    leftCol.push(new Paragraph({ children: [tr(clean(proj.name) || "PROJECT", { bold: true, allCaps: true, color: dark, size: 24, characterSpacing: 60 })], spacing: { after: 60 } }));
    const stack = (Array.isArray(proj.techStack) ? proj.techStack : []).filter(clean);
    if (stack.length) {
      // Tech stack — text-[11px] bold uppercase tracking-widest accent
      leftCol.push(new Paragraph({ children: [tr(stack.join(" // "), { bold: true, allCaps: true, color: accent, size: 17, characterSpacing: 120 })], spacing: { after: 100 } }));
    }
    // Bullets — text-[13px] font-semibold uppercase muted
    leftCol.push(...(proj?.bullets || []).map(clean).filter(Boolean).map(t =>
      new Paragraph({ children: [tr(t, { color: muted, size: 20, allCaps: true })], bullet: { level: 0 }, spacing: { after: 60 } })
    ));
    leftCol.push(new Paragraph({ children: [], spacing: { after: 200 } }));
  });

  // Skills (technical dark, soft red) + Education → right column
  const rightCol = [];
  (resumeData?.skills?.technical || []).filter(clean).forEach(s =>
    rightCol.push(new Paragraph({ children: [tr(s, { bold: true, allCaps: true, color: dark, size: 21, characterSpacing: 120 })], spacing: { after: 80 } }))
  );
  (resumeData?.skills?.soft || []).filter(clean).forEach(s =>
    rightCol.push(new Paragraph({ children: [tr(s, { bold: true, allCaps: true, color: accent, size: 21, characterSpacing: 120 })], spacing: { after: 80 } }))
  );
  (resumeData?.education || []).forEach((edu) => {
    if (!clean(edu?.degree) && !clean(edu?.institution)) return;
    // Education degree — text-[15px] font-black uppercase tracking-wider
    rightCol.push(
      new Paragraph({ children: [tr(`${clean(edu.degree)} ${clean(labels.in) || "IN"} ${clean(edu.field)}`.trim(), { bold: true, allCaps: true, color: dark, size: 23, characterSpacing: 60 })], spacing: { before: 140, after: 60 } }),
      // Institution — text-sm bold accent
      new Paragraph({ children: [tr(clean(edu.institution), { bold: true, color: accent, size: 21 })], spacing: { after: 40 } }),
      // Duration — text-xs bold muted
      new Paragraph({ children: [tr(clean(edu.duration), { bold: true, color: muted, size: 18 })], spacing: { after: 60 } })
    );
  });

  const children = [
    // Name — text-[4rem] font-black red uppercase tracking-tighter
    new Paragraph({
      children: [tr(clean(personal.fullName) || "YOUR NAME", { bold: true, allCaps: true, size: 96, color: accent, characterSpacing: -20 })],
      spacing: { after: 120 },
    }),
    // Title — text-base font-black dark uppercase tracking-[0.2em] right-aligned
    ...(clean(personal.title) ? [
      new Paragraph({
        alignment: AlignmentType.RIGHT,
        children: [tr(clean(personal.title), { bold: true, allCaps: true, color: dark, size: 24, characterSpacing: 80 })],
        spacing: { after: 260 },
      }),
    ] : [new Paragraph({ children: [], spacing: { after: 180 } })]),
  ];

  // Contact grid — labels text-[10px] bold uppercase tracking-[0.2em], values text-sm bold
  if (contactCells.length) {
    children.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: noTableBorders(),
        rows: [new TableRow({
          children: contactCells.map(c =>
            new TableCell({
              borders: noBorders(),
              children: [
                new Paragraph({ children: [tr(c.k, { bold: true, allCaps: true, size: 15, color: dark, characterSpacing: 80 })], spacing: { after: 40 } }),
                new Paragraph({ children: [tr(clean(c.v), { bold: true, size: 21, color: muted })] }),
              ],
            })
          ),
        })],
      }),
      new Paragraph({ children: [], spacing: { after: 200 } })
    );
  }

  // Profile/Summary — header text-2xl font-black uppercase tracking-[0.15em] accent
  if (clean(resumeData?.summary)) {
    children.push(
      new Paragraph({ children: [tr(clean(labels.summary) || "PROFILE", { bold: true, allCaps: true, color: accent, size: 36, characterSpacing: 60 })], spacing: { after: 80 } }),
      new Paragraph({ children: [tr(clean(resumeData.summary), { color: dark, size: 21 })], spacing: { after: 260 } })
    );
  }

  // Experience section — header text-2xl font-black uppercase accent
  if ((resumeData?.experience || []).some(e => clean(e?.role) || (e?.bullets || []).some(b => clean(b)))) {
    children.push(
      new Paragraph({ children: [tr(clean(labels.experience) || "EXPERIENCE", { bold: true, allCaps: true, color: accent, size: 36, characterSpacing: 60 })], spacing: { after: 160 } })
    );
    (resumeData.experience || []).forEach((exp) => {
      if (!clean(exp?.role) && !(exp?.bullets || []).some(b => clean(b))) return;
      children.push(
        // Role — text-lg font-black uppercase dark
        new Paragraph({ children: [tr(clean(exp.role), { bold: true, allCaps: true, color: dark, size: 27 })], spacing: { after: 40 } }),
        // Company — text-sm bold uppercase accent
        new Paragraph({ children: [tr(clean(exp.company), { bold: true, allCaps: true, color: accent, size: 21 })], spacing: { after: 40 } }),
        // Duration — text-[11px] bold uppercase muted tracking-widest
        new Paragraph({ children: [tr(clean(exp.duration), { bold: true, allCaps: true, color: muted, size: 17, characterSpacing: 120 })], spacing: { after: 100 } }),
        // Bullets — text-[13px] font-semibold dark
        ...(exp.bullets || []).map(clean).filter(Boolean).map(t =>
          new Paragraph({ children: [tr(t, { color: dark, size: 20 })], bullet: { level: 0 }, spacing: { after: 60 } })
        ),
        new Paragraph({ children: [], spacing: { after: 200 } })
      );
    });
  }

  // Bottom two-column grid: Projects left / Skills+Education right
  if (leftCol.length || rightCol.length) {
    children.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: noTableBorders(),
        rows: [new TableRow({
          children: [
            new TableCell({
              width: { size: 50, type: WidthType.PERCENTAGE },
              borders: noBorders(),
              children: [
                new Paragraph({ children: [tr(clean(labels.projects) || "PROJECTS", { bold: true, allCaps: true, color: accent, size: 36, characterSpacing: 60 })], spacing: { after: 120 } }),
                ...(leftCol.length ? leftCol : [new Paragraph({ children: [] })]),
              ],
            }),
            new TableCell({
              width: { size: 50, type: WidthType.PERCENTAGE },
              borders: noBorders(),
              children: [
                new Paragraph({ children: [tr(clean(labels.skills) || "SKILLS", { bold: true, allCaps: true, color: accent, size: 36, characterSpacing: 60 })], spacing: { after: 120 } }),
                ...(rightCol.length ? rightCol : [new Paragraph({ children: [] })]),
              ],
            }),
          ],
        })],
      })
    );
  }

  // Wrap all content in a padded cell so the cream background fills edge-to-edge
  // (p-12 = 48px ≈ 720 twips). pageMargin: 0 removes Word's default white gutters.
  await buildAndSaveDocx([
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: noTableBorders(),
      rows: [new TableRow({ children: [
        new TableCell({
          borders: noBorders(),
          shading: cellBg("EAEBE5"),
          margins: { top: 720, bottom: 720, left: 960, right: 960 },
          children,
        }),
      ]})],
    }),
  ], fileName, { background: "EAEBE5", pageMargin: 0 });
}

// ─── Main export ──────────────────────────────────────────────────────────────
export async function exportDOCX({ fileName, templateId, resumeData }) {
  if (!resumeData) throw new Error("Resume data is not available for export.");

  if (templateId === "creative") return exportCreativeDocx(resumeData, fileName);
  if (templateId === "modern") return exportModernDocx(resumeData, fileName);
  if (templateId === "professional") return exportProfessionalDocx(resumeData, fileName);
  return exportMinimalDocx(resumeData, fileName);
}
