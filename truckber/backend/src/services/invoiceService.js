const PDFDocument = require('pdfkit');
const { cloudinary } = require('../config/cloudinary');
const Booking = require('../models/Booking');
const { Invoice, Payment } = require('../models/index');
const { PassThrough } = require('stream');

exports.generateInvoicePDF = async (bookingId) => {
  try {
    const booking = await Booking.findById(bookingId)
      .populate('customer', 'name email phone address')
      .populate('truckOwner', 'name phone')
      .populate('truck', 'truckNumber truckType capacity');

    if (!booking) throw new Error('Booking not found');

    const amount = booking.finalCost || booking.estimatedCost || 0;
    const tax = Math.round(amount * 0.18);
    const total = amount + tax;

    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    const buffers = [];
    doc.on('data', (chunk) => buffers.push(chunk));

    // Header
    doc.fillColor('#f97316').fontSize(28).font('Helvetica-Bold').text('TruckBer', 50, 50);
    doc.fillColor('#374151').fontSize(10).font('Helvetica').text('Logistics & Fleet Management Platform', 50, 85);
    doc.fontSize(20).font('Helvetica-Bold').fillColor('#111827').text('INVOICE', 400, 50, { align: 'right' });

    doc.moveTo(50, 110).lineTo(545, 110).strokeColor('#e5e7eb').stroke();

    // Invoice details
    const invoiceNumber = 'INV-' + Date.now().toString(36).toUpperCase();
    doc.fontSize(10).fillColor('#6b7280');
    doc.text(`Invoice Number: ${invoiceNumber}`, 50, 125);
    doc.text(`Date: ${new Date().toLocaleDateString('en-IN')}`, 50, 140);
    doc.text(`Booking #: ${booking.bookingNumber}`, 50, 155);

    // Customer info
    doc.fontSize(12).font('Helvetica-Bold').fillColor('#111827').text('Bill To:', 300, 125);
    doc.fontSize(10).font('Helvetica').fillColor('#374151');
    doc.text(booking.customer.name, 300, 142);
    doc.text(booking.customer.phone, 300, 157);
    doc.text(booking.customer.email, 300, 172);

    doc.moveTo(50, 195).lineTo(545, 195).strokeColor('#e5e7eb').stroke();

    // Trip details
    doc.fontSize(12).font('Helvetica-Bold').fillColor('#111827').text('Trip Details', 50, 210);

    const tripRows = [
      ['Pickup Location', booking.pickup.address + ', ' + booking.pickup.city],
      ['Drop Location', booking.drop.address + ', ' + booking.drop.city],
      ['Distance', `${booking.distance || 0} km`],
      ['Truck Type', booking.truckType?.replace(/_/g, ' ').toUpperCase()],
      ['Load Weight', `${booking.loadWeight} Tonnes`],
      ['Truck Number', booking.truck?.truckNumber || 'N/A'],
    ];

    let y = 230;
    tripRows.forEach(([label, value]) => {
      doc.fontSize(10).font('Helvetica-Bold').fillColor('#6b7280').text(label + ':', 50, y);
      doc.font('Helvetica').fillColor('#111827').text(value, 200, y);
      y += 18;
    });

    doc.moveTo(50, y + 10).lineTo(545, y + 10).strokeColor('#e5e7eb').stroke();
    y += 25;

    // Amount breakdown
    doc.fontSize(12).font('Helvetica-Bold').fillColor('#111827').text('Amount Breakdown', 50, y);
    y += 20;

    const amountRows = [
      ['Transport Charges', `₹${amount.toLocaleString('en-IN')}`],
      ['GST (18%)', `₹${tax.toLocaleString('en-IN')}`],
    ];

    amountRows.forEach(([label, value]) => {
      doc.fontSize(10).font('Helvetica').fillColor('#374151').text(label, 350, y);
      doc.text(value, 460, y, { align: 'right', width: 85 });
      y += 18;
    });

    doc.moveTo(350, y).lineTo(545, y).strokeColor('#111827').stroke();
    y += 8;
    doc.fontSize(12).font('Helvetica-Bold').fillColor('#f97316');
    doc.text('Total Amount', 350, y);
    doc.text(`₹${total.toLocaleString('en-IN')}`, 460, y, { align: 'right', width: 85 });

    // Footer
    doc.fontSize(9).font('Helvetica').fillColor('#9ca3af');
    doc.text('Thank you for choosing TruckBer!', 50, 720, { align: 'center', width: 495 });
    doc.text('This is a computer-generated invoice.', 50, 735, { align: 'center', width: 495 });

    doc.end();

    await new Promise((resolve) => doc.on('end', resolve));
    const pdfBuffer = Buffer.concat(buffers);

    // Upload to Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'truckber/invoices', resource_type: 'raw', public_id: `invoice_${invoiceNumber}`, format: 'pdf' },
        (error, result) => (error ? reject(error) : resolve(result))
      );
      stream.end(pdfBuffer);
    });

    // Save invoice record
    const invoice = await Invoice.findOneAndUpdate(
      { booking: bookingId },
      {
        invoiceNumber,
        booking: bookingId,
        customer: booking.customer._id,
        truckOwner: booking.truckOwner,
        items: [{ description: 'Transport Charges', amount }, { description: 'GST (18%)', amount: tax }],
        subtotal: amount,
        tax,
        total,
        pdfUrl: uploadResult.secure_url,
        status: 'sent',
      },
      { upsert: true, new: true }
    );

    return invoice;
  } catch (error) {
    console.error('Invoice generation error:', error.message);
    throw error;
  }
};

exports.generateReport = async ({ type, startDate, endDate, format = 'pdf' }) => {
  // Returns data for report generation
  const Booking = require('../models/Booking');
  const filter = { createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) } };

  if (type === 'booking') {
    return Booking.find(filter)
      .populate('customer', 'name phone')
      .populate('truck', 'truckNumber')
      .sort({ createdAt: -1 });
  }
  if (type === 'revenue') {
    return Payment.find({ ...filter, status: 'success' })
      .populate('booking', 'bookingNumber')
      .sort({ createdAt: -1 });
  }
};
