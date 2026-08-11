import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  BorderStyle,
} from 'docx';
import { saveAs } from 'file-saver';

interface StudentData {
  rollNo: string;
  name: string;
}

interface EventData {
  companyName: string;
  eventType: string;
  date: string;
  startTime: string;
  endTime: string;
  students: StudentData[];
}

function getOrdinalSuffix(day: number): string {
  if (day > 3 && day < 21) return 'th';
  switch (day % 10) {
    case 1:
      return 'st';
    case 2:
      return 'nd';
    case 3:
      return 'rd';
    default:
      return 'th';
  }
}

function formatDateForDOCX(dateStr: string): string {
  const date = new Date(dateStr);
  const day = date.getDate();
  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  return `${day}${getOrdinalSuffix(day)} ${month} ${year}`;
}

export async function generateODDocx(event: EventData) {
  const formattedDate = formatDateForDOCX(event.date);
  const studentCount = event.students.length;

  const noBorders = {
    top: { style: BorderStyle.NONE, size: 0, color: 'auto' },
    bottom: { style: BorderStyle.NONE, size: 0, color: 'auto' },
    left: { style: BorderStyle.NONE, size: 0, color: 'auto' },
    right: { style: BorderStyle.NONE, size: 0, color: 'auto' },
    insideHorizontal: { style: BorderStyle.NONE, size: 0, color: 'auto' },
    insideVertical: { style: BorderStyle.NONE, size: 0, color: 'auto' },
  };

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1641, // ~1.14in in twips
              bottom: 1134, // ~20mm to minimize blank space at bottom
              left: 1411, // ~0.98in
              right: 1134, // ~20mm to prevent text wrap on the right column
            },
          },
        },
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: 'Placement and Training PSG College of Technology',
                bold: true,
                size: 24, // 12pt (half-points)
                font: 'Arial',
              }),
            ],
            spacing: { after: 400 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: 'To,', bold: true, size: 24, font: 'Arial' }),
            ],
            spacing: { after: 120 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: 'The Principal,', size: 24, font: 'Arial' }),
            ],
            spacing: { after: 120 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'PSG College of Technology,',
                size: 24,
                font: 'Arial',
              }),
            ],
            spacing: { after: 120 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: 'Coimbatore.', size: 24, font: 'Arial' }),
            ],
            spacing: { after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'The following students attended the placement drive as indicated below',
                size: 24,
                font: 'Arial',
              }),
            ],
            spacing: { after: 400 },
          }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: noBorders,
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    borders: noBorders,
                    width: { size: 67, type: WidthType.PERCENTAGE },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({ text: 'Company Name: ', bold: true, size: 24, font: 'Arial' }),
                          new TextRun({ text: `${event.companyName}`, size: 24, font: 'Arial' }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    borders: noBorders,
                    width: { size: 33, type: WidthType.PERCENTAGE },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({ text: 'Event: ', bold: true, size: 24, font: 'Arial' }),
                          new TextRun({ text: event.eventType, size: 24, font: 'Arial' }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    borders: noBorders,
                    children: [
                      new Paragraph({
                        spacing: { before: 160 },
                        children: [
                          new TextRun({ text: 'Date & Time : ', bold: true, size: 24, font: 'Arial' }),
                          new TextRun({ text: `${formattedDate} & ${event.startTime} \u2013 ${event.endTime}`, size: 24, font: 'Arial' }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    borders: noBorders,
                    children: [
                      new Paragraph({
                        spacing: { before: 160 },
                        children: [
                          new TextRun({ text: 'Number of Students : ', bold: true, size: 24, font: 'Arial' }),
                          new TextRun({ text: String(studentCount), size: 24, font: 'Arial' }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),
          new Paragraph({ spacing: { before: 300 } }),
          new Paragraph({
            children: [
              new TextRun({ text: 'Class : ', bold: true, size: 24, font: 'Arial' }),
              new TextRun({ text: 'CSE(AI&ML) 4th Year', size: 24, font: 'Arial' }),
            ],
            spacing: { after: 300 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: 'List of the Students:', bold: true, size: 24, font: 'Arial' }),
            ],
            spacing: { after: 200 },
          }),
          new Table({
            width: { size: 80, type: WidthType.PERCENTAGE }, // Reduced width as requested
            alignment: AlignmentType.CENTER, // Center the table in DOCX
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    width: { size: 15, type: WidthType.PERCENTAGE },
                    children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'S.No', bold: true, size: 22, font: 'Arial' })], spacing: { before: 100, after: 100 } })],
                  }),
                  new TableCell({
                    width: { size: 25, type: WidthType.PERCENTAGE },
                    children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Roll No', bold: true, size: 22, font: 'Arial' })], spacing: { before: 100, after: 100 } })],
                  }),
                  new TableCell({
                    width: { size: 60, type: WidthType.PERCENTAGE },
                    children: [new Paragraph({ indent: { left: 100 }, children: [new TextRun({ text: 'Name', bold: true, size: 22, font: 'Arial' })], spacing: { before: 100, after: 100 } })],
                  }),
                ],
              }),
              ...event.students.map(
                (student, index) => {
                  const isLastFew = index >= event.students.length - 5;
                  return new TableRow({
                    cantSplit: true,
                    children: [
                      new TableCell({
                        children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: String(index + 1), size: 22, font: 'Arial' })], spacing: { before: 100, after: 100 }, keepNext: isLastFew })],
                      }),
                      new TableCell({
                        children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: student.rollNo, size: 22, font: 'Arial' })], spacing: { before: 100, after: 100 }, keepNext: isLastFew })],
                      }),
                      new TableCell({
                        children: [new Paragraph({ indent: { left: 100 }, children: [new TextRun({ text: student.name, size: 22, font: 'Arial' })], spacing: { before: 100, after: 100 }, keepNext: isLastFew })],
                      }),
                    ],
                  });
                }
              ),
            ],
          }),
          new Paragraph({
            keepNext: true,
            children: [
              new TextRun({
                text: 'The above students may be provided attendance for the mentioned date and session.',
                size: 24,
                font: 'Arial',
              }),
            ],
            spacing: { before: 400, after: 1000 },
          }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: noBorders,
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    borders: noBorders,
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: 'Placement Representative',
                            size: 24,
                            font: 'Arial',
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    borders: noBorders,
                    children: [
                      new Paragraph({
                        alignment: AlignmentType.RIGHT,
                        children: [
                          new TextRun({
                            text: 'Dean Placement and Training',
                            size: 24,
                            font: 'Arial',
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `OD_Form_${event.companyName}.docx`);
}
