import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 
  process.env.SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL ||
  'https://ybxquqshnghsdosqiqiu.supabase.co';

const supabaseAnonKey = 
  process.env.SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlieHF1cXNobmdoc2Rvc3FpcWl1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ5NjgxMTUsImV4cCI6MjEwMDU0NDExNX0._kV8KqLLqN2p6QzM4wzj4Jkc5_wKlP_-qozJsSVi75c';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const DEFAULT_REVIEWS = [
  {
    id: 'rev-1',
    name: 'তানজিল আহমেদ',
    board: 'ঢাকা বোর্ড',
    rollMasked: '108***',
    commentBn: 'কম্পিউটারের দোকানে গিয়ে ৩০০ টাকা অতিরিক্ত চাওয়া হয়েছিল। আবেদনীতে ঘরে বসে মাত্র ৯৯ টাকা সার্ভিস চার্জে ৫ মিনিটে ডিজিটাল রসিদ ও হোয়াটসঅ্যাপে সাবমিশন প্রুফ পেয়ে গেলাম!',
    rating: 5,
    date: '২০২৫-০৭-১৩'
  },
  {
    id: 'rev-2',
    name: 'ফারজানা আক্তার',
    board: 'চট্টগ্রাম বোর্ড',
    rollMasked: '241***',
    commentBn: 'কম্পিউটারের দোকানে লাইনে দাঁড়ানোর ঝামেলা ছাড়াই ঘরে বসে ৯৯ টাকা সার্ভিস চার্জে বোর্ড চ্যালেঞ্জ আবেদন করতে পারলাম। সাথে সাথে হোয়াটসঅ্যাপে প্রুফ ও রসিদ পেয়েছি।',
    rating: 5,
    date: '২০২৫-০৭-১৩'
  },
  {
    id: 'rev-3',
    name: 'মো: শরিফুল ইসলাম',
    board: 'রাজশাহী বোর্ড',
    rollMasked: '315***',
    commentBn: 'খুবই দ্রুত ও নির্ভরযোগ্য সার্ভিস! মাত্র ৯৯ টাকায় ৫ মিনিটে আবেদন হয়ে গেল এবং হোয়াটসঅ্যাপে কনফার্মেশন পেয়ে নিশ্চিন্ত হলাম।',
    rating: 5,
    date: '২০২৫-০৭-১৩'
  }
];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data && data.length > 0) {
      const mapped = data.map(r => ({
        id: r.id,
        name: r.name,
        board: r.board,
        rollMasked: r.roll_masked,
        commentBn: r.comment_bn,
        rating: r.rating,
        date: '২০২৫-০৭-১৩',
      }));
      return res.status(200).json(mapped);
    }
  } catch (err) {
    console.error('Error fetching reviews:', err);
  }

  return res.status(200).json(DEFAULT_REVIEWS);
}
