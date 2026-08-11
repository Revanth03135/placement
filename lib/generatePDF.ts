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

  const rightColX = 135;
  const colGap = 5;

  // Company Name & Event Row
  y += 8;
  doc.setFont('helvetica', 'bold');
  doc.text('Company Name: ', marginLeft, y);
  const cnLabelWidth = doc.getTextWidth('Company Name: ');
  doc.setFont('helvetica', 'normal');
  
  // Wrap company name so it doesn't bleed into the right column
  const maxCompanyWidth = rightColX - (marginLeft + cnLabelWidth) - colGap;
  const companyLines = doc.splitTextToSize(event.companyName, maxCompanyWidth);
  doc.text(companyLines, marginLeft + cnLabelWidth, y);

  // Event (right column)
  doc.setFont('helvetica', 'bold');
  doc.text('Event: ', rightColX, y);
  const evLabelWidth = doc.getTextWidth('Event: ');
  doc.setFont('helvetica', 'normal');
  
  const maxEventWidth = pageWidth - marginRight - (rightColX + evLabelWidth);
  const eventLines = doc.splitTextToSize(event.eventType, maxEventWidth);
  doc.text(eventLines, rightColX + evLabelWidth, y);

  // Adjust Y based on the tallest column
  const maxLinesRow1 = Math.max(companyLines.length, eventLines.length);
  y += (maxLinesRow1 - 1) * 5.5;

  // Gap between rows
  y += 8;

  // Date & Time & Number of Students Row
  doc.setFont('helvetica', 'bold');
  doc.text('Date & Time : ', marginLeft, y);
  const dtLabelWidth = doc.getTextWidth('Date & Time : ');
  doc.setFont('helvetica', 'normal');
  
  const dateTimeText = `${formattedDate} & ${event.startTime} \u2013 ${event.endTime}`;
  const maxDateTimeWidth = rightColX - (marginLeft + dtLabelWidth) - colGap;
  const dateTimeLines = doc.splitTextToSize(dateTimeText, maxDateTimeWidth);
  doc.text(dateTimeLines, marginLeft + dtLabelWidth, y);

  // Number of Students (right column)
  doc.setFont('helvetica', 'bold');
  doc.text('Number of Students : ', rightColX, y);
  const nsLabelWidth = doc.getTextWidth('Number of Students : ');
  doc.setFont('helvetica', 'normal');
  doc.text(String(studentCount), rightColX + nsLabelWidth, y);

  const maxLinesRow2 = dateTimeLines.length;
  y += (maxLinesRow2 - 1) * 5.5;

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

  const closingSpace = 60;
  const minStudentsOnLastPage = 5;

  let remainingStudents = studentCount;
  let currentY = y;
  let pageIndex = 1;
  let studentIndex = 0;

  while (remainingStudents > 0) {
    const isFirstPage = pageIndex === 1;
    let availableSpace = pageHeight - marginBottom - currentY;
    
    let maxStudentsFit = Math.floor((availableSpace - rowHeight) / rowHeight);
    if (maxStudentsFit < 0) maxStudentsFit = 0;

    // Enforce at least 5 students on the last page if there are more than 5 students in total
    if (remainingStudents > minStudentsOnLastPage) {
      const leftOver = remainingStudents - maxStudentsFit;
      if (leftOver > 0 && leftOver < minStudentsOnLastPage) {
        maxStudentsFit = remainingStudents - minStudentsOnLastPage;
      }
    }

    let studentsToDraw = Math.min(maxStudentsFit, remainingStudents);
    
    // Check if drawing these students will orphan the closing section
    if (studentsToDraw === remainingStudents) {
      const spaceUsed = rowHeight + (studentsToDraw * rowHeight);
      const spaceLeft = availableSpace - spaceUsed;
      
      if (spaceLeft < closingSpace) {
        if (remainingStudents > minStudentsOnLastPage) {
          studentsToDraw = remainingStudents - minStudentsOnLastPage;
        } else {
          // Push all remaining students to the next page so they stay with the signatures
          studentsToDraw = 0;
        }
      }
    }

    if (studentsToDraw > 0) {
      if (isFirstPage) currentY += 4;
      currentY = drawTableHeader(doc, currentY);
      for (let i = 0; i < studentsToDraw; i++) {
        currentY = drawStudentRow(doc, event.students[studentIndex], currentY, studentIndex + 1);
        studentIndex++;
      }
      remainingStudents -= studentsToDraw;
    }

    if (remainingStudents > 0) {
      doc.addPage();
      pageIndex++;
      currentY = marginTop;
    }
  }

  drawClosingSection(doc, currentY);
  return doc;
}
