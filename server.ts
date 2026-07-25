import express, { Request, Response } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { BoardChallengeOrder } from './src/types';
import { 
  OFFICIAL_FEE_PER_SUBJECT, 
  ABEDONI_PLATFORM_FEE_PER_ORDER, 
  generateFirstSmsCommand, 
  generateSecondSmsCommand,
  SSC_SUBJECTS
} from './src/data/boardsAndSubjects';
import { supabase, dbRowToOrder, orderToDbRow, fetchAppSettingsFromSupabase, saveAppSettingsToSupabase } from './src/lib/supabase';
import { DEFAULT_APP_SETTINGS } from './src/data/appSettings';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Helper function to map subject codes to Bangladeshi Names
  const mapSubjectNames = (codes: string[]): string[] => {
    return codes.map(code => {
      const match = SSC_SUBJECTS.find(s => s.code === code);
      return match ? match.nameBn : `বিষয় কোড: ${code}`;
    });
  };

  // --- API ROUTES ---

  // Health check
  app.get('/api/health', async (_req: Request, res: Response) => {
    let supabaseStatus = 'disconnected';
    let count = 0;

    try {
      const { count: dbCount, error } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true });
      if (!error && dbCount !== null) {
        supabaseStatus = 'connected';
        count = dbCount;
      }
    } catch {
      // ignore
    }

    res.json({ 
      status: 'ok', 
      app: 'আবেদনী - Abedoni', 
      service: 'SSC Board Challenge 2026', 
      database: 'Supabase PostgreSQL',
      supabaseStatus,
      ordersCount: count 
    });
  });

  // Get App Settings
  app.get('/api/settings', async (_req: Request, res: Response) => {
    try {
      const settings = await fetchAppSettingsFromSupabase();
      res.json(settings);
    } catch (err) {
      res.json(DEFAULT_APP_SETTINGS);
    }
  });

  // Update App Settings
  app.post('/api/settings', async (req: Request, res: Response) => {
    try {
      const newSettings = req.body;
      const updated = await saveAppSettingsToSupabase(newSettings);
      res.json({ success: true, settings: updated });
    } catch (err) {
      res.status(500).json({ error: 'Failed to update app settings' });
    }
  });

  // Get all notices
  app.get('/api/notices', async (_req: Request, res: Response) => {
    try {
      const { data, error } = await supabase
        .from('notices')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        const mapped = data.map(n => ({
          id: n.id,
          titleBn: n.title_bn,
          titleEn: n.title_en || '',
          date: n.date,
          category: n.category,
          contentBn: n.content_bn,
          contentEn: n.content_en || '',
          isImportant: n.is_important,
        }));
        res.json(mapped);
        return;
      }
    } catch (err) {
      console.error('Error fetching notices:', err);
    }
    res.json([]);
  });

  // Get FAQs
  app.get('/api/faqs', async (_req: Request, res: Response) => {
    try {
      const { data, error } = await supabase
        .from('faqs')
        .select('*')
        .order('id', { ascending: true });

      if (!error && data) {
        const mapped = data.map(f => ({
          questionBn: f.question_bn,
          answerBn: f.answer_bn,
          category: f.category,
        }));
        res.json(mapped);
        return;
      }
    } catch (err) {
      console.error('Error fetching faqs:', err);
    }
    res.json([]);
  });

  // Get Customer Reviews
  app.get('/api/reviews', async (_req: Request, res: Response) => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        const mapped = data.map(r => ({
          id: r.id,
          name: r.name,
          board: r.board,
          rollMasked: r.roll_masked,
          commentBn: r.comment_bn,
          rating: r.rating,
          date: r.date,
        }));
        res.json(mapped);
        return;
      }
    } catch (err) {
      console.error('Error fetching reviews:', err);
    }
    res.json([]);
  });

  // Get orders list (with search & filter)
  app.get('/api/orders', async (req: Request, res: Response) => {
    const { search, status, board } = req.query;

    try {
      let query = supabase.from('orders').select('*');

      if (status && typeof status === 'string' && status !== 'ALL') {
        query = query.eq('order_status', status);
      }

      if (board && typeof board === 'string' && board !== 'ALL') {
        query = query.eq('board', board);
      }

      query = query.order('created_at', { ascending: false });

      const { data, error } = await query;

      if (!error && data) {
        let result = data.map(dbRowToOrder);

        if (search && typeof search === 'string') {
          const q = search.trim().toLowerCase();
          result = result.filter(o => 
            o.id.toLowerCase().includes(q) ||
            o.receiptId.toLowerCase().includes(q) ||
            o.roll.includes(q) ||
            o.reg.includes(q) ||
            o.phone.includes(q) ||
            o.studentName.toLowerCase().includes(q) ||
            o.trxId.toLowerCase().includes(q)
          );
        }

        res.json(result);
        return;
      } else if (error) {
        console.error('Supabase query error in GET /api/orders:', error.message);
      }
    } catch (err) {
      console.error('Error in GET /api/orders:', err);
    }

    res.json([]);
  });

  // Get single order by ID or Roll or Phone or TrxID
  app.get('/api/orders/:identifier', async (req: Request, res: Response) => {
    const identifier = req.params.identifier.trim();

    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .or(`id.ilike.${identifier},receipt_id.ilike.${identifier},roll.eq.${identifier},phone.eq.${identifier},trx_id.ilike.${identifier}`)
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        res.json(dbRowToOrder(data[0]));
        return;
      }
    } catch (err) {
      console.error('Supabase lookup error:', err);
    }

    res.status(404).json({ error: 'আবেদনটি খুঁজে পাওয়া যায়নি। অনুগ্রহ করে সঠিক Order ID, Roll বা TrxID দিন।' });
  });

  // Create new order
  app.post('/api/orders', async (req: Request, res: Response) => {
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

      const dbRow = orderToDbRow(newOrder);
      const { error } = await supabase.from('orders').insert(dbRow);

      if (error) {
        console.error('Failed to insert order into Supabase:', error.message);
        res.status(500).json({ error: `ডাটাবেজে সংরক্ষণ করতে সমস্যা হয়েছে: ${error.message}` });
        return;
      }

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
  app.patch('/api/orders/:id', async (req: Request, res: Response) => {
    const id = req.params.id;
    const { orderStatus, paymentStatus, teletalkPin, boardReply1, adminNotes } = req.body;

    try {
      const { data, error: fetchErr } = await supabase.from('orders').select('*').eq('id', id).maybeSingle();
      if (fetchErr || !data) {
        res.status(404).json({ error: 'অর্ডারটি পাওয়া যায়নি' });
        return;
      }

      const currentOrder = dbRowToOrder(data);

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

      const dbRow = orderToDbRow(updatedOrder);
      const { error: updateErr } = await supabase.from('orders').update(dbRow).eq('id', id);

      if (updateErr) {
        res.status(500).json({ error: updateErr.message });
        return;
      }

      res.json({
        success: true,
        message: 'অর্ডার স্ট্যাটাস আপডেট হয়েছে',
        order: updatedOrder,
      });
    } catch (err) {
      res.status(500).json({ error: 'আপডেট করতে ব্যর্থ হয়েছে' });
    }
  });

  // Export orders as CSV
  app.get('/api/export/csv', async (_req: Request, res: Response) => {
    let ordersList: BoardChallengeOrder[] = [];

    try {
      const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
      if (!error && data) {
        ordersList = data.map(dbRowToOrder);
      }
    } catch (err) {
      console.error('CSV export fetch error:', err);
    }

    const headers = 'Order ID,Receipt ID,Student Name,Roll,Reg,Board,Subjects,Total Fee,Payment Method,TrxID,Payment Status,Order Status,Phone,Teletalk SMS 1,Teletalk PIN,Created At\n';
    
    const rows = ordersList.map(o => {
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
