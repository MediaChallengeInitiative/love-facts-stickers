import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  TableOfContents,
  PageBreak,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  ShadingType,
} from 'docx';
import * as fs from 'fs';

// Executive Report for MCI Leadership
const createExecutiveReport = () => {
  const doc = new Document({
    creator: 'Media Challenge Initiative',
    title: 'Love Facts Sticker Portal - Executive Report',
    description: 'Non-technical executive summary of the Love Facts Sticker Portal application',
    styles: {
      paragraphStyles: [
        {
          id: 'Normal',
          name: 'Normal',
          basedOn: 'Normal',
          next: 'Normal',
          run: {
            font: 'Calibri',
            size: 24, // 12pt
          },
          paragraph: {
            spacing: {
              after: 200,
              line: 276,
            },
          },
        },
      ],
    },
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1440, // 1 inch
              right: 1440,
              bottom: 1440,
              left: 1440,
            },
          },
        },
        children: [
          // Cover Page
          new Paragraph({
            children: [],
            spacing: { before: 2000 },
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: 'MEDIA CHALLENGE INITIATIVE',
                bold: true,
                size: 32,
                font: 'Calibri',
                color: 'E91E63',
              }),
            ],
          }),
          new Paragraph({
            children: [],
            spacing: { before: 400 },
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: 'LOVE FACTS STICKER PORTAL',
                bold: true,
                size: 56,
                font: 'Calibri',
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: 'Executive Summary Report',
                size: 32,
                font: 'Calibri',
                color: '666666',
              }),
            ],
          }),
          new Paragraph({
            children: [],
            spacing: { before: 1500 },
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: 'Prepared for:',
                size: 24,
                font: 'Calibri',
                color: '666666',
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: 'Chief Executive Officer & General Manager',
                bold: true,
                size: 28,
                font: 'Calibri',
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: 'Media Challenge Initiative',
                size: 24,
                font: 'Calibri',
              }),
            ],
          }),
          new Paragraph({
            children: [],
            spacing: { before: 1500 },
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: `Date: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`,
                size: 24,
                font: 'Calibri',
                color: '666666',
              }),
            ],
          }),
          new Paragraph({
            children: [new PageBreak()],
          }),

          // Executive Summary
          new Paragraph({
            text: 'Executive Summary',
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'The Love Facts Sticker Portal is a custom-built web application designed to support Media Challenge Initiative\'s mission of promoting media literacy across Uganda and beyond. This platform enables the free distribution of digital stickers that help citizens identify and combat misinformation.',
                size: 24,
              }),
            ],
            spacing: { after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'The application has been developed from the ground up with the following key objectives:',
                size: 24,
              }),
            ],
            spacing: { after: 100 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: '1. ', bold: true, size: 24 }),
              new TextRun({ text: 'Provide easy access to media literacy stickers for the general public', size: 24 }),
            ],
            indent: { left: 360 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: '2. ', bold: true, size: 24 }),
              new TextRun({ text: 'Collect user contact information for impact measurement and reporting', size: 24 }),
            ],
            indent: { left: 360 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: '3. ', bold: true, size: 24 }),
              new TextRun({ text: 'Enable easy sharing of stickers through WhatsApp, social media, and messaging apps', size: 24 }),
            ],
            indent: { left: 360 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: '4. ', bold: true, size: 24 }),
              new TextRun({ text: 'Provide an administrative dashboard for tracking downloads and user engagement', size: 24 }),
            ],
            indent: { left: 360 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: '5. ', bold: true, size: 24 }),
              new TextRun({ text: 'Ensure user privacy and data protection compliance', size: 24 }),
            ],
            indent: { left: 360 },
            spacing: { after: 400 },
          }),

          // What is the Love Facts Sticker Portal?
          new Paragraph({
            text: 'What is the Love Facts Sticker Portal?',
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'The Love Facts Sticker Portal is a website where anyone can:',
                size: 24,
              }),
            ],
            spacing: { after: 100 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: '• ', size: 24 }),
              new TextRun({ text: 'Browse ', bold: true, size: 24 }),
              new TextRun({ text: 'through collections of media literacy stickers organized by theme', size: 24 }),
            ],
            indent: { left: 360 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: '• ', size: 24 }),
              new TextRun({ text: 'Search ', bold: true, size: 24 }),
              new TextRun({ text: 'for specific stickers using keywords or tags', size: 24 }),
            ],
            indent: { left: 360 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: '• ', size: 24 }),
              new TextRun({ text: 'Preview ', bold: true, size: 24 }),
              new TextRun({ text: 'stickers in full size before downloading', size: 24 }),
            ],
            indent: { left: 360 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: '• ', size: 24 }),
              new TextRun({ text: 'Download ', bold: true, size: 24 }),
              new TextRun({ text: 'individual stickers or entire collections for free', size: 24 }),
            ],
            indent: { left: 360 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: '• ', size: 24 }),
              new TextRun({ text: 'Share ', bold: true, size: 24 }),
              new TextRun({ text: 'stickers directly to WhatsApp, Facebook, Twitter/X, and Instagram', size: 24 }),
            ],
            indent: { left: 360 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: '• ', size: 24 }),
              new TextRun({ text: 'Generate QR codes ', bold: true, size: 24 }),
              new TextRun({ text: 'that link to specific stickers for easy sharing at events', size: 24 }),
            ],
            indent: { left: 360 },
            spacing: { after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'The platform works on all devices — computers, tablets, and mobile phones. It features both light and dark display modes for comfortable viewing in any environment.',
                size: 24,
              }),
            ],
            spacing: { after: 400 },
          }),

          // User Experience
          new Paragraph({
            text: 'How Users Interact with the Portal',
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'The User Journey',
                bold: true,
                size: 26,
              }),
            ],
            spacing: { after: 100 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'When a visitor arrives at the Love Facts Sticker Portal, they are greeted with an attractive landing page that explains the purpose of the stickers and invites them to browse the collection. Here is the typical user journey:',
                size: 24,
              }),
            ],
            spacing: { after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: 'Step 1: Landing Page', bold: true, size: 24 }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'Users see a welcoming hero section with the tagline "Fight Misinformation with Love Facts Stickers" and statistics showing the number of available stickers. They can click "Browse Stickers" to explore.',
                size: 24,
              }),
            ],
            indent: { left: 360 },
            spacing: { after: 150 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: 'Step 2: Collection Browsing', bold: true, size: 24 }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'Users can view stickers organized by collection (e.g., "Fact-Checking Tips," "Spotting Fake News," etc.). Each collection shows a preview of its stickers with an auto-rotating carousel.',
                size: 24,
              }),
            ],
            indent: { left: 360 },
            spacing: { after: 150 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: 'Step 3: Search & Filter', bold: true, size: 24 }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'Users can search for specific stickers by typing keywords. They can also filter by collection using clickable filter buttons.',
                size: 24,
              }),
            ],
            indent: { left: 360 },
            spacing: { after: 150 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: 'Step 4: Sticker Preview', bold: true, size: 24 }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'Clicking any sticker opens a preview window showing the full-size image, suggested caption for sharing, and relevant tags.',
                size: 24,
              }),
            ],
            indent: { left: 360 },
            spacing: { after: 150 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: 'Step 5: Download', bold: true, size: 24 }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'When users click download, they are asked to optionally provide their email or phone number. This helps MCI measure the impact of the campaign. Users can also choose to download anonymously.',
                size: 24,
              }),
            ],
            indent: { left: 360 },
            spacing: { after: 150 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: 'Step 6: Sharing', bold: true, size: 24 }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'After downloading, users are encouraged to share the stickers on WhatsApp, social media, or via a QR code they can show to friends.',
                size: 24,
              }),
            ],
            indent: { left: 360 },
            spacing: { after: 400 },
          }),

          new Paragraph({
            children: [new PageBreak()],
          }),

          // Data Collection
          new Paragraph({
            text: 'Data Collection for Impact Measurement',
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'A key feature of the portal is its ability to collect contact information from users who download stickers. This data is essential for:',
                size: 24,
              }),
            ],
            spacing: { after: 100 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: '• ', size: 24 }),
              new TextRun({ text: 'Impact Reporting: ', bold: true, size: 24 }),
              new TextRun({ text: 'Demonstrating reach to funders and partners', size: 24 }),
            ],
            indent: { left: 360 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: '• ', size: 24 }),
              new TextRun({ text: 'Geographic Analysis: ', bold: true, size: 24 }),
              new TextRun({ text: 'Understanding where stickers are being used (via phone number country codes)', size: 24 }),
            ],
            indent: { left: 360 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: '• ', size: 24 }),
              new TextRun({ text: 'Future Engagement: ', bold: true, size: 24 }),
              new TextRun({ text: 'Notifying users about new sticker releases or campaigns', size: 24 }),
            ],
            indent: { left: 360 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: '• ', size: 24 }),
              new TextRun({ text: 'Trend Analysis: ', bold: true, size: 24 }),
              new TextRun({ text: 'Identifying which stickers are most popular', size: 24 }),
            ],
            indent: { left: 360 },
            spacing: { after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'Privacy Compliance',
                bold: true,
                size: 26,
              }),
            ],
            spacing: { after: 100 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'The portal fully respects user privacy:',
                size: 24,
              }),
            ],
            spacing: { after: 100 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: '• ', size: 24 }),
              new TextRun({ text: 'Users are clearly informed why data is collected before they provide it', size: 24 }),
            ],
            indent: { left: 360 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: '• ', size: 24 }),
              new TextRun({ text: 'Users can download stickers without providing any personal information', size: 24 }),
            ],
            indent: { left: 360 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: '• ', size: 24 }),
              new TextRun({ text: 'A dedicated "Unsubscribe" page allows users to request deletion of their data', size: 24 }),
            ],
            indent: { left: 360 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: '• ', size: 24 }),
              new TextRun({ text: 'Data is automatically deleted after 12 months', size: 24 }),
            ],
            indent: { left: 360 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: '• ', size: 24 }),
              new TextRun({ text: 'A comprehensive Privacy Policy is available on the website', size: 24 }),
            ],
            indent: { left: 360 },
            spacing: { after: 400 },
          }),

          // Admin Dashboard
          new Paragraph({
            text: 'Administrative Dashboard',
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'The portal includes a password-protected administrative area where authorized MCI staff can:',
                size: 24,
              }),
            ],
            spacing: { after: 100 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: '• ', size: 24 }),
              new TextRun({ text: 'View Total Downloads: ', bold: true, size: 24 }),
              new TextRun({ text: 'See how many stickers have been downloaded overall', size: 24 }),
            ],
            indent: { left: 360 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: '• ', size: 24 }),
              new TextRun({ text: 'Track Unique Users: ', bold: true, size: 24 }),
              new TextRun({ text: 'Count individual people who have downloaded stickers', size: 24 }),
            ],
            indent: { left: 360 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: '• ', size: 24 }),
              new TextRun({ text: 'See Popular Stickers: ', bold: true, size: 24 }),
              new TextRun({ text: 'Identify which stickers are downloaded most frequently', size: 24 }),
            ],
            indent: { left: 360 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: '• ', size: 24 }),
              new TextRun({ text: 'View Download Trends: ', bold: true, size: 24 }),
              new TextRun({ text: 'Charts showing downloads over time (daily, weekly, monthly)', size: 24 }),
            ],
            indent: { left: 360 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: '• ', size: 24 }),
              new TextRun({ text: 'Export Data: ', bold: true, size: 24 }),
              new TextRun({ text: 'Download user contact information as a spreadsheet (CSV) for reporting', size: 24 }),
            ],
            indent: { left: 360 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: '• ', size: 24 }),
              new TextRun({ text: 'Search Users: ', bold: true, size: 24 }),
              new TextRun({ text: 'Find specific download records by email, phone, or name', size: 24 }),
            ],
            indent: { left: 360 },
            spacing: { after: 400 },
          }),

          new Paragraph({
            children: [new PageBreak()],
          }),

          // Domain & Hosting
          new Paragraph({
            text: 'Website Domain & Live Deployment',
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'The Love Facts Sticker Portal is now live and accessible to the public. A dedicated domain has been purchased to establish the Love Facts brand independently:',
                size: 24,
              }),
            ],
            spacing: { after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'Domain Configuration:',
                bold: true,
                size: 26,
              }),
            ],
            spacing: { after: 100 },
          }),
          // Domain configuration table
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ text: 'Domain', alignment: AlignmentType.CENTER })],
                    shading: { fill: 'E91E63', type: ShadingType.CLEAR, color: 'auto' },
                    width: { size: 40, type: WidthType.PERCENTAGE },
                  }),
                  new TableCell({
                    children: [new Paragraph({ text: 'Purpose', alignment: AlignmentType.CENTER })],
                    shading: { fill: 'E91E63', type: ShadingType.CLEAR, color: 'auto' },
                    width: { size: 60, type: WidthType.PERCENTAGE },
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: 'lovefacts.africa', bold: true })] })],
                  }),
                  new TableCell({
                    children: [new Paragraph('Main Love Facts website (future expansion)')],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: 'stickers.lovefacts.africa', bold: true })] })],
                  }),
                  new TableCell({
                    children: [new Paragraph('LIVE - Sticker Portal (currently deployed and active)')],
                  }),
                ],
              }),
            ],
          }),
          new Paragraph({
            children: [],
            spacing: { after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'Domain Investment:',
                bold: true,
                size: 26,
              }),
            ],
            spacing: { after: 100 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: '• ', size: 24 }),
              new TextRun({ text: 'Domain: ', bold: true, size: 24 }),
              new TextRun({ text: 'lovefacts.africa', size: 24 }),
            ],
            indent: { left: 360 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: '• ', size: 24 }),
              new TextRun({ text: 'Cost: ', bold: true, size: 24 }),
              new TextRun({ text: '$17 (one-time purchase)', size: 24 }),
            ],
            indent: { left: 360 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: '• ', size: 24 }),
              new TextRun({ text: 'Benefits: ', bold: true, size: 24 }),
              new TextRun({ text: 'Establishes Love Facts as an independent brand, memorable African domain extension, room for future expansion', size: 24 }),
            ],
            indent: { left: 360 },
            spacing: { after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'QR Code for Easy Access:',
                bold: true,
                size: 26,
              }),
            ],
            spacing: { after: 100 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'A QR code has been generated for https://stickers.lovefacts.africa/ to facilitate easy sharing at events, workshops, and printed materials. Simply scan the QR code to access the sticker portal directly from any mobile device.',
                size: 24,
              }),
            ],
            spacing: { after: 400 },
          }),

          // Technical Infrastructure
          new Paragraph({
            text: 'Technical Infrastructure (Simplified)',
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'The Love Facts Sticker Portal is built using modern, reliable technology that ensures:',
                size: 24,
              }),
            ],
            spacing: { after: 100 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: '• ', size: 24 }),
              new TextRun({ text: 'Fast Loading: ', bold: true, size: 24 }),
              new TextRun({ text: 'Pages load quickly even on slow mobile networks', size: 24 }),
            ],
            indent: { left: 360 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: '• ', size: 24 }),
              new TextRun({ text: 'Mobile-Friendly: ', bold: true, size: 24 }),
              new TextRun({ text: 'Works perfectly on smartphones, tablets, and computers', size: 24 }),
            ],
            indent: { left: 360 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: '• ', size: 24 }),
              new TextRun({ text: 'Reliable: ', bold: true, size: 24 }),
              new TextRun({ text: 'Hosted on enterprise-grade servers with 99.9% uptime guarantee', size: 24 }),
            ],
            indent: { left: 360 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: '• ', size: 24 }),
              new TextRun({ text: 'Secure: ', bold: true, size: 24 }),
              new TextRun({ text: 'All data transmitted over encrypted connections (HTTPS)', size: 24 }),
            ],
            indent: { left: 360 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: '• ', size: 24 }),
              new TextRun({ text: 'Scalable: ', bold: true, size: 24 }),
              new TextRun({ text: 'Can handle thousands of simultaneous users', size: 24 }),
            ],
            indent: { left: 360 },
            spacing: { after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'Current Hosting (Vercel):',
                bold: true,
                size: 26,
              }),
            ],
            spacing: { after: 100 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'The portal is hosted on Vercel (FREE), which provides:',
                size: 24,
              }),
            ],
            spacing: { after: 100 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: '• ', size: 24 }),
              new TextRun({ text: 'Free tier sufficient for most use cases', size: 24 }),
            ],
            indent: { left: 360 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: '• ', size: 24 }),
              new TextRun({ text: 'Automatic deployments when changes are made', size: 24 }),
            ],
            indent: { left: 360 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: '• ', size: 24 }),
              new TextRun({ text: 'Global content delivery for fast access worldwide', size: 24 }),
            ],
            indent: { left: 360 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: '• ', size: 24 }),
              new TextRun({ text: 'Free SSL certificate (secure website)', size: 24 }),
            ],
            indent: { left: 360 },
            spacing: { after: 400 },
          }),

          new Paragraph({
            children: [new PageBreak()],
          }),

          // Cost Summary
          new Paragraph({
            text: 'Cost Summary',
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 },
          }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ text: 'Item', alignment: AlignmentType.CENTER })],
                    shading: { fill: 'E91E63', type: ShadingType.CLEAR, color: 'auto' },
                    width: { size: 50, type: WidthType.PERCENTAGE },
                  }),
                  new TableCell({
                    children: [new Paragraph({ text: 'Cost', alignment: AlignmentType.CENTER })],
                    shading: { fill: 'E91E63', type: ShadingType.CLEAR, color: 'auto' },
                    width: { size: 50, type: WidthType.PERCENTAGE },
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph('Domain (lovefacts.africa)')] }),
                  new TableCell({ children: [new Paragraph({ text: '$17 (paid)', alignment: AlignmentType.CENTER })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph('Subdomain (stickers.lovefacts.africa)')] }),
                  new TableCell({ children: [new Paragraph({ text: 'FREE', alignment: AlignmentType.CENTER })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph('Hosting (Vercel)')] }),
                  new TableCell({ children: [new Paragraph({ text: 'FREE', alignment: AlignmentType.CENTER })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph('Database (Prisma Postgres)')] }),
                  new TableCell({ children: [new Paragraph({ text: 'FREE', alignment: AlignmentType.CENTER })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph('SSL Certificate')] }),
                  new TableCell({ children: [new Paragraph({ text: 'FREE', alignment: AlignmentType.CENTER })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph('File Storage (Google Drive)')] }),
                  new TableCell({ children: [new Paragraph({ text: 'FREE', alignment: AlignmentType.CENTER })] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: 'TOTAL INVESTED', bold: true })] })],
                    shading: { fill: 'EEEEEE', type: ShadingType.CLEAR, color: 'auto' },
                  }),
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: '$17', bold: true })], alignment: AlignmentType.CENTER })],
                    shading: { fill: 'EEEEEE', type: ShadingType.CLEAR, color: 'auto' },
                  }),
                ],
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: '*The portal is now live and operational. Domain renewal will be approximately $17/year.',
                size: 20,
                italics: true,
                color: '666666',
              }),
            ],
            spacing: { before: 100, after: 400 },
          }),

          // Current Status & Next Steps
          new Paragraph({
            text: 'Current Status & Recommended Next Steps',
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'COMPLETED:',
                bold: true,
                size: 26,
                color: '4CAF50',
              }),
            ],
            spacing: { after: 100 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: '✓ ', size: 24, color: '4CAF50' }),
              new TextRun({ text: 'Domain purchased: ', bold: true, size: 24 }),
              new TextRun({ text: 'lovefacts.africa ($17)', size: 24 }),
            ],
            indent: { left: 360 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: '✓ ', size: 24, color: '4CAF50' }),
              new TextRun({ text: 'Subdomain configured: ', bold: true, size: 24 }),
              new TextRun({ text: 'stickers.lovefacts.africa', size: 24 }),
            ],
            indent: { left: 360 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: '✓ ', size: 24, color: '4CAF50' }),
              new TextRun({ text: 'Portal deployed: ', bold: true, size: 24 }),
              new TextRun({ text: 'Live and accessible at https://stickers.lovefacts.africa', size: 24 }),
            ],
            indent: { left: 360 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: '✓ ', size: 24, color: '4CAF50' }),
              new TextRun({ text: 'QR code generated: ', bold: true, size: 24 }),
              new TextRun({ text: 'Ready for printing and sharing', size: 24 }),
            ],
            indent: { left: 360 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: '✓ ', size: 24, color: '4CAF50' }),
              new TextRun({ text: 'Database configured: ', bold: true, size: 24 }),
              new TextRun({ text: 'Prisma Postgres with user tracking', size: 24 }),
            ],
            indent: { left: 360 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: '✓ ', size: 24, color: '4CAF50' }),
              new TextRun({ text: 'Google Drive sync: ', bold: true, size: 24 }),
              new TextRun({ text: 'Stickers synced from Google Drive', size: 24 }),
            ],
            indent: { left: 360 },
            spacing: { after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'RECOMMENDED NEXT STEPS:',
                bold: true,
                size: 26,
              }),
            ],
            spacing: { after: 100 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: '1. ', bold: true, size: 24 }),
              new TextRun({ text: 'Public announcement: ', bold: true, size: 24 }),
              new TextRun({ text: 'Share the portal through MCI social media channels and partners', size: 24 }),
            ],
            spacing: { after: 100 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: '2. ', bold: true, size: 24 }),
              new TextRun({ text: 'Print QR codes: ', bold: true, size: 24 }),
              new TextRun({ text: 'Include QR code on printed materials, banners, and event displays', size: 24 }),
            ],
            spacing: { after: 100 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: '3. ', bold: true, size: 24 }),
              new TextRun({ text: 'Add more stickers: ', bold: true, size: 24 }),
              new TextRun({ text: 'Upload new sticker collections to Google Drive and sync', size: 24 }),
            ],
            spacing: { after: 100 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: '4. ', bold: true, size: 24 }),
              new TextRun({ text: 'Monitor analytics: ', bold: true, size: 24 }),
              new TextRun({ text: 'Track downloads and user engagement via the admin dashboard', size: 24 }),
            ],
            spacing: { after: 100 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: '5. ', bold: true, size: 24 }),
              new TextRun({ text: 'Gather feedback: ', bold: true, size: 24 }),
              new TextRun({ text: 'Collect user feedback for future improvements', size: 24 }),
            ],
            spacing: { after: 400 },
          }),

          // Conclusion
          new Paragraph({
            text: 'Conclusion',
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'The Love Facts Sticker Portal is now LIVE and represents a significant step forward in MCI\'s digital outreach capabilities. The platform is fully operational at:',
                size: 24,
              }),
            ],
            spacing: { after: 100 },
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: 'https://stickers.lovefacts.africa',
                bold: true,
                size: 28,
                color: 'E91E63',
              }),
            ],
            spacing: { after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'With this platform, MCI can now:',
                size: 24,
              }),
            ],
            spacing: { after: 100 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: '• ', size: 24 }),
              new TextRun({ text: 'Reach a wider audience through digital distribution', size: 24 }),
            ],
            indent: { left: 360 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: '• ', size: 24 }),
              new TextRun({ text: 'Measure and report impact with accurate download statistics', size: 24 }),
            ],
            indent: { left: 360 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: '• ', size: 24 }),
              new TextRun({ text: 'Build a database of engaged citizens for future campaigns', size: 24 }),
            ],
            indent: { left: 360 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: '• ', size: 24 }),
              new TextRun({ text: 'Leverage WhatsApp and social media for viral distribution', size: 24 }),
            ],
            indent: { left: 360 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: '• ', size: 24 }),
              new TextRun({ text: 'Maintain full control over branding and content', size: 24 }),
            ],
            indent: { left: 360 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: '• ', size: 24 }),
              new TextRun({ text: 'Share the portal easily via QR code at events and workshops', size: 24 }),
            ],
            indent: { left: 360 },
            spacing: { after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'Total investment: $17 for the lovefacts.africa domain. All other services (hosting, database, SSL) are free.',
                size: 24,
                bold: true,
              }),
            ],
            spacing: { after: 400 },
          }),

          // Contact
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: '— End of Report —',
                size: 24,
                color: '666666',
              }),
            ],
            spacing: { before: 400 },
          }),
          new Paragraph({
            children: [],
            spacing: { before: 400 },
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: 'For questions or clarifications, please contact:',
                size: 22,
                color: '666666',
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: 'info@mciug.org',
                size: 22,
                bold: true,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: 'https://mciug.org',
                size: 22,
              }),
            ],
          }),
        ],
      },
    ],
  });

  return doc;
};

// Generate the document
const doc = createExecutiveReport();

// Save to file
Packer.toBuffer(doc).then((buffer) => {
  const outputPath = './Love-Facts-Sticker-Portal-Executive-Report.docx';
  fs.writeFileSync(outputPath, buffer);
  console.log(`Executive report saved to: ${outputPath}`);
});
