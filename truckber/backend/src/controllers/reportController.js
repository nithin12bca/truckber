const PDFDocument = require('pdfkit');
const Booking = require('../models/Booking');
const Driver = require('../models/Driver');
const Truck = require('../models/Truck');
const { Payment } = require('../models/index');

// Helper: format currency
const fmt = (n) => `Rs. ${(n || 0).toLocaleString('en-IN')}`;

// Helper: draw table row in PDF
const drawRow = (doc, y, cols, widths, isHeader = false) => {
  if (isHeader) {
    doc.rect(40, y - 4, 515, 18).fill('#f97316').stroke('#f97316');
  } else if (cols._even) {
    doc.rect(40, y - 4, 515, 18).fill('#fafafa').stroke('#f3f4f6');
  }
  let x = 45;
  cols.forEach((col, i) => {
    doc.fillColor(isHeader ? '#ffffff' : '#374151')
      .font(isHeader ? 'Helvetica-Bold' : 'Helvetica')
      .fontSize(8)
      .text(String(col), x, y, { width: widths[i] - 5, ellipsis: true });
    x += widths[i];
  });
};

// @desc  Generate Booking Report PDF
// @route GET /api/reports/bookings?startDate=&endDate=&format=pdf
exports.bookingReport = async (req, res, next) => {
  try {
    const { startDate, endDate, format = 'json' } = req.query;
    const filter = {};
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }
    if (req.user.role === 'truck_owner') filter.truckOwner = req.user._id;

    const bookings = await Booking.find(filter)
      .populate('customer', 'name phone')
      .populate('truck', 'truckNumber truckType')
      .populate({ path: 'driver', populate: { path: 'user', select: 'name' } })
      .sort({ createdAt: -1 })
      .limit(500);

    if (format === 'json') {
      return res.json({ success: true, data: bookings, count: bookings.length });
    }

    // PDF generation
    const doc = new PDFDocument({ margin: 40, size: 'A4', layout: 'landscape' });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="booking-report-${Date.now()}.pdf"`);
    doc.pipe(res);

    // Header
    doc.fillColor('#f97316').fontSize(22).font('Helvetica-Bold').text('TruckBer', 40, 30);
    doc.fillColor('#374151').fontSize(14).text('Booking Report', 40, 58);
    doc.fontSize(9).fillColor('#6b7280')
      .text(`Period: ${startDate || 'All time'} to ${endDate || 'Present'}`, 40, 76)
      .text(`Generated: ${new Date().toLocaleString('en-IN')}`, 40, 88)
      .text(`Total Bookings: ${bookings.length}`, 40, 100);

    doc.moveTo(40, 118).lineTo(800, 118).strokeColor('#e5e7eb').stroke();

    // Table header
    const headers = ['Booking #', 'Customer', 'From', 'To', 'Truck', 'Weight', 'Cost', 'Date', 'Status'];
    const widths = [80, 100, 100, 100, 80, 50, 70, 80, 60];
    drawRow(doc, 128, headers, widths, true);

    let y = 150;
    bookings.forEach((b, i) => {
      if (y > 550) {
        doc.addPage({ size: 'A4', layout: 'landscape' });
        y = 40;
        drawRow(doc, y, headers, widths, true);
        y += 22;
      }
      const row = [
        b.bookingNumber,
        b.customer?.name || '—',
        `${b.pickup?.city}, ${b.pickup?.state}`,
        `${b.drop?.city}, ${b.drop?.state}`,
        b.truck?.truckNumber || '—',
        `${b.loadWeight}T`,
        fmt(b.finalCost || b.estimatedCost),
        new Date(b.createdAt).toLocaleDateString('en-IN'),
        b.status,
      ];
      row._even = i % 2 === 0;
      drawRow(doc, y, row, widths);
      y += 20;
    });

    // Summary
    const delivered = bookings.filter(b => b.status === 'delivered').length;
    const totalRev = bookings.reduce((s, b) => s + (b.finalCost || b.estimatedCost || 0), 0);
    doc.moveTo(40, y + 10).lineTo(800, y + 10).strokeColor('#e5e7eb').stroke();
    doc.fontSize(9).fillColor('#374151').font('Helvetica-Bold')
      .text(`Total: ${bookings.length} bookings | Delivered: ${delivered} | Total Revenue: ${fmt(totalRev)}`, 40, y + 18);

    doc.end();
  } catch (error) { next(error); }
};

// @desc  Generate Revenue Report PDF
// @route GET /api/reports/revenue?startDate=&endDate=&format=pdf
exports.revenueReport = async (req, res, next) => {
  try {
    const { startDate, endDate, format = 'json' } = req.query;
    const filter = { status: 'success' };
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }
    if (req.user.role === 'truck_owner') filter.truckOwner = req.user._id;

    const payments = await Payment.find(filter)
      .populate('booking', 'bookingNumber pickup drop truckType')
      .populate('customer', 'name')
      .sort({ createdAt: -1 })
      .limit(500);

    const totalRevenue = payments.reduce((s, p) => s + (p.amount || 0), 0);
    const totalPlatformFee = payments.reduce((s, p) => s + (p.platformFee || 0), 0);

    if (format === 'json') {
      return res.json({ success: true, data: payments, summary: { totalRevenue, totalPlatformFee, count: payments.length } });
    }

    // PDF
    const doc = new PDFDocument({ margin: 40, size: 'A4' });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="revenue-report-${Date.now()}.pdf"`);
    doc.pipe(res);

    doc.fillColor('#f97316').fontSize(22).font('Helvetica-Bold').text('TruckBer', 40, 30);
    doc.fillColor('#374151').fontSize(14).text('Revenue Report', 40, 58);
    doc.fontSize(9).fillColor('#6b7280')
      .text(`Period: ${startDate || 'All time'} to ${endDate || 'Present'}`, 40, 76)
      .text(`Generated: ${new Date().toLocaleString('en-IN')}`, 40, 88);

    // Summary boxes
    const boxes = [
      { label: 'Total Revenue', value: fmt(totalRevenue), color: '#22c55e' },
      { label: 'Platform Fee (10%)', value: fmt(totalPlatformFee), color: '#6366f1' },
      { label: 'Owner Payout', value: fmt(totalRevenue - totalPlatformFee), color: '#f97316' },
      { label: 'Transactions', value: String(payments.length), color: '#3b82f6' },
    ];
    let bx = 40;
    boxes.forEach(({ label, value, color }) => {
      doc.rect(bx, 108, 115, 50).fill(color).stroke(color);
      doc.fillColor('#ffffff').fontSize(7).font('Helvetica').text(label, bx + 8, 115);
      doc.fontSize(13).font('Helvetica-Bold').text(value, bx + 8, 127);
      bx += 125;
    });

    doc.moveTo(40, 168).lineTo(555, 168).strokeColor('#e5e7eb').stroke();

    const headers = ['Booking #', 'Customer', 'Amount', 'Platform Fee', 'Method', 'Date'];
    const widths = [90, 120, 90, 90, 80, 85];
    drawRow(doc, 178, headers, widths, true);

    let y = 200;
    payments.forEach((p, i) => {
      if (y > 730) { doc.addPage(); y = 40; drawRow(doc, y, headers, widths, true); y += 22; }
      const row = [
        p.booking?.bookingNumber || '—',
        p.customer?.name || '—',
        fmt(p.amount),
        fmt(p.platformFee),
        p.paymentMethod || 'cash',
        new Date(p.createdAt).toLocaleDateString('en-IN'),
      ];
      row._even = i % 2 === 0;
      drawRow(doc, y, row, widths);
      y += 20;
    });

    doc.end();
  } catch (error) { next(error); }
};

// @desc  Generate Driver Report
// @route GET /api/reports/drivers?format=pdf
exports.driverReport = async (req, res, next) => {
  try {
    const { format = 'json' } = req.query;
    const drivers = await Driver.find()
      .populate('user', 'name phone email')
      .populate('assignedTruck', 'truckNumber truckType')
      .sort({ totalTrips: -1 });

    if (format === 'json') {
      return res.json({ success: true, data: drivers, count: drivers.length });
    }

    const doc = new PDFDocument({ margin: 40, size: 'A4', layout: 'landscape' });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="driver-report-${Date.now()}.pdf"`);
    doc.pipe(res);

    doc.fillColor('#f97316').fontSize(22).font('Helvetica-Bold').text('TruckBer', 40, 30);
    doc.fillColor('#374151').fontSize(14).text('Driver Performance Report', 40, 58);
    doc.fontSize(9).fillColor('#6b7280').text(`Generated: ${new Date().toLocaleString('en-IN')}`, 40, 76);

    doc.moveTo(40, 94).lineTo(800, 94).strokeColor('#e5e7eb').stroke();

    const headers = ['Driver Name', 'Phone', 'License #', 'Experience', 'Total Trips', 'Distance (km)', 'Rating', 'Status', 'Truck'];
    const widths = [110, 90, 110, 70, 70, 80, 50, 70, 80];
    drawRow(doc, 104, headers, widths, true);

    let y = 126;
    drivers.forEach((d, i) => {
      if (y > 550) { doc.addPage({ size: 'A4', layout: 'landscape' }); y = 40; drawRow(doc, y, headers, widths, true); y += 22; }
      const row = [
        d.user?.name || '—',
        d.user?.phone || '—',
        d.licenseNumber,
        `${d.experience} yrs`,
        String(d.totalTrips || 0),
        String(d.totalDistance || 0),
        d.rating ? `${d.rating.toFixed(1)} (${d.totalRatings})` : '—',
        d.verificationStatus,
        d.assignedTruck?.truckNumber || 'Unassigned',
      ];
      row._even = i % 2 === 0;
      drawRow(doc, y, row, widths);
      y += 20;
    });

    doc.end();
  } catch (error) { next(error); }
};

// @desc  Generate Fleet Report
// @route GET /api/reports/fleet?format=pdf
exports.fleetReport = async (req, res, next) => {
  try {
    const { format = 'json' } = req.query;
    const filter = req.user.role === 'truck_owner' ? { owner: req.user._id } : {};
    const trucks = await Truck.find(filter)
      .populate('owner', 'name phone')
      .populate({ path: 'assignedDriver', populate: { path: 'user', select: 'name' } })
      .sort({ createdAt: -1 });

    if (format === 'json') {
      return res.json({ success: true, data: trucks, count: trucks.length });
    }

    const doc = new PDFDocument({ margin: 40, size: 'A4', layout: 'landscape' });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="fleet-report-${Date.now()}.pdf"`);
    doc.pipe(res);

    doc.fillColor('#f97316').fontSize(22).font('Helvetica-Bold').text('TruckBer', 40, 30);
    doc.fillColor('#374151').fontSize(14).text('Fleet Report', 40, 58);
    doc.fontSize(9).fillColor('#6b7280').text(`Generated: ${new Date().toLocaleString('en-IN')} | Total Trucks: ${trucks.length}`, 40, 76);
    doc.moveTo(40, 94).lineTo(800, 94).strokeColor('#e5e7eb').stroke();

    const headers = ['Truck #', 'Type', 'Capacity', 'Make/Model', 'Year', 'Owner', 'Driver', 'Trips', 'Distance', 'Status'];
    const widths = [75, 70, 55, 90, 40, 100, 90, 45, 70, 65];
    drawRow(doc, 104, headers, widths, true);

    let y = 126;
    trucks.forEach((t, i) => {
      if (y > 550) { doc.addPage({ size: 'A4', layout: 'landscape' }); y = 40; drawRow(doc, y, headers, widths, true); y += 22; }
      const row = [
        t.truckNumber,
        t.truckType?.replace(/_/g, ' '),
        `${t.capacity}T`,
        `${t.make} ${t.model}`,
        String(t.year),
        t.owner?.name || '—',
        t.assignedDriver?.user?.name || 'Unassigned',
        String(t.totalTrips || 0),
        `${t.totalDistance || 0} km`,
        t.status,
      ];
      row._even = i % 2 === 0;
      drawRow(doc, y, row, widths);
      y += 20;
    });

    doc.end();
  } catch (error) { next(error); }
};
