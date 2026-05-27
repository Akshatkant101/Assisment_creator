"use client";

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";

interface Option   { label: string; text: string; }
interface Question { _id: string; text: string; type: string; difficulty: string; marks: number; order: number; options: Option[]; correctAnswer?: string; }
interface Section  { _id: string; name: string; instructions: string; order: number; questions: Question[]; }
interface AssignmentData {
  title: string;
  subject?: string;
  gradeLevel?: string;
  dueDate: string;
  assignedDate: string;
  totalMarks: number;
  numberOfQuestions: number;
  sections: Section[];
}

const s = StyleSheet.create({
  page:          { fontFamily: "Helvetica", fontSize: 11, paddingHorizontal: 40, paddingVertical: 40, color: "#000" },
  center:        { textAlign: "center" },
  schoolName:    { fontSize: 14, fontFamily: "Helvetica-Bold", marginBottom: 4 },
  subjectLine:   { fontSize: 11, fontFamily: "Helvetica-Bold", marginBottom: 2 },
  metaRow:       { flexDirection: "row", justifyContent: "space-between", marginTop: 12, marginBottom: 8 },
  metaText:      { fontSize: 10, fontFamily: "Helvetica-Bold" },
  instruction:   { fontSize: 10, fontFamily: "Helvetica-Bold", marginBottom: 16 },
  fieldRow:      { flexDirection: "row", alignItems: "flex-end", marginBottom: 6 },
  fieldLabel:    { fontSize: 10, fontFamily: "Helvetica-Bold" },
  fieldLine:     { flex: 1, borderBottomWidth: 1, borderBottomColor: "#000", marginLeft: 4, height: 14 },
  divider:       { borderBottomWidth: 1, borderBottomColor: "#ccc", marginVertical: 12 },
  sectionTitle:  { fontSize: 12, fontFamily: "Helvetica-Bold", textAlign: "center", marginBottom: 8 },
  sectionSub:    { fontSize: 10, fontFamily: "Helvetica-Bold", marginBottom: 4 },
  sectionNote:   { fontSize: 9, fontFamily: "Helvetica-Oblique", color: "#555", marginBottom: 10 },
  qRow:          { flexDirection: "row", marginBottom: 10 },
  qNum:          { fontSize: 10, fontFamily: "Helvetica-Bold", width: 22, flexShrink: 0 },
  qBody:         { flex: 1 },
  qText:         { fontSize: 10, lineHeight: 1.5 },
  qMeta:         { flexDirection: "row", justifyContent: "flex-end", gap: 6, marginTop: 2 },
  diffBadge:     { fontSize: 8, paddingHorizontal: 5, paddingVertical: 1, borderRadius: 4 },
  marksText:     { fontSize: 8, color: "#888" },
  optionsGrid:   { flexDirection: "row", flexWrap: "wrap", marginTop: 4, gap: 4 },
  optionItem:    { flexDirection: "row", width: "48%", fontSize: 9, gap: 3 },
  optLabel:      { fontFamily: "Helvetica-Bold", color: "#888" },
  answerBox:     { marginTop: 4, backgroundColor: "#f0fdf4", borderWidth: 1, borderColor: "#bbf7d0", borderRadius: 4, padding: 5 },
  answerText:    { fontSize: 9, fontFamily: "Helvetica-Bold", color: "#15803d" },
  answerSub:     { fontSize: 9, color: "#16a34a" },
  subjective:    { fontSize: 9, fontFamily: "Helvetica-Oblique", color: "#4ade80" },
});

const DIFF_COLOR: Record<string, string> = {
  Easy: "#dcfce7", Moderate: "#fef3c7", Hard: "#fee2e2",
};
const DIFF_TEXT: Record<string, string> = {
  Easy: "#15803d", Moderate: "#b45309", Hard: "#dc2626",
};

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });
}

export function AssignmentPDFDocument({ data, view }: { data: AssignmentData; view: "paper" | "answers" }) {
  const totalTime = Math.max(30, data.numberOfQuestions * 3);

  return (
    <Document>
      <Page size="A4" style={s.page}>

        {/* School header */}
        <View style={s.center}>
          <Text style={s.schoolName}>Delhi Public School, Sector-4, Bokaro</Text>
          <Text style={s.subjectLine}>Subject: {data.subject || "General"}</Text>
          <Text style={s.subjectLine}>Class: {data.gradeLevel || "General"}</Text>
        </View>

        <View style={s.metaRow}>
          <Text style={s.metaText}>Time Allowed: {totalTime} minutes</Text>
          <Text style={s.metaText}>Maximum Marks: {data.totalMarks}</Text>
        </View>

        <Text style={s.instruction}>All questions are compulsory unless stated otherwise.</Text>

        {/* Name / Roll fields — paper mode only */}
        {view === "paper" && (
          <View style={{ marginBottom: 16 }}>
            <View style={s.fieldRow}><Text style={s.fieldLabel}>Name: </Text><View style={s.fieldLine} /></View>
            <View style={s.fieldRow}><Text style={s.fieldLabel}>Roll Number: </Text><View style={s.fieldLine} /></View>
            <View style={s.fieldRow}><Text style={s.fieldLabel}>Class: {data.gradeLevel || ""} &nbsp; Section: </Text><View style={s.fieldLine} /></View>
          </View>
        )}

        <View style={s.divider} />

        {/* Sections */}
        {data.sections.map((section) => (
          <View key={section._id} style={{ marginBottom: 16 }}>
            <Text style={s.sectionTitle}>{section.name}</Text>
            <Text style={s.sectionSub}>{section.questions[0]?.type || "Questions"}</Text>
            {section.instructions ? <Text style={s.sectionNote}>{section.instructions}</Text> : null}

            {section.questions.map((q, qi) => (
              <View key={q._id} style={s.qRow}>
                <Text style={s.qNum}>{qi + 1}.</Text>
                <View style={s.qBody}>
                  {/* Question text + meta on same line via nested row */}
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <Text style={[s.qText, { flex: 1, marginRight: 8 }]}>{q.text}</Text>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 4, flexShrink: 0 }}>
                      <Text style={[s.diffBadge, { backgroundColor: DIFF_COLOR[q.difficulty] || "#f3f4f6", color: DIFF_TEXT[q.difficulty] || "#374151" }]}>
                        {q.difficulty}
                      </Text>
                      <Text style={s.marksText}>[{q.marks}m]</Text>
                    </View>
                  </View>

                  {/* Options — paper mode */}
                  {q.options.length > 0 && view === "paper" && (
                    <View style={s.optionsGrid}>
                      {q.options.map((opt) => (
                        <View key={opt.label} style={s.optionItem}>
                          <Text style={s.optLabel}>{opt.label}.</Text>
                          <Text style={{ fontSize: 9, flex: 1 }}>{opt.text}</Text>
                        </View>
                      ))}
                    </View>
                  )}

                  {/* Answer key */}
                  {view === "answers" && (
                    <View style={s.answerBox}>
                      {q.options.length > 0 ? (
                        <Text style={s.answerText}>
                          Answer: {q.correctAnswer}
                          {q.options.find((o) => o.label === q.correctAnswer)
                            ? ` — ${q.options.find((o) => o.label === q.correctAnswer)?.text}`
                            : ""}
                        </Text>
                      ) : q.correctAnswer ? (
                        <Text style={s.answerText}>{q.correctAnswer}</Text>
                      ) : (
                        <Text style={s.subjective}>Subjective — see marking scheme</Text>
                      )}
                    </View>
                  )}
                </View>
              </View>
            ))}
          </View>
        ))}

      </Page>
    </Document>
  );
}
