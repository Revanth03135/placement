import jsPDF from 'jspdf';

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
    case 1: return 'st';
    case 2: return 'nd';
    case 3: return 'rd';
    default: return 'th';
  }
}

function formatDateForPDF(dateStr: string): string {
  const date = new Date(dateStr);
  const day = date.getDate();
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  return `${day}${getOrdinalSuffix(day)} ${month} ${year}`;
}

export function generateODPdf(event: EventData): jsPDF {
  // A4 dimensions in mm: 210 x 297
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // Margins matching DOCX (converted from inches to mm)
  // DOCX: top=1.14in, bottom=1.88in, left=0.98in, right=1.18in
  const marginLeft = 25;    // ~0.98in
  const marginRight = 30;   // ~1.18in
  const marginTop = 29;     // ~1.14in
  const marginBottom = 20;  // Reduced to minimize blank space at bottom of pages
  const pageWidth = 210;
  const pageHeight = 297;
  const contentWidth = pageWidth - marginLeft - marginRight;

  const formattedDate = formatDateForPDF(event.date);
  const studentCount = event.students.length;

  // ============ PAGE 1 — COVER PAGE ============
  let y = marginTop;

  // Title: "Placement and Training PSG College of Technology" — centered, bold, 12pt
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  const titleText = 'Placement and Training PSG College of Technology';
  const titleWidth = doc.getTextWidth(titleText);
  doc.text(titleText, (pageWidth - titleWidth) / 2, y);

  // Two blank lines (~line height 6mm at 12pt)
  y += 6;
  y += 6;

  // "To," — bold
  y += 6;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('To,', marginLeft, y);

  // "The Principal," — normal (reduced space)
  y += 6;
  doc.setFont('helvetica', 'normal');
  doc.text('The Principal,', marginLeft, y);

  // "PSG College of Technology,"
  y += 6;
  doc.text('PSG College of Technology,', marginLeft, y);

  // "Coimbatore." (moved to next line)
  y += 6;
  doc.text('Coimbatore.', marginLeft, y);

  // "The following students attended the placement drive as indicated below"
  y += 8;
  doc.text(
    'The following students attended the placement drive as indicated below',
    marginLeft,
    y
  );

  // Blank line
  y += 6;

  // Company Name
  y += 8;
  doc.setFont('helvetica', 'bold');
  doc.text('Company Name: ', marginLeft, y);
  const cnLabelWidth = doc.getTextWidth('Company Name: ');
  doc.setFont('helvetica', 'normal');
  doc.text(`${event.companyName}`, marginLeft + cnLabelWidth, y);

  // Event
  y += 6;
  doc.setFont('helvetica', 'bold');
  doc.text('Event: ', marginLeft, y);
  const evLabelWidth = doc.getTextWidth('Event: ');
  doc.setFont('helvetica', 'normal');
  doc.text(event.eventType, marginLeft + evLabelWidth, y);

  y += 8;

  // Date & Time
  doc.setFont('helvetica', 'bold');
  doc.text('Date & Time : ', marginLeft, y);
  const dtLabelWidth = doc.getTextWidth('Date & Time : ');
  doc.setFont('helvetica', 'normal');
  const dateTimeText = `${formattedDate} & ${event.startTime} \u2013 ${event.endTime}`;
  doc.text(dateTimeText, marginLeft + dtLabelWidth, y);

  // Number of Students
  y += 6;
  doc.setFont('helvetica', 'bold');
  doc.text('Number of Students : ', marginLeft, y);
  const nsLabelWidth = doc.getTextWidth('Number of Students : ');
  doc.setFont('helvetica', 'normal');
  doc.text(String(studentCount), marginLeft + nsLabelWidth, y);

  // Blank line
  y += 6;

  // "Class : CSE(AI&ML) 4th Year"
  y += 6;
  doc.setFont('helvetica', 'bold');
  doc.text('Class : ', marginLeft, y);
  const clLabelWidth = doc.getTextWidth('Class : ');
  doc.setFont('helvetica', 'normal');
  doc.text('CSE(AI&ML) 4th Year', marginLeft + clLabelWidth, y);

  // Blank line
  y += 6;

  // "List of the Students:" — bold heading
  y += 6;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('List of the Students:', marginLeft, y);

  // Blank line before table
  y += 4;

  // ============ STUDENT TABLE ============
  const tableStartX = marginLeft;
  const snoColWidth = 15;
  const rollNoColWidth = 25;
  const nameColWidth = 90; // Reduced total width, not full page width
  const rowHeight = 7;

  // Calculate how many students fit on page 1
  // We use all space down to marginBottom. The closing area will automatically check if it needs a new page.
  const availableOnPage1 = pageHeight - marginBottom - y;
  const studentsPerPage1 = Math.max(0, Math.floor(availableOnPage1 / rowHeight) - 1); // -1 for header

  // Students per subsequent page
  const availableOnSubsequentPage = pageHeight - marginTop - marginBottom;
  const studentsPerSubsequentPage = Math.floor(availableOnSubsequentPage / rowHeight) - 1; // -1 for header

  // Function to draw table header
  function drawTableHeader(doc: jsPDF, startY: number): number {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);

    // Header row
    doc.rect(tableStartX, startY, snoColWidth, rowHeight);
    doc.rect(tableStartX + snoColWidth, startY, rollNoColWidth, rowHeight);
    doc.rect(tableStartX + snoColWidth + rollNoColWidth, startY, nameColWidth, rowHeight);
    
    doc.text('S.No', tableStartX + 3, startY + 5);
    doc.text('Roll No', tableStartX + snoColWidth + 3, startY + 5);
    doc.text('Name', tableStartX + snoColWidth + rollNoColWidth + 3, startY + 5);

    return startY + rowHeight;
  }

  // Function to draw a student row
  function drawStudentRow(
    doc: jsPDF,
    student: StudentData,
    startY: number,
    index: number
  ): number {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);

    doc.rect(tableStartX, startY, snoColWidth, rowHeight);
    doc.rect(tableStartX + snoColWidth, startY, rollNoColWidth, rowHeight);
    doc.rect(tableStartX + snoColWidth + rollNoColWidth, startY, nameColWidth, rowHeight);
    
    doc.text(String(index), tableStartX + 3, startY + 5);
    doc.text(student.rollNo, tableStartX + snoColWidth + 3, startY + 5);
    doc.text(student.name, tableStartX + snoColWidth + rollNoColWidth + 3, startY + 5);

    return startY + rowHeight;
  }

  // Function to draw closing section
  function drawClosingSection(doc: jsPDF, startY: number) {
    const requiredSpace = 60; // 10 for margin + 10 for text + 40 for signature
    if (pageHeight - marginBottom - startY < requiredSpace) {
      doc.addPage();
      startY = marginTop;
    }

    let cy = startY + 10;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    doc.text(
      'The above students may be provided attendance for the mentioned date and session.',
      marginLeft,
      cy
    );

    // Signature area
    cy += 40;
    doc.text('Placement Representative', marginLeft, cy);
    doc.text(
      'Dean Placement and Training',
      pageWidth - marginRight - doc.getTextWidth('Dean Placement and Training'),
      cy
    );
  }

  // Draw students on page 1
  let studentIndex = 0;
  const studentsOnPage1 = Math.min(studentsPerPage1, studentCount);

  if (studentsOnPage1 > 0) {
    y += 4;
    y = drawTableHeader(doc, y);
    for (let i = 0; i < studentsOnPage1; i++) {
      y = drawStudentRow(doc, event.students[studentIndex], y, studentIndex + 1);
      studentIndex++;
    }
  }

  // If all students fit on page 1
  if (studentIndex >= studentCount) {
    drawClosingSection(doc, y);
    return doc;
  }

  // Continue on subsequent pages
  while (studentIndex < studentCount) {
    doc.addPage();
    let py = marginTop;

    // Determine how many students on this page
    const remaining = studentCount - studentIndex;
    const isLastPage = remaining <= studentsPerSubsequentPage;
    const studentsOnThisPage = isLastPage
      ? remaining
      : studentsPerSubsequentPage;

    // Draw table header
    py = drawTableHeader(doc, py);

    // Draw student rows
    for (let i = 0; i < studentsOnThisPage; i++) {
      py = drawStudentRow(doc, event.students[studentIndex], py, studentIndex + 1);
      studentIndex++;
    }

    // If this is the last page, draw closing section
    if (studentIndex >= studentCount) {
      drawClosingSection(doc, py);
    }
  }

  return doc;
}
