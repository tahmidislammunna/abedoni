import express, { Request, Response } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { INITIAL_ORDERS, NOTICES, FAQ_LIST, REVIEWS_LIST } from './src/data/mockData';
import { BoardChallengeOrder, OrderStatus } from './src/types';
import { 
  OFFICIAL_FEE_PER_SUBJECT, 
  ABEDONI_PLATFORM_FEE_PER_ORDER, 
  generateFirstSmsCommand, 
  generateSecondSmsCommand,
  SSC_SUBJECTS
} from './src/data/boardsAndSubjects';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Memory store for orders (can easily be hooked to Prisma / PostgreSQL in production)
  let ordersStore: BoardChallengeOrder[] = [...INITIAL_ORDERS];

  // Helper function to map subject codes to Bangladeshi Names
  const mapSubjectNames = (codes: string[]): string[] => {
    return codes.map(code => {
      const match = SSC_SUBJECTS.find(s => s.code === code);
      return match ? match.nameBn : `বিষয় কোড: ${code}`;
    });
  };

  // --- API ROUTES ---

  // Health check
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ 
      status: 'ok', 
      app: 'আবেদনী - Abedoni', 
      service: 'SSC Board Challenge 2026', 
      ordersCount: ordersStore.length 
    });
  });

  // Get all notices
  app.get('/api/notices', (_req: Request, res: Response) => {
    res.json(NOTICES);
  });

  // Get FAQs
  app.get('/api/faqs', (_req: Request, res: Response) => {
    res.json(FAQ_LIST);
  });

  // Get Customer Reviews
  app.get('/api/reviews', (_req: Request, res: Response) => {
    res.json(REVIEWS_LIST);
  });

  // Get orders list (with search & filter)
  app.get('/api/orders', (req: Request, res: Response) => {
    const { search, status, board } = req.query;
    let result = [...ordersStore];

    if (search && typeof search === 'string') {
      const q = search.trim().toLowerCase();
      result = result.filter(o => 
        o.id.toLowerCase().includes(q) ||
        o.roll.includes(q) ||
        o.reg.includes(q) ||
        o.phone.includes(q) ||
        o.studentName.toLowerCase().includes(q) ||
        o.trxId.toLowerCase().includes(q)
      );
    }

    if (status && typeof status === 'string' && status !== 'ALL') {
      result = result.filter(o => o.orderStatus === status);
    }

    if (board && typeof board === 'string' && board !== 'ALL') {
      result = result.filter(o => o.board === board);
    }

    // Sort newest first
    result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    res.json(result);
  });

  // Get single order by ID or Roll or Phone
  app.get('/api/orders/:identifier', (req: Request, res: Response) => {
    const identifier = req.params.identifier.trim();
    const order = ordersStore.find(o => 
      o.id.toLowerCase() === identifier.toLowerCase() ||
      o.receiptId.toLowerCase() === identifier.toLowerCase() ||
      o.roll === identifier ||
      o.phone === identifier ||
      o.trxId.toLowerCase() === identifier.toLowerCase()
    );

    if (!order) {
      res.status(404).json({ error: 'আবেদনটি খুঁজে পাওয়া যায়নি। অনুগ্রহ করে সঠিক Order ID, Roll বা TrxID দিন।' });
      return;
    }

    res.json(order);
  });

  // Create new order
  app.post('/api/orders', (req: Request, res: Response) => {
    try {
      const body = req.body;
      
      if (!body.studentName || !body.roll || !body.reg || !body.board || !body.phone || !body.subjects || body.subjects.length === 0) {
        res.status(400).json({ error: 'সকল প্রয়োজনীয় ফিল্ড পূরণ করুন।' });
        return;
      }

      const randomSuffix = Math.floor(10000 + Math.random() * 90000).toString();
      const orderId = `ABD-2026-${randomSuffix}`;
      const receiptId = `RCP-${randomSuffix}`;
      const now = new Date().toISOString();

      const numSubjects = body.subjects.length;
      const officialFee = numSubjects * OFFICIAL_FEE_PER_SUBJECT;
      const platformFee = ABEDONI_PLATFORM_FEE_PER_ORDER;
      const totalFee = officialFee + platformFee;

      const smsCmd1 = generateFirstSmsCommand(body.board, body.roll, body.subjects);

      const newOrder: BoardChallengeOrder = {
        id: orderId,
        receiptId: receiptId,
        createdAt: now,
        updatedAt: now,
        studentName: body.studentName.trim(),
        fatherName: body.fatherName ? body.fatherName.trim() : '',
        motherName: body.motherName ? body.motherName.trim() : '',
        roll: body.roll.trim(),
        reg: body.reg.trim(),
        board: body.board,
        exam: body.exam || 'SSC',
        year: 2026,
        phone: body.phone.trim(),
        whatsapp: body.whatsapp ? body.whatsapp.trim() : body.phone.trim(),
        email: body.email ? body.email.trim() : '',
        subjects: body.subjects,
        subjectNamesBn: mapSubjectNames(body.subjects),
        officialFee,
        platformFee,
        totalFee,
        paymentMethod: body.paymentMethod || 'bKash',
        paymentSenderPhone: body.paymentSenderPhone ? body.paymentSenderPhone.trim() : body.phone.trim(),
        trxId: body.trxId ? body.trxId.trim().toUpperCase() : 'PENDING_TRX',
        paymentStatus: 'Reviewing',
        orderStatus: 'Pending',
        teletalkSmsCommand1: smsCmd1,
        adminNotes: 'নতুন আবেদন সাবমিট হয়েছে। Written Reviewing by Abedoni',
      };

      ordersStore.unshift(newOrder);

      res.status(201).json({
        success: true,
        message: 'আবেদন সফলভাবে গৃহীত হয়েছে!',
        order: newOrder,
      });
    } catch (err) {
      console.error('Error creating order:', err);
      res.status(500).json({ error: 'আবেদন প্রসেস করতে সাময়িক সমস্যা হয়েছে।' });
    }
  });

  // Admin update order status or PIN
  app.patch('/api/orders/:id', (req: Request, res: Response) => {
    const id = req.params.id;
    const orderIndex = ordersStore.findIndex(o => o.id === id);

    if (orderIndex === -1) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    const currentOrder = ordersStore[orderIndex];
    const { orderStatus, paymentStatus, teletalkPin, boardReply1, adminNotes } = req.body;

    let updatedSmsCmd2 = currentOrder.teletalkSmsCommand2;
    if (teletalkPin && teletalkPin.trim() !== '') {
      updatedSmsCmd2 = generateSecondSmsCommand(teletalkPin.trim(), currentOrder.phone);
    }

    const updatedOrder: BoardChallengeOrder = {
      ...currentOrder,
      updatedAt: new Date().toISOString(),
      orderStatus: orderStatus || currentOrder.orderStatus,
      paymentStatus: paymentStatus || currentOrder.paymentStatus,
      teletalkPin: teletalkPin !== undefined ? teletalkPin : currentOrder.teletalkPin,
      boardReply1: boardReply1 !== undefined ? boardReply1 : currentOrder.boardReply1,
      teletalkSmsCommand2: updatedSmsCmd2,
      adminNotes: adminNotes !== undefined ? adminNotes : currentOrder.adminNotes,
    };

    ordersStore[orderIndex] = updatedOrder;

    res.json({
      success: true,
      message: 'অর্ডার স্ট্যাটাস আপডেট হয়েছে',
      order: updatedOrder,
    });
  });

  // Export orders as CSV
  app.get('/api/export/csv', (_req: Request, res: Response) => {
    const headers = 'Order ID,Receipt ID,Student Name,Roll,Reg,Board,Subjects,Total Fee,Payment Method,TrxID,Payment Status,Order Status,Phone,Teletalk SMS 1,Teletalk PIN,Created At\n';
    
    const rows = ordersStore.map(o => {
      return [
        o.id,
        o.receiptId,
        `"${o.studentName}"`,
        o.roll,
        o.reg,
        o.board,
        `"${o.subjects.join(',')}"`,
        o.totalFee,
        o.paymentMethod,
        o.trxId,
        o.paymentStatus,
        o.orderStatus,
        o.phone,
        `"${o.teletalkSmsCommand1 || ''}"`,
        `"${o.teletalkPin || ''}"`,
        o.createdAt
      ].join(',');
    }).join('\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="Abedoni_Board_Challenge_Orders_2026.csv"');
    res.send('\uFEFF' + headers + rows); // UTF-8 BOM for Excel Bengali character compatibility
  });

  // --- VITE MIDDLEWARE SETUP ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Abedoni Platform] Server running on http://localhost:${PORT}`);
  });
}

startServer();
